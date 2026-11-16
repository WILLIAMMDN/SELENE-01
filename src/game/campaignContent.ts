export type Stage = 'briefing' | 'design' | 'launch' | 'operations' | 'report'
export const STAGES: { id: Stage; label: string }[] = [
  { id: 'briefing', label: '01 · Pregunta' },
  { id: 'design', label: '02 · Diseña la nave' },
  { id: 'launch', label: '03 · Revisa y lanza' },
  { id: 'operations', label: '04 · Opera la nave' },
  { id: 'report', label: '05 · Resultados' },
]
export const TIPS: Record<Stage, string> = {
  briefing: 'Antes de construir, define qué quieres investigar y qué necesitarás medir.',
  design:
    'Una carga científica más compleja mejora el valor de la misión, pero requiere más masa, energía, dinero y transmisión.',
  launch: 'Comprueba que el lanzador pueda transportar tu nave y que el presupuesto no se exceda.',
  operations: 'Equilibra energía de reserva, memoria a bordo y ventanas de comunicación.',
  report: 'El resultado es una oportunidad para ajustar el diseño, no solamente una calificación.',
}
