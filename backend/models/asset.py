from sqlalchemy import Column, Float, Integer, String

from database.db import Base


class DigitalTwinAsset(Base):
    """Persistent Unity-facing asset state; coordinates are logical scene placement."""

    __tablename__ = "digital_twin_assets"

    id = Column(String, primary_key=True)
    station_id = Column(String, index=True, nullable=False)
    asset_type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    status = Column(String, nullable=False, default="NORMAL")
    health = Column(Integer, nullable=False, default=100)
    position_x = Column(Float, nullable=False)
    position_y = Column(Float, nullable=False)
    position_z = Column(Float, nullable=False)
