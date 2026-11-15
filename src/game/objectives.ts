import type { InstrumentId } from './missionDesign'

export const OBJECTIVES: {
  id: InstrumentId
  name: string
  question: string
  requirement: string
  nasaContext: string
  interpretation: string
  sourceLabel: string
  source: string
}[] = [
  {
    id: 'camera',
    name: 'Cartografía del polo',
    question:
      '¿Qué rasgos del terreno y de la iluminación conviene cartografiar cerca del polo sur?',
    requirement: 'Cámara orbital y órbita polar; recuperar imágenes antes de cerrar la campaña.',
    nasaContext:
      'La cámara LROC de la misión LRO obtiene imágenes de la superficie y ayuda a estudiar la iluminación polar y los posibles peligros del terreno.',
    interpretation:
      'ODYSSEY es una nave ficticia. Su cámara representa una observación orbital; no reproduce la resolución ni los datos de LROC.',
    sourceLabel: 'NASA · Instrumentos de LRO',
    source: 'https://science.nasa.gov/mission/lro/spacecraft-and-instruments/',
  },
  {
    id: 'spectrometer',
    name: 'Composición de la superficie',
    question: '¿Qué puede sugerir el espectro de la superficie sobre sus materiales?',
    requirement:
      'Espectrómetro y órbita polar; recuperar datos para compararlos con otras observaciones.',
    nasaContext:
      'El instrumento Moon Mineralogy Mapper, desarrollado por NASA y transportado por Chandrayaan-1 de ISRO, ayudó a identificar hielo en regiones permanentemente sombreadas.',
    interpretation:
      'El espectrómetro del juego no identifica sustancias reales. Un resultado requiere datos y análisis, no solo seleccionar el instrumento.',
    sourceLabel: 'NASA · Agua y hielo lunar',
    source: 'https://science.nasa.gov/moon/moon-water-and-ices/',
  },
  {
    id: 'radar',
    name: 'Investigar señales del subsuelo',
    question: '¿Qué señales de radar merecen un estudio adicional en cráteres polares?',
    requirement:
      'Radar y órbita polar; transmitir las observaciones. Una señal aislada no demuestra que haya hielo.',
    nasaContext:
      'Mini-RF, a bordo de LRO, obtiene imágenes de radar de regiones permanentemente sombreadas y busca indicios de depósitos bajo la superficie.',
    interpretation:
      'Una señal de radar admite varias explicaciones. El informe de ODYSSEY no confirma depósitos reales de hielo.',
    sourceLabel: 'NASA · Mini-RF en LRO',
    source: 'https://science.nasa.gov/mission/lro/mini-rf/',
  },
]
