import { useEffect, useRef, useState } from 'react'
import { buggy } from '../../world/buggyControl'

type Props = {
  exitBlocked?: boolean
  onExit: () => void
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  if (endAngle <= startAngle) return ''
  const p1 = polarToCartesian(cx, cy, r, startAngle)
  const p2 = polarToCartesian(cx, cy, r, endAngle)
  const diff = endAngle - startAngle
  const largeArcFlag = diff > 180 ? 1 : 0
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${r} ${r} 0 ${largeArcFlag} 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
}

export default function VehicleDashboard({ exitBlocked = false, onExit }: Props) {
  const [data, setData] = useState(() => ({
    speed: 0,
    rawSpeed: 0,
    rpm: 800,
    gear: 'N' as 'P' | 'R' | 'N' | 'D',
    steer: 0,
    distance: 0,
    power: 0,
  }))

  const smoothedRpm = useRef(800)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    let animId: number
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime.current) / 1000)
      lastTime.current = now

      const raw = buggy.speed
      const kmh = Math.abs(raw) * 3.6
      const isReverse = raw < -0.05
      const isDriving = raw > 0.05

      // Realistic electric buggy RPM simulation
      let targetRpm = 800
      if (isDriving) {
        const ratio = Math.min(1, kmh / 18)
        targetRpm = 900 + ratio * 4700 + (ratio > 0.85 ? 400 : 0)
      } else if (isReverse) {
        const ratio = Math.min(1, kmh / 7.2)
        targetRpm = 900 + ratio * 3200
      } else {
        // Idle motor subtle jitter
        targetRpm = 800 + Math.sin(now * 0.006) * 35
      }

      // Smooth RPM response
      smoothedRpm.current += (targetRpm - smoothedRpm.current) * Math.min(1, dt * 10)

      const gear: 'P' | 'R' | 'N' | 'D' = isReverse ? 'R' : isDriving ? 'D' : kmh < 0.2 ? 'N' : 'D'
      const normalizedSteer = Math.max(-1, Math.min(1, buggy.steer / 0.48))
      const power = isReverse
        ? Math.round(35 + (kmh / 7.2) * 45)
        : isDriving
          ? Math.round(25 + (kmh / 18) * 75)
          : 0

      setData({
        speed: kmh,
        rawSpeed: raw,
        rpm: Math.round(smoothedRpm.current),
        gear,
        steer: normalizedSteer,
        distance: buggy.distance,
        power,
      })

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  const { speed, rpm, gear, steer, distance, power } = data

  // Dial angles: 0 RPM = 240 deg, 7000 RPM = 480 deg (sweep 240 deg)
  const clampedRpm = Math.max(0, Math.min(7000, rpm))
  const rpmRatio = clampedRpm / 7000
  const needleAngle = 240 + rpmRatio * 240
  const activeArc = describeArc(80, 80, 56, 240, Math.max(241, needleAngle))
  const redlineArc = describeArc(80, 80, 56, 428.5, 480)
  const bgArc = describeArc(80, 80, 56, 240, 480)

  // Generate tick marks for 0..7
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const angle = 240 + (i / 7) * 240
    const outer = polarToCartesian(80, 80, 56, angle)
    const inner = polarToCartesian(80, 80, i % 2 === 0 ? 48 : 51, angle)
    const textPos = polarToCartesian(80, 80, 41, angle)
    const isRed = i >= 6
    return { i, outer, inner, textPos, isRed }
  })

  return (
    <aside className="vehicle-dashboard" aria-label="Instrumentos del buggy">
      <div className="dash-header">
        <span className="paper-kicker">BUGGY · CAMPUS SELENE</span>
        <div className="dash-status">
          <span className="live-dot" />
          <span>EV · 18 KM/H</span>
        </div>
      </div>

      <div className="dash-dial-wrap">
        <svg
          className="dash-dial"
          viewBox="0 0 160 160"
          role="img"
          aria-label={`Tacómetro ${rpm} RPM, Velocímetro ${Math.round(speed)} km/h`}
        >
          {/* Background track */}
          <path d={bgArc} fill="none" stroke="#40596030" strokeWidth="6" strokeLinecap="round" />
          {/* Redline zone (5.5k - 7k RPM) */}
          <path d={redlineArc} fill="none" stroke="#ba606180" strokeWidth="6" strokeLinecap="round" />
          {/* Active RPM progress */}
          <path
            d={activeArc}
            fill="none"
            stroke={rpm >= 5500 ? '#ba6061' : '#56878b'}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Ticks and numerals */}
          {ticks.map(({ i, outer, inner, textPos, isRed }) => (
            <g key={i}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={isRed ? '#ba6061' : '#405960'}
                strokeWidth={i % 2 === 0 ? '1.8' : '1'}
              />
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fontFamily="'Patrick Hand', cursive"
                fill={isRed ? '#ba6061' : '#34464c'}
              >
                {i}
              </text>
            </g>
          ))}

          {/* Header unit inside dial */}
          <text x="80" y="58" textAnchor="middle" className="dash-rpm-title">
            x1000 r/min
          </text>

          {/* Speed display at center bottom */}
          <text x="80" y="103" textAnchor="middle" className="dash-speed-num">
            {Math.round(speed)}
          </text>
          <text x="80" y="115" textAnchor="middle" className="dash-speed-unit">
            KM/H
          </text>

          {/* Pivot base & needle */}
          <g transform={`rotate(${needleAngle}, 80, 80)`}>
            {/* Needle shadow */}
            <polygon
              points="78.5,80 81.5,80 80.5,24 79.5,24"
              fill="#00000020"
              transform="translate(1, 1)"
            />
            {/* Needle body */}
            <polygon points="78.5,80 81.5,80 80.5,25 79.5,25" fill="#56878b" />
            {/* Coral tip */}
            <polygon points="79,38 81,38 80.5,25 79.5,25" fill="#ba6061" />
            {/* Tail */}
            <polygon points="78.5,80 81.5,80 80.5,90 79.5,90" fill="#405960" />
          </g>
          <circle cx="80" cy="80" r="6" fill="#405960" stroke="#f7f8ed" strokeWidth="1.5" />
          <circle cx="80" cy="80" r="2" fill="#f7f8ed" />
        </svg>
      </div>

      {/* Gear Selector */}
      <div className="dash-gears">
        {(['P', 'R', 'N', 'D'] as const).map((g) => (
          <span
            key={g}
            className={`dash-gear ${gear === g ? 'active' : ''} ${g === 'R' ? 'gear-r' : ''}`}
          >
            {g}
          </span>
        ))}
      </div>

      {/* Steering indicator */}
      <div className="dash-steer-bar" title="Dirección de ruedas">
        <span className="steer-label">◄ L</span>
        <div className="steer-track">
          <div className="steer-center-mark" />
          <div
            className="steer-thumb"
            style={{ left: `${Math.round(50 + steer * 42)}%` }}
          />
        </div>
        <span className="steer-label">R ►</span>
      </div>

      {/* Metrics Row: Power & Odometer */}
      <div className="dash-row">
        <div className="dash-metric">
          <span className="metric-tag">POTENCIA</span>
          <div className="power-meter">
            <div className="power-fill" style={{ width: `${power}%` }} />
          </div>
        </div>
        <div className="dash-metric">
          <span className="metric-tag">ODÓMETRO</span>
          <span className="metric-val">{Math.round(distance)} m</span>
        </div>
      </div>

      {/* Footer / Controls & Exit */}
      <div className="dash-footer">
        {exitBlocked ? (
          <div className="dash-warning">Acércate a una zona abierta para bajar.</div>
        ) : (
          <button className="dash-exit-btn" onClick={onExit} aria-label="Detenerse y bajar del buggy">
            <kbd>E</kbd> Detenerse y bajar
          </button>
        )}
        <div className="dash-keys">
          <span><kbd>W</kbd><kbd>S</kbd> Marcha</span>
          <span><kbd>A</kbd><kbd>D</kbd> Giro</span>
          <span><kbd>Esp</kbd> Freno</span>
        </div>
      </div>
    </aside>
  )
}
