import { missionGuidance } from '../missionGuidance'
import { loadBlueprint } from '../state/blueprintStore'
import { getMission, OBJECTIVES, missionVerified } from '../campusMission'
import type { SectorId } from '../missionTypes'

export type Conversation = {
  speaker: string
  lines: string[]
  action: string
  sector?: SectorId
  kind?: 'lander'
  source?: { label: string; url: string }
}
export const ARRIVAL: Conversation = {
  speaker: 'TARS',
  lines: [
    'Bienvenida al centro SELENE. La Dra. Vega propone diseñar un orbitador ficticio para estudiar el polo sur lunar.',
    'NASA estudia esta región con varias técnicas. Aquí elegirás una pregunta, construirás ODYSSEY, revisarás recursos y decidirás cómo recuperar sus datos.',
  ],
  action: 'Vamos al laboratorio',
  source: {
    label: 'NASA · Instrumentos de LRO',
    url: 'https://science.nasa.gov/mission/lro/spacecraft-and-instruments/',
  },
}
export function stationConversation(sector: SectorId): Conversation {
  const draft = loadBlueprint(),
    reviewed = missionVerified(draft.config, draft.parts)
  const mission = getMission(),
    selected = OBJECTIVES.find((o) => o.id === mission.objective),
    objective = selected?.name ?? 'tu pregunta científica'
  const guidance = missionGuidance(mission, draft.config, draft.parts)
  const stories: Record<SectorId, Conversation> = {
    research: {
      speaker: 'DRA. VEGA',
      lines: mission.objective
        ? [
            `El encargo elegido es ${objective.toLowerCase()}. ${selected?.question}`,
            selected?.nasaContext ?? 'Revisemos qué observación hace falta antes de diseñar.',
          ]
        : [
            'Antes de construir ODYSSEY, define qué pregunta científica intentará responder. Así podremos justificar cada instrumento y cada recurso.',
            'LRO ha cartografiado el terreno y la iluminación lunar; otros instrumentos han aportado evidencia sobre agua y hielo. Elige qué observación modelarás en esta misión.',
          ],
      action: 'Elegir el objetivo',
      sector,
      source: selected
        ? { label: selected.sourceLabel, url: selected.source }
        : {
            label: 'NASA · Instrumentos de LRO',
            url: 'https://science.nasa.gov/mission/lro/spacecraft-and-instruments/',
          },
    },
    hangar: {
      speaker: 'TARS · INGENIERÍA',
      lines: mission.objective
        ? [
            `Para ${objective.toLowerCase()}, instala el instrumento solicitado y elige una órbita con cobertura polar. Cada pieza aumenta o limita masa, potencia, datos y costo.`,
            guidance.explanation,
          ]
        : [
            'Aún no tenemos un encargo. La Dra. Vega te ayudará a elegirlo en el laboratorio; después sabremos qué necesita la nave.',
          ],
      action: mission.objective ? 'Abrir mesa de diseño' : 'Ver el encargo pendiente',
      sector,
      source: {
        label: 'NASA · Diseño de sistemas',
        url: 'https://www.nasa.gov/reference/4-0-system-design-processes/',
      },
    },
    control: {
      speaker: 'TARS · COMUNICACIONES',
      lines: [
        'Antes de autorizar el vuelo, comprueba que la nave quepa en el lanzador, disponga de potencia y pueda devolver los datos que produce.',
        guidance.explanation,
      ],
      action: 'Revisar la misión',
      sector,
      source: {
        label: 'NASA · Operaciones de LRO',
        url: 'https://science.nasa.gov/mission/lro/spacecraft-and-instruments/',
      },
    },
    launch: {
      speaker: 'TARS · LANZAMIENTO',
      lines: reviewed
        ? [
            'La configuración ya pasó la revisión educativa. Autoriza el lanzamiento simulado y decide cuándo observar, transmitir y conservar energía.',
            'La animación no reproduce una trayectoria física. El resultado dependerá de las decisiones de operación y de los datos que regresen.',
          ]
        : [
            'Todavía falta la revisión de comunicaciones. Podemos observar el lanzador, pero la misión necesita un diseño revisado antes de despegar.',
          ],
      action: 'Abrir puesto de vuelo',
      sector,
    },
    observatory: {
      speaker: 'DRA. VEGA · BITÁCORA',
      lines: mission.result
        ? [
            mission.result.status === 'failed'
              ? 'La operación se interrumpió. Revisemos qué recurso falló y qué cambiarías antes de repetir el diseño.'
              : mission.result.delivered > 0
                ? 'Llegaron datos del simulador. Compáralos con la pregunta inicial y revisa los límites de lo que podemos concluir.'
                : 'La nave terminó sus operaciones, pero no devolvió datos. La próxima vez, reserva una ventana para transmitir.',
            'Una misión se evalúa por sus objetivos y por lo que logra devolver. La puntuación de SELENE es educativa; no equivale a un hallazgo científico.',
          ]
        : [
            'Desde aquí se ve el camino que has recorrido. Cuando termine la operación lunar, traeremos aquí los resultados para decidir cómo mejorar.',
          ],
      action: mission.result ? 'Leer el informe' : 'Abrir la bitácora',
      sector,
      source: {
        label: 'NASA · Criterios de diseño de misión',
        url: 'https://www.nasa.gov/reference/4-0-system-design-processes/',
      },
    },
  }
  return stories[sector]
}
