from pydantic import BaseModel


class SimulationRequest(BaseModel):
    station: str
    scenario: str
    asset_id: str