import { LUNAR_RESOURCES } from './lunarResources'

type Progress = {
  samples: readonly string[]
  fieldwork: readonly ('iceAnalyzed' | 'iceSent')[]
  operations: readonly ('power' | 'telemetry' | 'traverse' | 'return')[]
}

/** One public-facing instruction shared by the HUD and the field notebook. */
export function lunarFieldGuide({ samples, fieldwork, operations }: Progress) {
  if (!samples.includes('hielo'))
    return {
      title: 'Primero: muestra de hielo',
      hint: 'Ve a la estación 01 del sendero y recoge la muestra simulada.',
    }
  if (!fieldwork.includes('iceAnalyzed'))
    return { title: 'Analiza la muestra', hint: 'Lleva el hielo a la mesa de análisis de LAB-L01.' }
  if (!operations.includes('power'))
    return {
      title: 'Prepara la energía',
      hint: 'Despliega los paneles en PWR-L01 para transmitir.',
    }
  if (!fieldwork.includes('iceSent'))
    return {
      title: 'Envía el resultado',
      hint: 'Abre la bitácora con J y transmite el análisis a control.',
    }
  const next = LUNAR_RESOURCES.find(({ id }) => !samples.includes(id))
  if (next)
    return {
      title: `Prospección ${next.number} de 06`,
      hint: `Ve a la estación ${next.number} y registra ${next.name.toLowerCase()}.`,
    }
  if (!operations.includes('traverse'))
    return {
      title: 'Prueba el rover',
      hint: 'Conduce 30 m en una salida y baja del rover para registrar la travesía.',
    }
  return {
    title: 'Informe de campo completo',
    hint: 'Revisa la bitácora. Preparar la roca para retorno es opcional.',
  }
}
