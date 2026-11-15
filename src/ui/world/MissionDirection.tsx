import type { MissionGuideReport } from '../../world/navigation/missionDestination'
import './missionGuide.css'

export default function MissionDirection({ report }: { report: MissionGuideReport | null }) {
  return (
    <span className={`mission-direction ${report?.arrived ? 'is-arrived' : ''}`} aria-hidden="true">
      {report?.arrived ? (
        '✓'
      ) : report?.routed ? (
        <svg viewBox="0 0 24 24" style={{ transform: `rotate(${report.angle}rad)` }}>
          <path d="M12 4 5.5 19 12 15.5 18.5 19Z" />
        </svg>
      ) : (
        <span>·</span>
      )}
    </span>
  )
}
