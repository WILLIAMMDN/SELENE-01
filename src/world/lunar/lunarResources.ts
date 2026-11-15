export type LunarResource = {
  id: 'hielo' | 'regolito' | 'helio' | 'titanio' | 'hierro' | 'roca'
  number: string
  name: string
  tool: string
  science: string
  color: string
  position: [number, number]
  action: string
}

export const LUNAR_RESOURCES: LunarResource[] = [
  {
    id: 'hielo',
    number: '01',
    name: 'Hielo de agua',
    tool: 'Pico criogénico',
    science:
      'El hielo puede conservarse en trampas frías polares. El agua purificada serviría para beber y, mediante electrólisis, producir oxígeno e hidrógeno.',
    color: '#38bdf8',
    position: [32, 64],
    action: 'Extraer hielo',
  },
  {
    id: 'regolito',
    number: '02',
    name: 'Regolito lunar',
    tool: 'Pala de muestreo',
    science:
      'El regolito es la capa de polvo y fragmentos de roca. Compactarlo o sinterizarlo es una opción que se investiga para construir con material local.',
    color: '#e2e8f0',
    position: [21, 35],
    action: 'Recoger regolito',
  },
  {
    id: 'helio',
    number: '03',
    name: 'Helio-3',
    tool: 'Sonda y espectrómetro',
    science:
      'El viento solar implanta trazas de helio-3 en el regolito. Aquí se registra una lectura simulada. Su extracción y su uso energético siguen siendo temas de investigación.',
    color: '#4ade80',
    position: [34, 5],
    action: 'Detectar Helio-3',
  },
  {
    id: 'titanio',
    number: '04',
    name: 'Titanio (Ilmenita)',
    tool: 'Martillo geológico',
    science:
      'La ilmenita (FeTiO₃) contiene hierro, titanio y oxígeno. La muestra permite estudiar el mineral y evaluar opciones de procesamiento local.',
    color: '#a78bfa',
    position: [31, -33],
    action: 'Muestrear ilmenita',
  },
  {
    id: 'hierro',
    number: '05',
    name: 'Minerales con hierro',
    tool: 'Martillo geológico',
    science:
      'El hierro forma parte de varios minerales lunares. Recuperarlo para fabricar piezas requiere caracterizar la muestra y evaluar la energía del procesamiento.',
    color: '#fb923c',
    position: [24, -61],
    action: 'Fracturar mena',
  },
  {
    id: 'roca',
    number: '06',
    name: 'Muestra de roca',
    tool: 'Pinza y contenedor sellado',
    science:
      'Una roca sellada y etiquetada conserva el contexto de su recolección para un análisis geológico posterior. Puedes archivarla en la base o prepararla para retorno.',
    color: '#facc15',
    position: [-22, -48],
    action: 'Recoger muestra',
  },
]

export const LUNAR_GEOLOGIST: [number, number] = [46, 64]
export const LUNAR_RESOURCE_COUNT = LUNAR_RESOURCES.length
