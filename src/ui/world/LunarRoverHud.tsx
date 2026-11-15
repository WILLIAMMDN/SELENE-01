import './lunarRover.css'

export default function LunarRoverHud({
  speed,
  exitBlocked,
  onExit,
}: {
  speed: number
  exitBlocked?: boolean
  onExit: () => void
}) {
  return (
    <aside className="lunar-rover-hud" aria-label="Rover lunar">
      <span className="rover-speed">
        <strong>{Math.round(speed)}</strong> km/h
      </span>
      <span className="rover-controls">
        <kbd>W</kbd> avanzar <kbd>A</kbd> izquierda <kbd>D</kbd> derecha <kbd>Espacio</kbd> frenar
      </span>
      <button onClick={onExit} title="WASD o flechas: conducir · Espacio: frenar · E: bajar">
        <kbd>E</kbd> Bajar del rover
      </button>
      {exitBlocked && <small>Busca espacio libre para bajar.</small>}
    </aside>
  )
}
