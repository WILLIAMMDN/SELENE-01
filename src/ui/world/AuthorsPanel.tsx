import { useEffect, useRef } from 'react'
import { SELENE_AUTHORS_DATA } from '../../game/authorsData'
import './authorsPanel.css'

type Props = { onClose: () => void }

export default function AuthorsPanel({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="authors-modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Equipo creador de SELENE-01"
    >
      <div className="authors-paper-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="speaker-tab authors-tab">EQUIPO CREADOR · SELENE-01</div>
        <button
          ref={closeRef}
          className="dialog-close authors-close"
          onClick={onClose}
          aria-label="Cerrar panel de autores"
        >
          ✕
        </button>

        <header className="authors-header">
          <span className="paper-kicker">{SELENE_AUTHORS_DATA.subtitle}</span>
          <h2 className="authors-title">{SELENE_AUTHORS_DATA.title}</h2>
          <p className="authors-lead">{SELENE_AUTHORS_DATA.tagline}</p>
          <div className="authors-statement-box">
            <p className="authors-statement">{SELENE_AUTHORS_DATA.description}</p>
          </div>
        </header>

        <div className="authors-section-heading">
          <h3>Integrantes y responsabilidades</h3>
          <small>Nombres, funciones y fotografías proporcionados por el equipo.</small>
        </div>

        <div className="authors-grid">
          {SELENE_AUTHORS_DATA.members.map((member, index) => (
            <article
              key={member.id}
              className="author-card"
              style={{ '--member-accent': member.avatarColor } as React.CSSProperties}
            >
              <div className="author-photo-slot">
                <img
                  src={`${import.meta.env.BASE_URL}${member.photo}`}
                  alt={member.name}
                  className="author-photo-img"
                  loading="lazy"
                  decoding="async"
                />
                <span className="author-badge-number">0{index + 1}</span>
              </div>
              <div className="author-body">
                <h4 className="author-name">{member.name}</h4>
                <p className="author-specialty">{member.role}</p>
              </div>
            </article>
          ))}
        </div>

        <footer className="authors-footer-section">
          <div className="nasa-ack-card">
            <h4>Fuentes científicas utilizadas en el juego</h4>
            <ul className="nasa-ack-list">
              {SELENE_AUTHORS_DATA.scienceSources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.label} ↗
                  </a>
                </li>
              ))}
            </ul>
            <p className="authors-source-note">
              Proyecto independiente inspirado en la exploración espacial; no afiliado ni avalado
              por NASA.
            </p>
          </div>
          <div className="authors-bottom-bar">
            <span className="authors-version-stamp">
              SELENE-01 · VERSIÓN EDUCATIVA · {SELENE_AUTHORS_DATA.year}
            </span>
            <button className="primary-world" onClick={onClose}>
              Volver al campus
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
