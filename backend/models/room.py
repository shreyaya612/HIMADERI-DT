from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime
from datetime import datetime

from database.db import Base


class RoomState(Base):
    __tablename__ = "room_states"

    id = Column(Integer, primary_key=True, index=True)

    building_id = Column(String, index=True)
    floor_number = Column(Integer)
    room_id = Column(String, index=True)

    people_count = Column(Integer)

    co2_ppm = Column(Float)
    room_volume = Column(Float)
    ventilation_coefficient = Column(Float)

    fire_detected = Column(Boolean)
    smoke_level = Column(Float)
    temperature = Column(Float)
    risk_score = Column(Float)

    timestamp = Column(DateTime, default=datetime.utcnow)