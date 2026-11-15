import { propsClear } from './navigation/propLayout'
import { coastDistance, sceneryClear } from './environmentLayout'
import { buildingClear } from './buildingNavigation'
import { CAMPUS_TREES } from './campusLayout'
import { ODYSSEY_SIZE } from './physicalScale'
import { onGroundRoute } from '../spacecraft/boardingRoute'
import type { SectorId } from '../game/missionTypes'
export type { SectorId } from '../game/missionTypes'
export type ViewMode = 'walk' | 'map' | 'tour'
export type Sector = {
  id: SectorId
  number: string
  name: string
  short: string
  x: number
  z: number
  entry: [number, number]
  color: string
  title: string
  description: string
  detail: string
  chapter: string
}
export const SECTORS: Sector[] = [
  {
    id: 'research',
    number: '01',
    name: 'Centro de investigación',
    short: 'Investigación',
    x: -17,
    z: -3,
    entry: [-17, 5],
    color: '#c67a5f',
    title: 'Toda misión empieza con una pregunta.',
    description:
      'La Dra. Vega te recibe en el corazón del campus. Aquí se define qué queremos conocer del polo sur lunar y cómo convertir esa pregunta en una misión.',
    detail:
      'Entra por la puerta automática y acércate a la mesa científica. Allí eliges un objetivo y los requisitos que guiarán tu diseño.',
    chapter: 'LA CONVOCATORIA',
  },
  {
    id: 'hangar',
    number: '02',
    name: 'Hangar de ingeniería',
    short: 'Ingeniería',
    x: 24,
    z: -16,
    entry: [24, 1],
    color: '#457d80',
    title: 'Las grandes ideas se construyen pieza a pieza.',
    description:
      'Selecciona instrumentos, paneles y comunicaciones para tu orbitador. Cada elección tiene un coste en masa, potencia, datos y presupuesto.',
    detail:
      'Nave de ensamblaje, compuerta industrial, carros de servicio y conjunto solar. La consola abre el simulador de ingeniería existente.',
    chapter: 'EL TALLER DE LAS IDEAS',
  },
  {
    id: 'control',
    number: '03',
    name: 'Control de misión',
    short: 'Comunicaciones',
    x: -53,
    z: -32,
    entry: [-53, -25],
    color: '#7ca38b',
    title: 'Escuchar también es explorar.',
    description:
      'Desde las antenas de seguimiento, el equipo recibe información y decide cuándo investigar, transmitir o conservar energía.',
    detail:
      'Módulo de comunicaciones BASEPRI, con antena, consolas y cubierta desmontable. Las antenas son ilustrativas; no simulan seguimiento orbital real.',
    chapter: 'UNA SEÑAL DESDE LEJOS',
  },
  {
    id: 'launch',
    number: '04',
    name: 'Plataforma de lanzamiento',
    short: 'Lanzamiento',
    x: 61,
    z: -75,
    entry: [61, -33.8],
    color: '#c67a5f',
    title: 'El viaje empieza mucho antes del despegue.',
    description:
      'Verifica la misión antes de autorizar un lanzamiento simulado. El lanzador y la plataforma ODYSSEY conservan las proporciones de los archivos aportados, con materiales ilustrados y mecanismos animados.',
    detail:
      'Vehículo ficticio de 90,41 m de altura, a la misma escala uniforme que ODYSSEY. Este campus educativo no reproduce las distancias de seguridad de un complejo real.',
    chapter: 'CUENTA REGRESIVA',
  },
  {
    id: 'observatory',
    number: '05',
    name: 'Mirador del horizonte',
    short: 'Mirador',
    x: -51,
    z: 42,
    entry: [-43, 43],
    color: '#457d80',
    title: 'Un pequeño campus. Un universo por descubrir.',
    description:
      'Un lugar para mirar el cielo y entender la escala del proyecto: esta zona es el primer capítulo de un mundo conectado por destinos.',
    detail:
      'Mirador ajardinado, telescopio y observatorio de cúpula animada. La órbita lunar ya existe en la campaña; el cuaderno de este puesto conserva tus decisiones y los resultados de la misión.',
    chapter: 'EL SIGUIENTE HORIZONTE',
  },
]
export const WORLD_BOUND = 120
export const START: [number, number] = [0, 37]
export const PALETTE = {
  ink: '#26343a',
  paper: '#dce0d5',
  cream: '#ede7d3',
  teal: '#457d80',
  coral: '#c67a5f',
  sage: '#7ca38b',
  aqua: '#83ccc5',
  ground: '#55a475',
  path: '#739896',
}
export const COLLIDERS = [{ x: 61, z: -78.333, hx: 33.334, hz: 35.834 }]
export function canWalk(x: number, z: number) {
  // The guarded crew-access corridor is walkable, even inside the launch-pad perimeter.
  // The paved crew route overrides procedural terrain obstacles, never solid equipment.
  if (onGroundRoute(x, z)) return propsClear(x, z)
  return (
    propsClear(x, z) &&
    sceneryClear(x, z) &&
    buildingClear(x, z) &&
    !CAMPUS_TREES.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 0.7) &&
    Math.hypot(x - 49, z + 16) > ODYSSEY_SIZE.padCollisionRadius &&
    Math.abs(x) < WORLD_BOUND &&
    Math.abs(z) < WORLD_BOUND &&
    !COLLIDERS.some((c) => Math.abs(x - c.x) < c.hx + 0.5 && Math.abs(z - c.z) < c.hz + 0.5)
  )
}
export function groundHeight(x: number, z: number) {
  const r = Math.hypot(x, z)
  const outer = Math.max(0, Math.min(1, (r - 80) / 45))
  const padDistance = Math.max(Math.abs(x - 61) - 34, Math.abs(z + 78.333) - 37)
  const padBlend = Math.max(0, Math.min(1, padDistance / 8))
  const land = padBlend * outer * (Math.sin(x * 0.036) * Math.cos(z * 0.044) * 5 + 6)
  const coast = coastDistance(x, z),
    shore = Math.max(0, Math.min(1, (coast - 1) / 0.2))
  if (coast < 1) return -1.6 + 1.28 * Math.pow(coast, 6)
  return -0.32 + (land + 0.32) * shore * shore * (3 - 2 * shore)
}
export function nearestSector(x: number, z: number) {
  return SECTORS.map((s) => ({
    sector: s,
    distance: Math.hypot(x - s.entry[0], z - s.entry[1]),
  })).sort((a, b) => a.distance - b.distance)[0]
}
