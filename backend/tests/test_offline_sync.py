import unittest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.db import Base
from services.sync_service import (
    OFFLINE,
    ONLINE,
    PENDING,
    SYNCED,
    enqueue_event,
    get_connectivity,
    queue_if_offline,
    run_synchronization,
    set_connectivity,
)
from models.sync_queue import SyncQueueEvent


def make_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)()


class OfflineSyncTests(unittest.TestCase):
    def test_online_state_is_default_and_persisted(self):
        db = make_session()
        self.assertEqual(get_connectivity(db, "maitri").state, ONLINE)
        self.assertEqual(get_connectivity(db, "MAITRI").station_id, "MAITRI")

    def test_offline_state_is_persisted(self):
        db = make_session()
        connectivity, sync_result = set_connectivity(db, "MAITRI", OFFLINE)
        self.assertEqual(connectivity.state, OFFLINE)
        self.assertIsNone(sync_result)

    def test_queue_insertion_only_happens_while_offline(self):
        db = make_session()
        self.assertIsNone(queue_if_offline(db, "MAITRI", "TELEMETRY", {"value": 1}))
        set_connectivity(db, "MAITRI", OFFLINE)
        event = queue_if_offline(db, "MAITRI", "TELEMETRY", {"value": 1})
        self.assertIsNotNone(event)
        self.assertEqual(event.sync_status, PENDING)
        self.assertEqual(event.priority, 5)

    def test_queue_orders_lowest_priority_number_first(self):
        db = make_session()
        enqueue_event(db, "MAITRI", "ROUTINE", {}, "P5")
        emergency = enqueue_event(db, "MAITRI", "SAFETY", {}, "P0")
        enqueue_event(db, "MAITRI", "FUEL", {}, "P2")
        result = run_synchronization(db, "MAITRI")
        self.assertEqual(result["processed_event_ids"][0], emergency.id)

    def test_successful_synchronization_marks_event_synced(self):
        db = make_session()
        event = enqueue_event(db, "MAITRI", "TELEMETRY", {"value": 1}, "P5")
        result = run_synchronization(db, "MAITRI")
        db.refresh(event)
        self.assertEqual(result["synced"], 1)
        self.assertEqual(event.sync_status, SYNCED)
        self.assertEqual(event.retry_count, 0)

    def test_failed_synchronization_remains_queued_and_increments_retry(self):
        db = make_session()
        event = enqueue_event(
            db, "MAITRI", "TELEMETRY", {"_simulate_sync_failure": True}, "P5"
        )
        result = run_synchronization(db, "MAITRI")
        db.refresh(event)
        self.assertEqual(result["failed"], 1)
        self.assertEqual(event.sync_status, PENDING)
        self.assertEqual(event.retry_count, 1)

    def test_reconnect_synchronizes_durable_offline_events(self):
        db = make_session()
        set_connectivity(db, "MAITRI", OFFLINE)
        event = queue_if_offline(db, "MAITRI", "TELEMETRY", {"value": 1})
        connectivity, result = set_connectivity(db, "MAITRI", ONLINE)
        db.refresh(event)
        self.assertEqual(connectivity.state, ONLINE)
        self.assertEqual(result["synced"], 1)
        self.assertEqual(event.sync_status, SYNCED)
