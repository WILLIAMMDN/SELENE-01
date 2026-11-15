import { loadBlueprint } from '../state/blueprintStore'
import { getMission, OBJECTIVES, missionVerified } from '../campusMission'
import type { SectorId } from '../missionTypes'

export type Conversation = {
  speaker: string
  lines: string[]
  action: string
  sector?: SectorId
  kind?: 'lander'
}
export const ARRIVAL: Conversation = {
  speaker: 'TARS',
  lines: [
    'Bienvenida a Artemisa. Hoy empieza tu primera misión: enviar ODYSSEY a estudiar el polo sur de la Luna.',
    'La Dra. Vega te espera en el laboratorio. Tú decides qué investigar; yo te ayudaré a entender lo que cuesta cada elección.',
  ],
  action: 'Vamos al laboratorio',
}
export function stationConversation(sector: SectorId): Conversation {
  const draft = loadBlueprint(),
    reviewed = missionVerified(draft.config, draft.parts)
  const mission = getMission(),
    objective = OBJECTIVES.find((o) => o.id === mission.objective)?.name ?? 'tu pregunta científica'
  const stories: Record<SectorId, Conversation> = {
    research: {
      speaker: 'DRA. VEGA',
      lines: mission.objective
        ? [
            `Nuestro encargo sigue siendo: ${objective}. Puedes mantenerlo o empezar de nuevo con otra pregunta.`,
          ]
        : [
            'La Luna todavía guarda preguntas. Antes de construir una nave, necesitamos decidir qué queremos aprender.',
            'Podemos estudiar el relieve, la composición de la superficie o señales del subsuelo. Cada pregunta necesita instrumentos distintos.',
          ],
      action: 'Elegir el objetivo',
      sector,
    },
    hangar: {
      speaker: 'TARS · INGENIERÍA',
      lines: mission.objective
        ? [
            `Vamos a construir ODYSSEY para ${objective.toLowerCase()}. Elige sus piezas y el instrumento que realmente necesitas.`,
            'Más instrumentos también significan más masa, consumo, datos y coste. Decide cuánto durará la misión; después llevaremos el diseño a comunicaciones.',
          ]
        : [
            'Aún no tenemos un encargo. La Dra. Vega te ayudará a elegirlo en el laboratorio; después sabremos qué necesita la nave.',
          ],
      action: mission.objective ? 'Abrir mesa de diseño' : 'Ver el encargo pendiente',
      sector,
    },
    control: {
      speaker: 'TARS · COMUNICACIONES',
      lines: [
        'Una nave que observa, pero no devuelve sus datos, no termina su trabajo. Revisemos el enlace y los demás recursos.',
        'Esta revisión corresponde a tu configuración actual. Si cambias la nave, la órbita o la duración, tendremos que revisarla otra vez.',
      ],
      action: 'Revisar la misión',
      sector,
    },
    launch: {
      speaker: 'TARS · LANZAMIENTO',
      lines: reviewed
        ? [
            'El siguiente paso es autorizar el vuelo. Durante la misión tendrás que elegir cuándo observar, cuándo transmitir y cuándo proteger los sistemas.',
            'No hace falta una misión perfecta a la primera. Conservaremos tus decisiones para comprender qué funcionó y qué cambiar.',
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
              ? 'La operación se interrumpió. Eso también nos enseña: revisemos qué decisión agotó nuestros recursos.'
              : mission.result.delivered > 0
                ? 'Los datos ya llegaron. Ahora podemos comparar lo que esperábamos con lo que realmente conseguimos.'
                : 'La nave terminó sus operaciones, pero no devolvió datos. La próxima vez, reserva una ventana para transmitir.',
            'Una buena misión responde a su pregunta y sabe explicar sus decisiones. ¿Qué conservarías de este diseño?',
          ]
        : [
            'Desde aquí se ve el camino que has recorrido. Cuando termine la operación lunar, traeremos aquí los resultados para decidir cómo mejorar.',
          ],
      action: mission.result ? 'Leer el informe' : 'Abrir la bitácora',
      sector,
    },
  }
  return stories[sector]
}
