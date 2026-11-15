import { assemblyProblems, type ModuleId } from '../spacecraft/assembly'
import { evaluateDesign, type DesignConfig } from './missionDesign'
import { missionVerified, nextMissionStep, type Mission } from './missionRules'
import type { SectorId } from './missionTypes'
import { OBJECTIVES } from './objectives'

export type MissionRequirement = {
  id: 'objective' | 'assembly' | 'instrument' | 'coverage' | 'resources' | 'review'
  label: string
  complete: boolean
  detail: string
  station: SectorId
}

/** Guidance describes existing rules; it never grants permission to launch. */
export function missionGuidance(mission: Mission, config: DesignConfig, parts: ModuleId[]) {
  const objective = OBJECTIVES.find((item) => item.id === mission.objective)
  const assembly = assemblyProblems(parts)
  const evaluation = evaluateDesign(config)
  const requirements: MissionRequirement[] = [
    {
      id: 'objective',
      label: 'Elegir una pregunta',
      complete: !!objective,
      station: 'research',
      detail:
        objective?.question ?? 'Entra al laboratorio, habla con la Dra. Vega y acepta un encargo.',
    },
    {
      id: 'assembly',
      label: 'Ensamblar la nave',
      complete: assembly.length === 0,
      station: 'hangar',
      detail: assembly[0] ?? 'Los sistemas obligatorios están instalados.',
    },
    {
      id: 'instrument',
      label: 'Instalar el instrumento del encargo',
      complete: !!objective && config.instruments.includes(objective.id),
      station: 'hangar',
      detail: objective?.requirement ?? 'El encargo indicará qué instrumento necesitas.',
    },
    {
      id: 'coverage',
      label: 'Cubrir la región polar',
      complete: config.orbit !== 'inclined',
      station: 'hangar',
      detail:
        config.orbit === 'inclined'
          ? 'Elige una órbita polar; después comprueba que tu lanzador pueda alcanzarla.'
          : 'La órbita seleccionada cubre el objetivo polar del simulador.',
    },
    {
      id: 'resources',
      label: 'Equilibrar los recursos',
      complete: evaluation.ready,
      station: 'hangar',
      detail:
        evaluation.problems[0] ??
        `Masa, potencia, enlace y presupuesto compatibles para ${evaluation.durationDays} días.`,
    },
    {
      id: 'review',
      label: 'Registrar la revisión',
      complete: missionVerified(mission, config, parts),
      station: 'control',
      detail: missionVerified(mission, config, parts)
        ? 'Esta configuración tiene una revisión vigente.'
        : mission.verified
          ? 'El diseño cambió desde la última revisión. Compruébalo de nuevo en comunicaciones.'
          : 'Lleva el diseño compatible a la terminal interior de comunicaciones.',
    },
  ]
  const next = nextMissionStep(mission, config, parts)
  const pending = requirements.find((item) => !item.complete)
  const explanation =
    pending?.detail ??
    (mission.result
      ? 'Lee el informe en el mirador. Compara los datos recuperados con la pregunta que elegiste antes de rediseñar.'
      : 'Dirígete al puesto de la plataforma. Allí puedes autorizar el vuelo o continuar una operación guardada.')
  return { objective, requirements, next, explanation }
}
