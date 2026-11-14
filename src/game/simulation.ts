/**
 * Modelo educativo simplificado: los valores son índices de 0 a 100.
 * No equivalen a cálculos de ingeniería ni a datos de telemetría de NASA.
 */
export const LAST_SOL = 5
export const RESOURCE_NAMES = {
  energy: 'Energía',
  oxygen: 'Oxígeno',
  water: 'Agua',
  food: 'Alimentos',
  hull: 'Integridad',
} as const

export type Resource = keyof typeof RESOURCE_NAMES
export type Resources = Record<Resource, number>
export type Status = 'active' | 'won' | 'lost'

export interface Choice {
  id: string
  title: string
  description: string
  impact: Partial<Resources>
  explanation: string
}

export interface Event {
  sol: number
  kicker: string
  title: string
  narrative: string
  learning: string
  choices: Choice[]
}

export interface MissionState {
  sol: number
  resources: Resources
  selectedChoice: string | null
  status: Status
  history: string[]
}

export const INITIAL_RESOURCES: Resources = {
  energy: 72, oxygen: 76, water: 68, food: 74, hull: 84,
}

export const EVENTS: Event[] = [
  {
    sol: 1, kicker: '01 · ATERRIZAJE',
    title: 'El primer amanecer',
    narrative: 'La tripulación llega al polo sur lunar. El refugio funciona, pero el sistema de distribución energética aún no está equilibrado. Tu primera decisión determinará cuánto durará la base.',
    learning: 'En una base lunar, producir energía no basta: también debemos almacenarla y distribuirla.',
    choices: [
      { id: 'solar', title: 'Orientar paneles solares', description: 'Maximiza la captación, con una reparación menor.', impact: {energy: 24, hull: -3}, explanation: 'Un buen ángulo solar mejora la producción; instalar y mantener paneles también consume recursos.' },
      { id: 'reserve', title: 'Guardar energía de reserva', description: 'Prioriza seguridad y reduce otras operaciones.', impact: {energy: 12, oxygen: -5, hull: 4}, explanation: 'Reservar energía aumenta la resiliencia, pero obliga a moderar otros sistemas.' },
      { id: 'survey', title: 'Explorar la superficie', description: 'Obtén datos valiosos arriesgando recursos.', impact: {energy: -9, oxygen: -7, hull: 8}, explanation: 'Las misiones extravehiculares aportan información, pero requieren soporte vital.' },
    ],
  },
  {
    sol: 2, kicker: '02 · SOPORTE VITAL',
    title: 'Una fuga en el ciclo del agua',
    narrative: 'Los sensores indican que el sistema de reciclaje está perdiendo eficiencia. La base necesita agua para beber, cultivar alimentos y mantener algunos procesos técnicos.',
    learning: 'Reciclar y reutilizar agua es esencial cuando transportarla desde la Tierra es costoso.',
    choices: [
      { id: 'recycle', title: 'Reparar el reciclador', description: 'Recupera agua a cambio de energía.', impact: {water: 27, energy: -10, hull: 3}, explanation: 'Los circuitos cerrados reducen la necesidad de reabastecimiento.' },
      { id: 'ration', title: 'Racionar consumo', description: 'Ahorra agua, con impacto en alimentos.', impact: {water: 18, food: -9}, explanation: 'Racionar ayuda a corto plazo, pero compromete operaciones que también usan agua.' },
      { id: 'ice', title: 'Buscar hielo en el regolito', description: 'Explora depósitos; demanda energía y oxígeno.', impact: {water: 25, energy: -15, oxygen: -7}, explanation: 'El hielo lunar es un recurso potencial, pero extraerlo requiere infraestructura.' },
    ],
  },
  {
    sol: 3, kicker: '03 · SEGURIDAD',
    title: 'Alerta de radiación solar',
    narrative: 'La estación de comunicaciones detecta una perturbación solar. Tienes poco margen para reorganizar la base antes de que la tripulación deba permanecer protegida.',
    learning: 'Sin la protección de la atmósfera terrestre, las misiones lunares deben planificar refugios contra radiación.',
    choices: [
      { id: 'shelter', title: 'Cerrar el refugio protegido', description: 'Favorece la seguridad, pero consume energía.', impact: {hull: 17, energy: -14, oxygen: -3}, explanation: 'Un refugio blindado y procedimientos de emergencia pueden reducir la exposición.' },
      { id: 'shield', title: 'Reforzar con regolito', description: 'Protección más permanente, trabajo intensivo.', impact: {hull: 24, energy: -20, oxygen: -6}, explanation: 'El regolito puede formar parte de estrategias pasivas de blindaje.' },
      { id: 'risk', title: 'Mantener las operaciones', description: 'Conserva energía, pero expone la infraestructura.', impact: {energy: 10, hull: -23}, explanation: 'Continuar operaciones bajo alertas incrementa el riesgo de la misión.' },
    ],
  },
  {
    sol: 4, kicker: '04 · AGRICULTURA',
    title: 'La primera cosecha',
    narrative: 'Las plantas del invernadero presentan signos de estrés. Es momento de decidir entre invertir en el cultivo, diversificar las reservas o estudiar el problema.',
    learning: 'Producir alimentos en el espacio exige controlar iluminación, agua y nutrientes.',
    choices: [
      { id: 'grow', title: 'Potenciar el invernadero', description: 'Mejora alimentos usando agua y energía.', impact: {food: 30, energy: -10, water: -11}, explanation: 'Los cultivos controlados intercambian electricidad y agua por producción alimentaria.' },
      { id: 'stock', title: 'Abrir suministros de emergencia', description: 'Ganas alimento sin nuevas instalaciones.', impact: {food: 19, hull: -6}, explanation: 'Las reservas almacenadas son útiles, pero limitadas.' },
      { id: 'balance', title: 'Optimizar nutrientes', description: 'Mejora moderada con bajo costo.', impact: {food: 17, water: -4, energy: -3}, explanation: 'Una gestión eficiente del cultivo reduce consumos.' },
    ],
  },
  {
    sol: 5, kicker: '05 · COMUNICACIONES',
    title: 'La señal de regreso',
    narrative: 'Control de misión solicita el informe final. Antes del cierre, debes equilibrar la energía de comunicaciones, las reservas de la tripulación y la seguridad del hábitat.',
    learning: 'La supervivencia espacial depende de equilibrar varios subsistemas, no maximizar uno solo.',
    choices: [
      { id: 'report', title: 'Transmitir informe completo', description: 'Prioriza la comunicación con la Tierra.', impact: {energy: -10, hull: 8, oxygen: 3}, explanation: 'Las comunicaciones son fundamentales para el soporte y el aprendizaje de futuras misiones.' },
      { id: 'conserve', title: 'Conservar recursos y enviar resumen', description: 'Protege reservas antes del relevo.', impact: {energy: 12, water: 5, hull: -5}, explanation: 'Una estrategia conservadora deja más margen operativo.' },
      { id: 'science', title: 'Ejecutar el último experimento', description: 'Amplía hallazgos con consumo adicional.', impact: {energy: -12, water: -7, food: 6, hull: 5}, explanation: 'La ciencia aporta valor, pero debe ajustarse al presupuesto disponible.' },
    ],
  },
]

const DAILY_CONSUMPTION: Resources = {
  energy: -13, oxygen: -10, water: -8, food: -8, hull: -3,
}

const cap = (n: number) => Math.max(0, Math.min(100, n))

export function applyImpact(resources: Resources, impact: Partial<Resources>): Resources {
  return (Object.keys(resources) as Resource[]).reduce((next, key) => {
    next[key] = cap(resources[key] + (impact[key] ?? 0))
    return next
  }, {} as Resources)
}

export function initialMission(): MissionState {
  return { sol: 1, resources: { ...INITIAL_RESOURCES }, selectedChoice: null, status: 'active', history: [] }
}

export function choose(state: MissionState, choiceId: string): MissionState {
  if (state.status !== 'active' || state.selectedChoice) return state
  const event = EVENTS[state.sol - 1]
  const choice = event?.choices.find((item) => item.id === choiceId)
  if (!choice) return state
  return {
    ...state,
    selectedChoice: choice.id,
    resources: applyImpact(state.resources, choice.impact),
    history: [...state.history, `Sol ${state.sol}: ${choice.title}. ${choice.explanation}`],
  }
}

export function nextSol(state: MissionState): MissionState {
  if (state.status !== 'active' || !state.selectedChoice) return state
  const resources = applyImpact(state.resources, DAILY_CONSUMPTION)
  const exhausted = (Object.keys(resources) as Resource[]).some((key) => resources[key] <= 0)
  const final = state.sol === LAST_SOL
  return {
    ...state,
    sol: final || exhausted ? state.sol : state.sol + 1,
    resources,
    selectedChoice: null,
    status: exhausted ? 'lost' : final ? 'won' : 'active',
    history: [...state.history, exhausted ? 'La misión terminó: un recurso crítico se agotó.' : `Consumo operativo del sol ${state.sol} registrado.`],
  }
}
