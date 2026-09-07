import unittest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.db import Base
from main import (
    IncidentCreateRequest, IncidentStatusRequest, create_station_incident,
    digital_twin_snapshot, get_active_incident_list, get_incident_by_id,
    get_incident_list, set_incident_status,
)
from models.telemetry import Telemetry
from models.sync_queue import SyncQueueEvent
from services.asset_service import get_asset
from services.sync_service import get_connectivity


def make_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)()


class IncidentModeTests(unittest.TestCase):
    def setUp(self):
        self.db = make_session()
        self.db.add(Telemetry(station="MAITRI", asset_id="MAI-GEN-02", temperature=90, vibration=.7, load=82, rpm=1450, fuel_rate=18, timestamp=datetime.utcnow()))
        self.db.commit()

    def create(self, scenario, asset_id=None):
        return create_station_incident(IncidentCreateRequest(station="MAITRI", scenario=scenario, asset_id=asset_id), self.db)

    def test_all_supported_scenarios_and_generator_state(self):
        generator = self.create("GENERATOR_FAILURE", "MAI-GEN-02")
        self.assertEqual(generator["status"], "ACTIVE")
        self.assertEqual(generator["affected_assets"], ["MAI-GEN-02"])
        asset = get_asset(self.db, "MAI-GEN-02")
        self.assertEqual((asset.status, asset.health), ("FAILED", 0))
        for scenario in ("FIRE", "BLACKOUT", "FUEL_LEAK", "BLIZZARD"):
            self.assertEqual(self.create(scenario)["incident_type"], scenario)

    def test_communication_loss_queues_local_event(self):
        incident = self.create("COMMUNICATION_LOSS")
        self.assertEqual(get_connectivity(self.db, "MAITRI").state, "OFFLINE")
        event = self.db.query(SyncQueueEvent).filter(SyncQueueEvent.event_type == "INCIDENT_CREATED").first()
        self.assertIsNotNone(event)
        self.assertEqual((event.priority, incident["id"]), (1, incident["id"]))

    def test_list_get_lifecycle_and_digital_twin(self):
        incident = self.create("FUEL_LEAK")
        self.assertEqual(len(get_incident_list("MAITRI", "ACTIVE", self.db)["incidents"]), 1)
        self.assertEqual(get_active_incident_list("MAITRI", self.db)["incidents"][0]["id"], incident["id"])
        self.assertEqual(get_incident_by_id(incident["id"], self.db)["incident_type"], "FUEL_LEAK")
        snapshot = digital_twin_snapshot("MAITRI", self.db)
        self.assertEqual(snapshot["incidents"][0]["id"], incident["id"])
        mitigated = set_incident_status(incident["id"], IncidentStatusRequest(status="MITIGATED"), self.db)
        self.assertEqual(mitigated["status"], "MITIGATED")
        # Mitigated incidents remain open for the operator's final resolution.
        self.assertEqual(get_active_incident_list("MAITRI", self.db)["incidents"][0]["status"], "MITIGATED")
        resolved = set_incident_status(incident["id"], IncidentStatusRequest(status="RESOLVED"), self.db)
        self.assertEqual(resolved["status"], "RESOLVED")
        self.assertEqual(get_active_incident_list("MAITRI", self.db)["incidents"], [])
        self.db.expire_all()
        self.assertEqual(get_incident_by_id(incident["id"], self.db)["status"], "RESOLVED")
        self.assertEqual(digital_twin_snapshot("MAITRI", self.db)["incidents"], [])

    def test_invalid_active_to_resolved_transition_is_rejected(self):
        incident = self.create("FIRE")
        with self.assertRaises(Exception) as context:
            set_incident_status(incident["id"], IncidentStatusRequest(status="RESOLVED"), self.db)
        self.assertEqual(context.exception.status_code, 422)
