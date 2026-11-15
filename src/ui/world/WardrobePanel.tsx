import type { WorldId } from '../../world/worldConfig'
import { AVATAR_GESTURES, OUTFITS, useWardrobe, wardrobeStore } from '../../world/wardrobe'

export default function WardrobePanel({ world, onClose }: { world: WorldId; onClose: () => void }) {
  const mars = world !== 'earth'
  const wardrobe = useWardrobe()
  const selected = wardrobe[world]
  return (
    <>
      <span className="paper-kicker">TRIPULACIÓN / VESTUARIO</span>
      <h2 id="dialog-title">Tripulación lista para explorar.</h2>
      <p>
        Elige tu ropa para {world === 'moon' ? 'la Luna' : mars ? 'Ares' : 'Artemisa'}. Tu elección
        se conserva en este navegador.
      </p>
      <h3>Personaje</h3>
      <div className="menu-grid">
        {(['explorer', 'pilot'] as const).map((character) => (
          <button
            key={character}
            aria-pressed={wardrobe.character === character}
            onClick={() =>
              wardrobeStore.set({
                ...wardrobe,
                character,
                mars: character === 'pilot' ? 'eva' : wardrobe.mars,
                moon: character === 'pilot' ? 'eva' : wardrobe.moon,
                earth:
                  character === 'pilot' && wardrobe.earth === 'classic' ? 'formal' : wardrobe.earth,
              })
            }
          >
            {wardrobe.character === character ? '✓ ' : ''}
            {character === 'pilot' ? 'Piloto' : 'Exploradora'}
          </button>
        ))}
      </div>
      <h3>Vestimenta</h3>
      <div className="menu-grid">
        {OUTFITS.filter(
          ([id]) =>
            (!mars || id === 'classic' || id === 'eva') &&
            !(wardrobe.character === 'pilot' && id === 'classic'),
        ).map(([id, label, detail]) => (
          <button
            key={id}
            aria-pressed={selected === id}
            onClick={() =>
              wardrobeStore.set({
                ...wardrobe,
                [world]: id,
              })
            }
          >
            <strong>
              {selected === id ? '✓ ' : ''}
              {mars && id === 'classic'
                ? 'Astronauta clásico'
                : wardrobe.character === 'pilot' && id === 'original'
                  ? 'Piloto · ropa de campus'
                  : label}
            </strong>
            <small>{mars && id === 'classic' ? 'El tripulante original de Ares.' : detail}</small>
          </button>
        ))}
      </div>
      {selected === 'eva' && (
        <label className="world-setting check-setting">
          <input
            type="checkbox"
            checked={wardrobe.helmet}
            onChange={(e) => wardrobeStore.set({ ...wardrobe, helmet: e.target.checked })}
          />
          Llevar casco
        </label>
      )}
      {(!mars || selected === 'eva') && (
        <>
          <h3>Gestos</h3>
          <div className="menu-grid">
            {AVATAR_GESTURES.filter(
              ([id]) => selected !== 'classic' || !['Saludar', 'MirarAlrededor'].includes(id),
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('selene-avatar-preview', {
                      detail: selected === 'classic' && id === 'ReceiveHit' ? 'RecieveHit' : id,
                    }),
                  )
                  onClose()
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
      <button className="secondary-world" onClick={onClose}>
        Volver a explorar →
      </button>
      <small>
        Vestimenta ilustrada de un personaje ficticio. Los gestos se interrumpen al caminar.
      </small>
    </>
  )
}
