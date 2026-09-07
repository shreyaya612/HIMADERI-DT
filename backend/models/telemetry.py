from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime

from database.db import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)

    station = Column(String, index=True)
    asset_id = Column(String, index=True)

    temperature = Column(Float)
    vibration = Column(Float)
    load = Column(Float)
    rpm = Column(Float)
    fuel_rate = Column(Float)

    timestamp = Column(DateTime, default=datetime.utcnow)