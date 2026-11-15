import { useState, type CSSProperties, type ReactNode } from 'react'
import { CHARACTERS, characterInfo, type CharacterId } from '../../world/characters'
import { chooseCharacter, wardrobeStore } from '../../world/wardrobe'
import CharacterPreview from './CharacterPreview'
import './crew.css'

export function CharacterSelection({ onConfirm }: { onConfirm: (id: CharacterId) => void }) {
  const [selected, setSelected] = useState(wardrobeStore.getSnapshot().character)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const info = characterInfo(selected)
  const wardrobe = chooseCharacter(wardrobeStore.getSnapshot(), selected)
  const world = new URLSearchParams(window.location.search).get('world')
  const outfit = world === 'mars' || world === 'moon' ? 'eva' : wardrobe.earth
  return (
    <main className="crew-selection">
      <header className="crew-selection-header">
        <span className="crew-brand">
          SELENE<span>—01</span>
        </span>
        <span>SELENE / TRIPULACIÓN</span>
      </header>
      <section className="crew-selection-content" aria-labelledby="crew-title">
        <div className="crew-stage" style={{ '--crew-accent': info.accent } as CSSProperties}>
          <span className="crew-stage-kicker">TU COMPAÑÍA HACIA EL SIGUIENTE HORIZONTE</span>
          <CharacterPreview
            character={selected}
            outfit={outfit}
            helmet={wardrobe.helmet}
            reduced={reduced}
          />
          <div className="crew-stage-caption" aria-live="polite">
            <span>
              TRIPULANTE /{' '}
              {String(CHARACTERS.findIndex((c) => c.id === selected) + 1).padStart(2, '0')}
            </span>
            <h2>{info.name}</h2>
            <p>{info.detail}</p>
          </div>
        </div>
        <div className="crew-selection-options">
          <span className="crew-eyebrow">ANTES DE COMENZAR</span>
          <h1 id="crew-title">
            ¿Quién comienza
            <br />
            esta aventura?
          </h1>
          <p>
            Elige a tu tripulante y comienza la aventura. La ropa te espera en el vestuario de la
            esclusa de Artemisa.
          </p>
          <div className="crew-cards" role="group" aria-label="Seleccionar personaje">
            {CHARACTERS.map((character) => (
              <button
                type="button"
                key={character.id}
                className="crew-card"
                aria-pressed={selected === character.id}
                onClick={() => setSelected(character.id)}
                style={{ '--crew-accent': character.accent } as CSSProperties}
              >
                <img
                  src={`${import.meta.env.BASE_URL}${character.portrait}`}
                  alt=""
                  width="160"
                  height="200"
                />
                <span className="crew-card-label">
                  <strong>{character.name}</strong>
                  <span aria-hidden="true">{selected === character.id ? '✓' : '+'}</span>
                </span>
              </button>
            ))}
          </div>
          <button className="crew-start" type="button" onClick={() => onConfirm(selected)}>
            Explorar con {info.name} <span aria-hidden="true">↗</span>
          </button>
          <small>
            Tu elección queda guardada. Puedes volver a elegir desde Vestuario y gestos.
          </small>
        </div>
      </section>
      <footer className="crew-selection-footer">
        UNA AVENTURA DE DISEÑO, EXPLORACIÓN Y DESCUBRIMIENTO.
      </footer>
    </main>
  )
}

export default function CharacterGate({ children }: { children: ReactNode }) {
  // Confirm once per page load; travelling between worlds preserves this session.
  const [entered, setEntered] = useState(false)
  return entered ? (
    children
  ) : (
    <CharacterSelection
      onConfirm={(character) => {
        wardrobeStore.set(chooseCharacter(wardrobeStore.getSnapshot(), character))
        setEntered(true)
      }}
    />
  )
}
