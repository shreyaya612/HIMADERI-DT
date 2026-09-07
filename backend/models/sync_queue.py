from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from database.db import Base


class SyncQueueEvent(Base):
    """Durable local outbox for events generated while a station is offline."""

    __tablename__ = "sync_queue"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String, index=True, nullable=False)
    event_type = Column(String, nullable=False)
    payload = Column(Text, nullable=False)
    priority = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    sync_status = Column(String, default="PENDING", index=True, nullable=False)
    retry_count = Column(Integer, default=0, nullable=False)
