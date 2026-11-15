import { createMissionRouter, type RoutePoint } from './missionRoute'
import { onCampusRoad } from './missionDestination'
import { canWalk } from '../worldData'
import type { SectorId } from '../../game/missionTypes'

const route = createMissionRouter(canWalk, onCampusRoad)
self.onmessage = (
  event: MessageEvent<{ serial: number; sector: SectorId; from: RoutePoint; to: RoutePoint }>,
) => {
  const { serial, sector, from, to } = event.data
  self.postMessage({ serial, sector, path: route(from, to) })
}
