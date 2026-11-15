import { useCallback, useState } from 'react'
import { createLaunchJourney, type LaunchDestination } from '../launchJourney'
import { launchDestinationStore, useLaunchDestination } from '../state/launchDestinationStore'
import { equipForLaunch, wardrobeStore } from '../../world/wardrobe'
import { missionGuidance } from '../missionGuidance'
import { objectiveDebrief } from '../objectiveDebrief'
import { operationPreview } from '../operationFeedback'
import {
  useCampusMission,
  missionProblems,
  missionVerified,
  recordMission,
  resetCampusMission,
  blueprintKey,
} from '../campusMission'
import {
  INITIAL_DESIGN,
  evaluateDesign,
  startOperations,
  missionScore,
  type InstrumentId,
  type DesignConfig,
  type OperationChoice,
} from '../missionDesign'
import {
  INITIAL_ASSEMBLY,
  assemblyProblems,
  assemblyReady,
  toggleModule,
  type ModuleId,
} from '../../spacecraft/assembly'
import { loadBlueprint, saveBlueprint, useBlueprint } from '../state/blueprintStore'
import {
  clearOperationSession,
  loadOperationSession,
  saveOperationSession,
} from '../state/operationStore'
import { STAGES, type Stage } from '../campaignContent'
import type { Station } from '../missionTypes'

export type CampaignProps = {
  initialStage?: 'briefing' | 'design' | 'launch'
  campus?: boolean
  launchAccess?: boolean
  onReturnToCampus?: () => void
  onLaunchComplete?: (destination: LaunchDestination) => void
}

/** Owns campaign transitions and actions; presentation never writes browser storage. */
export function useMissionController({
  initialStage = 'briefing',
  campus = false,
  launchAccess = false,
  onReturnToCampus,
  onLaunchComplete,
}: CampaignProps) {
  const mission = useCampusMission()
  const { config, parts: assembly } = useBlueprint()
  const destination = useLaunchDestination()
  const [resume] = useState(() =>
    campus && launchAccess && initialStage === 'launch' && missionVerified(config, assembly)
      ? loadOperationSession(blueprintKey(config, assembly))
      : null,
  )
  const [stage, setStage] = useState<Stage>(() =>
    resume ? (resume.ops.status === 'running' ? 'operations' : 'report') : initialStage,
  )
  const [ops, setOps] = useState(() => resume?.ops ?? startOperations())
  const [launched, setLaunched] = useState(!!resume)
  const [launching, setLaunching] = useState(false)
  const [launchElapsed, setLaunchElapsed] = useState(0)
  const [journey] = useState(createLaunchJourney)
  const [exploded, setExploded] = useState(false)
  const [notification, setNotification] = useState('')
  const evaluation = evaluateDesign(config)
  const guidance = missionGuidance(mission, config, assembly)
  const debrief = objectiveDebrief(mission.objective, config, ops)
  const launchProblems = campus
    ? [
        ...missionProblems(config, assembly),
        ...(!missionVerified(config, assembly)
          ? ['Regresa a comunicaciones para registrar la revisión de esta configuración.']
          : []),
        ...(!launchAccess
          ? ['Regresa al campus y utiliza el puesto de autorización de la plataforma.']
          : []),
      ]
    : [...evaluation.problems, ...assemblyProblems(assembly)]
  const engineeringProblems = campus
    ? missionProblems(config, assembly)
    : [...evaluation.problems, ...assemblyProblems(assembly)]
  const stageIndex = STAGES.findIndex((x) => x.id === stage)
  const operateReady =
    evaluation.ready &&
    assemblyReady(assembly) &&
    (!campus || (launchAccess && missionVerified(config, assembly)))
  function resetFlight() {
    clearOperationSession()
    journey.cancel()
    setLaunching(false)
    setLaunchElapsed(0)
    setLaunched(false)
    setOps(startOperations())
  }
  function updateConfig(change: Partial<DesignConfig>) {
    resetFlight()
    const current = loadBlueprint()
    saveBlueprint({ ...current, config: { ...current.config, ...change } })
  }
  const go = (value: Stage) => {
    if (value === 'operations' && (!operateReady || !launched)) {
      setNotification('Autoriza primero un lanzamiento con un diseño válido.')
      setStage('launch')
      return
    }
    if (value === 'report' && (!launched || ops.status === 'running')) {
      setNotification('Completa las tres decisiones de operaciones antes del informe.')
      return
    }
    setNotification('')
    setStage(value)
  }
  const interact = useCallback(
    (station: Station) => {
      if (station === 'briefing') {
        setStage('briefing')
        setNotification('La Dra. Vega te espera con las instrucciones.')
      }
      if (station === 'hangar') {
        setStage('design')
        setNotification('Has entrado al hangar de ingeniería.')
      }
      if (station === 'launch') {
        setStage('launch')
        setNotification('Verifica la misión antes de lanzar.')
      }
      if (station === 'control') {
        setStage(launched ? 'operations' : 'launch')
        setNotification(
          launched
            ? 'Has entrado al centro de control.'
            : 'Autoriza el lanzamiento antes de operar la misión.',
        )
      }
    },
    [launched],
  )
  const toggleInstrument = (id: InstrumentId) => {
    const current = loadBlueprint().config
    updateConfig({
      instruments: current.instruments.includes(id)
        ? current.instruments.filter((x) => x !== id)
        : [...current.instruments, id],
    })
  }
  const assemble = (id: ModuleId) => {
    resetFlight()
    const current = loadBlueprint(),
      next = toggleModule(current.parts, id)
    saveBlueprint({
      parts: next,
      config: {
        ...current.config,
        habitat: next.includes('habitat'),
        supports: next.includes('supports'),
        solarUpgrade: next.includes('solar'),
        commUpgrade: next.includes('antenna'),
      },
    })
  }
  const fly = () => {
    if (launching) return
    if (!operateReady) {
      go('design')
      return
    }
    if (!journey.begin(destination, blueprintKey(config, assembly), operateReady)) return
    setLaunchElapsed(0)
    setLaunching(true)
    setNotification('')
  }
  /** Skipping completes the same authorized simulated launch: no alternative save path. */
  const finishLaunch = () => {
    if (!launching) return
    const arrival = journey.finish(blueprintKey(config, assembly), operateReady)
    if (!arrival) return
    const next = startOperations()
    // Persist operations for campus and standalone journeys; avoid a second launch.
    if (campus || onLaunchComplete) saveOperationSession(arrival.blueprintKey, next)
    setOps(next)
    setLaunched(true)
    setLaunching(false)
    setStage('operations')
    setNotification(
      'ODYSSEY ha completado la secuencia de lanzamiento simulado. Inicia operaciones.',
    )
    if (onLaunchComplete) {
      wardrobeStore.set(equipForLaunch(wardrobeStore.getSnapshot(), arrival.destination))
      onLaunchComplete(arrival.destination)
    }
  }
  const operate = (choice: OperationChoice) => {
    if (!launched || !operateReady) return
    const preview = operationPreview(ops, choice, evaluation)
    if (!preview) return
    const next = preview.next
    setNotification(`TARS · ${preview.summary}${preview.warning ? ` ${preview.warning}` : ''}`)
    if (campus) {
      saveOperationSession(blueprintKey(config, assembly), next)
      recordMission(next, missionScore(next, evaluation), config, assembly)
    }
    setOps(next)
  }
  const redesign = () => {
    resetFlight()
    go('design')
  }
  const restart = () => {
    if (campus) resetCampusMission()
    saveBlueprint({
      config: { ...INITIAL_DESIGN, instruments: [...INITIAL_DESIGN.instruments] },
      parts: [...INITIAL_ASSEMBLY],
    })
    resetFlight()
    setExploded(false)
    setStage('briefing')
    setNotification('')
  }
  return {
    stage,
    config,
    destination,
    setDestination: launchDestinationStore.set,
    launchDestination: journey.destination ?? destination,
    assembly,
    exploded,
    setExploded,
    ops,
    notification,
    launched,
    launching,
    launchElapsed,
    setLaunchElapsed,
    finishLaunch,
    evaluation,
    guidance,
    debrief,
    launchProblems,
    engineeringProblems,
    stageIndex,
    operateReady,
    go,
    interact,
    toggleInstrument,
    assemble,
    fly,
    operate,
    restart,
    redesign,
    updateConfig,
    campus,
    onReturnToCampus,
  }
}
export type MissionController = ReturnType<typeof useMissionController>
