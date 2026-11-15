import type { MissionRequirement } from '../../game/missionGuidance'

/** Uses the existing disclosure style: details stay closed until requested. */
export default function MissionChecklist({ requirements }: { requirements: MissionRequirement[] }) {
  return (
    <details>
      <summary>
        Preparación de la misión · {requirements.filter((item) => item.complete).length}/
        {requirements.length}
      </summary>
      <ul className="debrief-notes">
        {requirements.map((item) => (
          <li key={item.id}>
            <strong>
              {item.complete ? '✓' : 'Pendiente ·'} {item.label}
            </strong>
            <p>{item.detail}</p>
          </li>
        ))}
      </ul>
    </details>
  )
}
