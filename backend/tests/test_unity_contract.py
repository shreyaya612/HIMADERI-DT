import unittest
from datetime import datetime
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.db import Base
from main import (
    digital_twin_snapshot,
    get_asset_state,
    get_asset_telemetry,
    get_station,
    get_station_assets,
    run_simulation,
)
from models.simulation import SimulationRequest
from models.telemetry import Telemetry
from services.asset_service import ensure_station_assets, get_asset
from services.sync_service import OFFLINE, set_connectivity


def make_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)()


class UnityContractTests(unittest.TestCase):
    def setUp(self):
        self.db = make_session()
        self.db.add(Telemetry(
            station="MAITRI", asset_id="MAI-GEN-02", temperature=90.0,
            vibration=0.72, load=82.0, rpm=1460.0, fuel_rate=18.0,
            timestamp=datetime.utcnow(),
        ))
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_get_station(self):
        result = get_station("maitri", self.db)
        self.assertEqual(result["station"], "MAITRI")
        self.assertEqual(result["asset_count"], 6)

    def test_get_station_assets_has_stable_ids_and_positions(self):
        result = get_station_assets("MAITRI", self.db)
        generator = next(asset for asset in result["assets"] if asset["id"] == "MAI-GEN-02")
        self.assertEqual(generator["type"], "GENERATOR")
        self.assertEqual(set(generator["position"]), {"x", "y", "z"})

    def test_get_asset_state(self):
        result = get_asset_state("MAI-GEN-02", self.db)
        self.assertEqual(result["station"], "MAITRI")
        self.assertIn("latest_telemetry", result)
        self.assertIn("risk", result)

    def test_get_asset_telemetry(self):
        result = get_asset_telemetry("MAI-GEN-02", self.db)
        self.assertEqual(result["asset_id"], "MAI-GEN-02")
        self.assertEqual(result["telemetry"]["temperature"], 90.0)

    def test_generator_failure_is_reflected_in_subsequent_asset_state(self):
        ensure_station_assets(self.db, "MAITRI")
        asset = get_asset(self.db, "MAI-GEN-02")
        asset.status = "WARNING"
        self.db.commit()
        with patch("services.asset_service.detect_anomaly", return_value={"risk": "MEDIUM", "health": 71}):
            before = get_asset_state("MAI-GEN-02", self.db)
            result = run_simulation(SimulationRequest(
                station="MAITRI", scenario="GENERATOR_FAILURE", asset_id="MAI-GEN-02"
            ), self.db)
            after = get_asset_state("MAI-GEN-02", self.db)
        self.assertEqual(before["status"], "WARNING")
        self.assertEqual(result["state_changes"][0], {"asset_id": "MAI-GEN-02", "status": "FAILED"})
        self.assertIn("MAI-GEN-02", result["affected_assets"])
        self.assertEqual(after["status"], "FAILED")

    def test_digital_twin_snapshot(self):
        result = digital_twin_snapshot("MAITRI", self.db)
        self.assertEqual(result["station"], "MAITRI")
        self.assertEqual(len(result["assets"]), 6)
        self.assertIn("connectivity", result)
        self.assertIn("environment", result)

    def test_offline_state_does_not_break_local_unity_apis(self):
        set_connectivity(self.db, "MAITRI", OFFLINE)
        self.assertEqual(get_station("MAITRI", self.db)["connectivity"], OFFLINE)
        self.assertEqual(get_asset_state("MAI-GEN-02", self.db)["id"], "MAI-GEN-02")
