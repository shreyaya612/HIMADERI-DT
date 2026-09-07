"""Persistent, local-first Incident Mode records."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, inspect, text

from database.db import Base

SCENARIOS = ("GENERATOR_FAILURE", "FIRE", "BLACKOUT", "FUEL_LEAK", "COMMUNICATION_LOSS", "BLIZZARD")
STATUSES = ("ACTIVE", "MITIGATED", "RESOLVED")
SOURCES = ("OPERATOR", "SIMULATION")
ALLOWED_TRANSITIONS = {"ACTIVE": {"MITIGATED"}, "MITIGATED": {"RESOLVED"}, "RESOLVED": set()}


class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String, index=True, nullable=False)
    incident_type = Column(String, index=True, nullable=False, default="")
    # Retained for compatibility with the unused first Incident Mode draft.
    scenario = Column(String, nullable=False, default="")
    severity = Column(String, nullable=False, default="HIGH")
    title = Column(String, nullable=False, default="")
    description = Column(Text, nullable=False, default="")
    status = Column(String, index=True, nullable=False, default="ACTIVE")
    source = Column(String, nullable=False, default="OPERATOR")
    affected_assets = Column(Text, nullable=False, default="[]")
    alerts = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    mitigated_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    prototype_note = Column(String, nullable=False, default="")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


def ensure_incident_schema(engine) -> None:
    """Add Incident Mode columns to databases created by the earlier draft."""
    inspector = inspect(engine)
    if "incidents" not in inspector.get_table_names():
        Base.metadata.create_all(bind=engine)
        return
    existing = {column["name"] for column in inspector.get_columns("incidents")}
    additions = {
        "incident_type": "VARCHAR NOT NULL DEFAULT ''", "title": "VARCHAR NOT NULL DEFAULT ''",
        "description": "TEXT NOT NULL DEFAULT ''", "source": "VARCHAR NOT NULL DEFAULT 'OPERATOR'",
        "alerts": "TEXT NOT NULL DEFAULT '[]'", "mitigated_at": "DATETIME", "resolved_at": "DATETIME",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in existing:
                connection.execute(text(f"ALTER TABLE incidents ADD COLUMN {name} {definition}"))
        if "incident_type" not in existing and "scenario" in existing:
            connection.execute(text("UPDATE incidents SET incident_type = scenario WHERE incident_type = ''"))
