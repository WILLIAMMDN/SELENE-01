import type { RefObject } from 'react'
import type { CharacterControls } from './characterMotion'
export default function CharacterActions({ controls }: { controls: RefObject<CharacterControls> }) {
  return (
    <details className="character-actions">
      <summary>Movimientos de la exploradora</summary>
      <div>
        <p>
          WASD o flechas: caminar. Shift: correr. E: usar una estación. Las puertas se abren al
          acercarte.
        </p>
        <div className="character-direction-pad">
          {[
            { key: 'KeyW', label: '↑' },
            { key: 'KeyA', label: '←' },
            { key: 'KeyS', label: '↓' },
            { key: 'KeyD', label: '→' },
          ].map((d) => (
            <button
              key={d.key}
              type="button"
              aria-label={`Mover ${d.label}`}
              onPointerDown={(e) => {
                e.preventDefault()
                e.currentTarget.setPointerCapture(e.pointerId)
                controls.current.keys.add(d.key)
              }}
              onPointerUp={() => controls.current.keys.delete(d.key)}
              onPointerCancel={() => controls.current.keys.delete(d.key)}
              onLostPointerCapture={() => controls.current.keys.delete(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            controls.current.keys.add('ShiftLeft')
          }}
          onPointerUp={() => controls.current.keys.delete('ShiftLeft')}
          onPointerCancel={() => controls.current.keys.delete('ShiftLeft')}
          onLostPointerCapture={() => controls.current.keys.delete('ShiftLeft')}
        >
          Correr · mantener
        </button>
        <button type="button" onClick={() => controls.current.actions.push('jump')}>
          Saltar · Espacio
        </button>
        <button type="button" onClick={() => controls.current.actions.push('sit')}>
          Sentarse junto a un banco · Ctrl
        </button>
        <button type="button" onClick={() => controls.current.actions.push('interact')}>
          Usar estación · E
        </button>
        <small>
          El salto usa la física del juego. El modelo no trae una animación de salto propia.
        </small>
      </div>
    </details>
  )
}
