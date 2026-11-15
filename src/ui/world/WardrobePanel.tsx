import type { WorldId } from '../../world/worldConfig'
import {
  AVATAR_GESTURES,
  availableOutfits,
  chooseCharacter,
  useWardrobe,
  wardrobeStore,
} from '../../world/wardrobe'
import { CHARACTERS, characterInfo } from '../../world/characters'
import CharacterPreview from './CharacterPreview'

export default function WardrobePanel({
  world,
  onClose,
  airlock = false,
}: {
  world: WorldId
  onClose: () => void
  airlock?: boolean
}) {
  const mars = world !== 'earth'
  const wardrobe = useWardrobe()
  const selected = wardrobe[world]
  const info = characterInfo(wardrobe.character)
  return (
    <>
      <span className="paper-kicker">
        {airlock ? 'ESCLUSA / VESTUARIO' : 'TRIPULACIÓN / VESTUARIO'}
      </span>
      <h2 id="dialog-title">Tripulación lista para explorar.</h2>
      <p>
        Elige tu ropa para {world === 'moon' ? 'la Luna' : mars ? 'Ares' : 'Artemisa'}. Tu elección
        se conserva en este navegador.
      </p>
      <div className="wardrobe-mini-preview">
        <CharacterPreview
          character={wardrobe.character}
          outfit={selected}
          helmet={wardrobe.helmet}
          reduced={window.matchMedia('(prefers-reduced-motion: reduce)').matches}
        />
        <strong>{info.name}</strong>
        <small>
          Vista previa ·{' '}
          {selected === 'eva'
            ? 'Traje espacial'
            : selected === 'formal'
              ? 'Uniforme formal'
              : 'Ropa de campus'}
        </small>
      </div>
      <div className="wardrobe-choices">
        <h3>Personaje</h3>
        <div className="menu-grid">
          {CHARACTERS.map(({ id: character, name }) => (
            <button
              key={character}
              aria-pressed={wardrobe.character === character}
              onClick={() =>
                wardrobeStore.set(chooseCharacter(wardrobeStore.getSnapshot(), character))
              }
            >
              {wardrobe.character === character ? '✓ ' : ''}
              {name}
            </button>
          ))}
        </div>
        <h3>Vestimenta</h3>
        <div className="menu-grid">
          {availableOutfits(wardrobe.character, world).map(([id, label, detail]) => (
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
                {mars && id === 'classic' ? 'Astronauta clásico' : label}
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
            <h3>Prueba un gesto</h3>
            <div className="menu-grid">
              {AVATAR_GESTURES.filter(
                ([id]) => selected !== 'classic' || !['Saludar', 'MirarAlrededor'].includes(id),
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent('selene-avatar-preview', {
                        detail: {
                          name: selected === 'classic' && id === 'ReceiveHit' ? 'RecieveHit' : id,
                          target: 'wardrobe',
                        },
                      }),
                    )
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <button className="secondary-world wardrobe-return" onClick={onClose}>
        Volver a explorar →
      </button>
      <small>
        La elección se guarda al instante. Prueba los gestos en la vista previa antes de salir.
      </small>
    </>
  )
}
