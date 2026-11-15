import type { SectorId } from '../../game/missionTypes'
export type Panel =
  | 'lander'
  | 'menu'
  | 'journal'
  | 'controls'
  | 'tars'
  | 'map'
  | 'scale'
  | 'settings'
  | SectorId
  | null
export const OBJECTIVE_NAMES: Record<SectorId, string> = {
  research: 'Habla con la Dra. Vega',
  hangar: 'Construye tu nave',
  control: 'Revisa los recursos',
  launch: 'Prepara el lanzamiento',
  observatory: 'Comparte los resultados',
}
