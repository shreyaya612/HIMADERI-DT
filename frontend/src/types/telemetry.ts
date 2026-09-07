export interface Telemetry {
  id: number
  station: string
  asset_id: string
  temperature: number
  vibration: number
  load: number
  rpm: number
  fuel_rate: number
  timestamp: string
}