import type { InstrumentId } from './missionDesign'

export const OBJECTIVES: {
  id: InstrumentId
  name: string
  question: string
  requirement: string
  source: string
}[] = [
  {
    id: 'camera',
    name: 'Cartografía del polo',
    question: '¿Cómo es el relieve que rodea las regiones polares?',
    requirement: 'Cámara orbital y cobertura polar.',
    source: 'https://science.nasa.gov/mission/lro/',
  },
  {
    id: 'spectrometer',
    name: 'Composición de la superficie',
    question: '¿Qué nos dice la luz reflejada sobre los materiales lunares?',
    requirement: 'Espectrómetro y cobertura polar.',
    source: 'https://science.nasa.gov/moon/moon-water-and-ices/',
  },
  {
    id: 'radar',
    name: 'Investigar señales del subsuelo',
    question: '¿Qué estructuras y posibles depósitos merecen investigarse?',
    requirement: 'Radar y cobertura polar. Una señal por sí sola no confirma hielo.',
    source:
      'https://science.nasa.gov/missions/mini-rf/nasa-radar-finds-ice-deposits-at-moons-north-pole/',
  },
]
