import { CAMPUS_ROADS, CAMPUS_BUILDINGS } from '../../world/campusLayout'
import { useWorld } from '../../world/worldConfig'
import type { PositionReport } from '../../world/ExplorerScene'
import type { SectorId } from '../../world/worldData'
export default function CampusMap({
  position,
  large = false,
  visited,
  onSelect,
}: {
  position: PositionReport
  large?: boolean
  visited: SectorId[]
  onSelect?: (id: SectorId) => void
}) {
  const world = useWorld(),
    SECTORS = world.sectors,
    factor = 240 / world.size
  const tx = (x: number) => 150 + x * factor,
    tz = (z: number) => 150 + z * factor
  return (
    <svg
      className={large ? 'campus-map large' : 'campus-map'}
      viewBox="0 0 300 300"
      role="img"
      aria-label={`Mapa de ${world.place}, ${world.size} por ${world.size} metros. Cinco destinos conectados.`}
    >
      <defs>
        <pattern
          id={large ? 'gridLarge' : 'gridSmall'}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path d="M20 0H0V20" fill="none" stroke="#a7b2a0" strokeWidth=".5" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="300" height="300" fill={world.mapColor} rx="12" />
      <rect
        x="30"
        y="30"
        width="240"
        height="240"
        fill={`url(#${large ? 'gridLarge' : 'gridSmall'})`}
        stroke="#7f9783"
        strokeDasharray="3 4"
      />
      {world.id === 'earth' && (
        <>
          <ellipse
            cx={tx(-97)}
            cy={tz(10)}
            rx={18 * factor}
            ry={40 * factor}
            fill="#74b5b1"
            stroke="#4b8783"
            strokeWidth="1"
          />
          <text x={tx(-97)} y={tz(10)} textAnchor="middle" fontSize="7" fill="#315c64">
            COSTA
          </text>
        </>
      )}
      {CAMPUS_ROADS.map((road, i) => (
        <polyline
          key={i}
          points={road.points.map(([x, z]) => `${tx(x)},${tz(z)}`).join(' ')}
          fill="none"
          stroke="#f9f1d9"
          strokeWidth={road.width * factor}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {CAMPUS_BUILDINGS.map((b) => (
        <rect
          key={b.id}
          x={tx(b.x - b.width / 2)}
          y={tz(b.z - b.depth / 2)}
          width={b.width * factor}
          height={b.depth * factor}
          fill="#8daba1"
          stroke="#526e68"
          strokeWidth=".5"
        />
      ))}
      {world.id === 'earth' && (
        <rect
          x={tx(27.667)}
          y={tz(-114.167)}
          width={66.666 * factor}
          height={71.668 * factor}
          rx="2"
          fill="#b9b9a6"
          stroke="#526e68"
          strokeDasharray="2 2"
        />
      )}
      {SECTORS.map((s) => (
        <g
          key={s.id}
          onClick={() => onSelect?.(s.id)}
          className={onSelect ? 'map-destination' : ''}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          aria-label={onSelect ? `Ver ${s.name}` : undefined}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
              e.preventDefault()
              onSelect(s.id)
            }
          }}
        >
          <rect
            x={tx(s.x) - 9}
            y={tz(s.z) - 7}
            width="18"
            height="14"
            rx="3"
            fill={s.color}
            stroke="#26343a"
            strokeWidth="1"
          />
          <circle
            cx={tx(s.entry[0])}
            cy={tz(s.entry[1])}
            r={large ? 8 : 6}
            fill={visited.includes(s.id) ? '#457d80' : '#f5efdf'}
            stroke="#26343a"
          />
          <text
            x={tx(s.entry[0])}
            y={tz(s.entry[1]) + 2.5}
            textAnchor="middle"
            fontSize={large ? 7 : 6}
            fill={visited.includes(s.id) ? '#fff' : '#26343a'}
            fontFamily="monospace"
          >
            {s.number}
          </text>
        </g>
      ))}
      <g>
        <circle
          cx={tx(world.id === 'earth' ? 87 : 61)}
          cy={tz(world.id === 'earth' ? -13 : -57)}
          r={6 * factor}
          fill="#e5dac1"
          stroke="#586e69"
        />
        <text
          x={tx(world.id === 'earth' ? 87 : 61)}
          y={tz(world.id === 'earth' ? -13 : -57) + 2}
          textAnchor="middle"
          fontSize="6"
          fill="#405c60"
        >
          L01
        </text>
      </g>
      <circle
        cx={tx(position.x)}
        cy={tz(position.z)}
        r="7"
        fill="#f7ead4"
        stroke="#c67a5f"
        strokeWidth="2"
      />
      <circle cx={tx(position.x)} cy={tz(position.z)} r="2.5" fill="#c67a5f" />
      <text x="280" y="24" fontSize="10" fill="#457d80" textAnchor="middle">
        N
      </text>
      <path d="m280 31-4 8h8Z" fill="#457d80" />
      <path d="M42 274h50m-50-3v6m50-6v6" stroke="#457d80" />
      <text x="66" y="288" fontSize="8" fill="#457d80" textAnchor="middle">
        {Math.round(50 / factor)} m
      </text>
    </svg>
  )
}
