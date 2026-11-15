import { buildingAt, INTERIOR_STATIONS, stationAt } from '../buildingNavigation'
import { CAMPUS_ROADS } from '../campusLayout'
import { canWalk } from '../worldData'
import type { SectorId } from '../../game/missionTypes'
import type { RoutePoint } from './missionRoute'

export type MissionGuideReport = {
  sector: SectorId
  angle: number
  distance: number
  arrived: boolean
  hint: string
  routed: boolean
}

export function missionDestination(sector: SectorId, player: RoutePoint) {
  const current = stationAt(player.x, player.z)
  const station =
    current?.sector === sector ? current : INTERIOR_STATIONS.find((s) => s.sector === sector)!
  const candidates: RoutePoint[] = []
  for (const radius of [0, 0.75, 1.25, 1.8, 2.2])
    for (let i = 0; i < (radius ? 16 : 1); i++) {
      const x = station.x + Math.cos((i * Math.PI) / 8) * radius,
        z = station.z + Math.sin((i * Math.PI) / 8) * radius
      if (
        canWalk(x, z) &&
        stationAt(x, z)?.sector === sector &&
        (['launch', 'observatory'].includes(station.room) || buildingAt(x, z) === station.room)
      )
        candidates.push({ x, z })
    }
  candidates.sort(
    (a, b) =>
      Math.hypot(a.x - station.x, a.z - station.z) - Math.hypot(b.x - station.x, b.z - station.z),
  )
  return { station, point: candidates[0], arrived: current?.sector === sector }
}

// Favor the authored paths, without blocking a valid route over nearby grass.
export function onCampusRoad(x: number, z: number) {
  return CAMPUS_ROADS.some((road) =>
    road.points.slice(1).some((b, i) => {
      const a = road.points[i],
        dx = b[0] - a[0],
        dz = b[1] - a[1],
        length = dx * dx + dz * dz
      const t = length ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / length)) : 0
      return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz) < road.width * 0.5
    }),
  )
}
