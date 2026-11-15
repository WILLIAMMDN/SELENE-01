import { LUNAR_SECTORS, lunarHeight, lunarCanWalk } from './lunar/lunarNavigation'
import { buildingClear } from './buildingNavigation'
import { ODYSSEY_SIZE } from './physicalScale'
import { createContext, useContext } from 'react'
import { SECTORS, START, COLLIDERS, canWalk, groundHeight, type Sector } from './worldData'
export type WorldId = 'earth' | 'mars' | 'moon'
export const MARS_SECTORS: Sector[] = [
  {
    id: 'research',
    number: '01',
    name: 'Laboratorio Ares',
    short: 'Laboratorio',
    x: -17,
    z: -3,
    entry: [-17, 5],
    color: '#9d5656',
    title: 'Una pregunta en otro planeta.',
    description:
      'Define qué quieres estudiar: las capas del terreno, el entorno o las señales de antiguos procesos geológicos. Este laboratorio es el punto de partida del sector marciano.',
    detail:
      'Exterior recorrible, entrada señalizada y espacio para futura selección de objetivos. La campaña de ingeniería actual sigue siendo lunar; este escenario no la convierte automáticamente en una misión a Marte.',
    chapter: 'OBJETIVOS CIENTÍFICOS',
  },
  {
    id: 'hangar',
    number: '02',
    name: 'Taller de superficie',
    short: 'Ingeniería',
    x: 23,
    z: 14,
    entry: [23, 21],
    color: '#457d80',
    title: 'Cada instrumento ocupa un lugar.',
    description:
      'Zona modular para preparar vehículos e instrumentos, comparar masa, potencia y capacidad de datos. El rover y las piezas actuales son provisionales y reemplazables.',
    detail:
      'Taller, paneles solares, equipo de servicio y espacio despejado para ensamblaje futuro. Las decisiones de ingeniería se consultan en la campaña existente.',
    chapter: 'DISEÑO Y RECURSOS',
  },
  {
    id: 'control',
    number: '03',
    name: 'Estación de enlace',
    short: 'Enlace',
    x: -53,
    z: -32,
    entry: [-53, -25],
    color: '#457d80',
    title: 'La ciencia necesita volver a casa.',
    description:
      'Antena y terminal de comunicaciones en una elevación. Este lugar está preparado para actividades sobre transmisión, almacenamiento y disponibilidad de energía.',
    detail:
      'Acceso por ladera suave; estación señalizada y antena original. No hay simulación de retardo ni de ventanas marcianas implementada todavía.',
    chapter: 'COMUNICACIONES',
  },
  {
    id: 'launch',
    number: '04',
    name: 'Zona de descenso',
    short: 'Descenso',
    x: 61,
    z: -57,
    entry: [61, -35],
    color: '#c67a5f',
    title: 'Llegar también es parte de la misión.',
    description:
      'Una explanada para visualizar la llegada de una misión robótica. El módulo de descenso es ficticio; no representa una nave certificada ni una simulación física de aterrizaje.',
    detail:
      'Cápsula L01 del archivo del usuario, con descenso y separación de la etapa de ascenso. Puedes reproducir sus animaciones desde el puesto del módulo.',
    chapter: 'LLEGADA Y OPERACIONES',
  },
  {
    id: 'observatory',
    number: '05',
    name: 'Mirador de los estratos',
    short: 'Estratos',
    x: -51,
    z: 42,
    entry: [-43, 43],
    color: '#9d5656',
    title: 'El paisaje guarda preguntas.',
    description:
      'Afloramientos dibujados, escalones de roca y un mirador de campo. Un lugar para futuras observaciones, comparación de imágenes y explicación de resultados.',
    detail:
      'El relieve es ficticio y diseñado para recorrerlo; no procede de un modelo de elevación de NASA. La estación muestra dónde incorporar después datos y actividades científicas.',
    chapter: 'OBSERVACIÓN Y RESULTADOS',
  },
]
export function marsHeight(x: number, z: number) {
  const terrace = 9 / (1 + Math.exp((z + 18) / 10))
  const ridge = 8 * Math.exp(-((x + 55) ** 2 / 1300 + (z - 43) ** 2 / 800))
  const crater = -6 * Math.exp(-((x - 82) ** 2 + (z - 31) ** 2) / 400)
  const waves = (Math.sin(x * 0.045) * Math.cos(z * 0.036) + Math.sin(x * 0.015 + z * 0.03)) * 0.8
  return terrace + ridge + crater + waves
}
const marsColliders = COLLIDERS.filter((c) => c.x !== 77 && c.x !== 24).map((c) =>
  c.x === 61 ? { ...c, z: -57, hx: 2.65, hz: 2.65 } : { ...c },
)
export function marsCanWalk(x: number, z: number) {
  return (
    buildingClear(x, z, 0.22, false) &&
    Math.hypot(x - 49, z + 16) > ODYSSEY_SIZE.padCollisionRadius &&
    Math.abs(x) < 160 &&
    Math.abs(z) < 160 &&
    !marsColliders.some((c) => Math.abs(x - c.x) < c.hx + 0.6 && Math.abs(z - c.z) < c.hz + 0.6)
  )
}
export const WORLDS = {
  moon: {
    id: 'moon' as const,
    name: 'Luna',
    place: 'Base lunar ODYSSEY',
    size: 300,
    sectors: LUNAR_SECTORS,
    start: [57, 66] as [number, number],
    height: lunarHeight,
    canWalk: lunarCanWalk,
    sky: '#11151f',
    mapColor: '#c5c5bb',
    title: 'Un nuevo horizonte.',
    subtitle: 'Base lunar ODYSSEY.',
    intro: 'Explora los módulos, despliega los paneles y visita la cápsula L01.',
    objective: 'Explora la base lunar',
    hint: 'Usa el mapa para recorrer la base y el terreno lunar.',
  },
  earth: {
    id: 'earth' as const,
    name: 'Tierra',
    place: 'Campus Artemisa',
    size: 240,
    sectors: SECTORS,
    start: START,
    height: groundHeight,
    canWalk,
    sky: '#68babc',
    mapColor: '#dce3cc',
    title: 'Las grandes misiones',
    subtitle: 'empiezan aquí.',
    intro: 'Un lugar para imaginar, construir y mirar un poco más lejos.',
    objective: 'Conoce a la Dra. Vega',
    hint: 'Vamos. La Dra. Vega nos espera al final del sendero.',
  },
  mars: {
    id: 'mars' as const,
    name: 'Marte',
    place: 'Sector Ares',
    size: 320,
    sectors: MARS_SECTORS,
    start: [0, 37] as [number, number],
    height: marsHeight,
    canWalk: marsCanWalk,
    sky: '#d7b6a0',
    mapColor: '#d5b197',
    title: 'Otro mundo.',
    subtitle: 'La misma curiosidad.',
    intro: 'Sigue los senderos de Ares, observa sus estratos y prepara tu próxima pregunta.',
    objective: 'Descubre el laboratorio Ares',
    hint: 'Marte está listo para explorar. Los cinco destinos reservan espacio para las etapas de una misión.',
  },
}
export const WorldContext = createContext(WORLDS.earth as (typeof WORLDS)[WorldId])
export const useWorld = () => useContext(WorldContext)
