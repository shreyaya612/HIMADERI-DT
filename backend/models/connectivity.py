from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from database.db import Base


class StationConnectivity(Base):
    """Persisted edge-to-cloud connectivity state for a station."""

    __tablename__ = "station_connectivity"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String, unique=True, index=True, nullable=False)
    state = Column(String, nullable=False, default="ONLINE")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
