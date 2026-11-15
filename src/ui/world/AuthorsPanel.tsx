import { useState, useRef, useEffect } from 'react'
import { SELENE_AUTHORS_DATA, type AuthorMember } from '../../game/authorsData'
import './authorsPanel.css'

type Props = {
  onClose: () => void
}

export default function AuthorsPanel({ onClose }: Props) {
  const [selectedMember, setSelectedMember] = useState<AuthorMember | null>(null)
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('selene_authors_photos')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingMemberId, setUploadingMemberId] = useState<string | null>(null)

  const handlePhotoUpload = (memberId: string) => {
    setUploadingMemberId(memberId)
    fileInputRef.current?.click()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingMemberId) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const updated = { ...customPhotos, [uploadingMemberId]: dataUrl }
      setCustomPhotos(updated)
      try {
        localStorage.setItem('selene_authors_photos', JSON.stringify(updated))
      } catch {
        /* storage limit */
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="authors-modal-scrim" onClick={onClose} role="dialog" aria-modal="true">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
      <div className="authors-paper-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header Tab */}
        <div className="speaker-tab authors-tab">
          <span>EQUIPO CREADOR · MISIÓN SELENE-01</span>
        </div>

        {/* Close Button */}
        <button
          className="dialog-close authors-close"
          onClick={onClose}
          aria-label="Cerrar panel de autores"
        >
          ✕
        </button>

        {/* Hero Banner / Project Description */}
        <header className="authors-header">
          <span className="paper-kicker">{SELENE_AUTHORS_DATA.subtitle}</span>
          <h2 className="authors-title">{SELENE_AUTHORS_DATA.title}</h2>
          <p className="authors-lead">{SELENE_AUTHORS_DATA.tagline}</p>
          <div className="authors-statement-box">
            <p className="authors-statement">{SELENE_AUTHORS_DATA.description}</p>
          </div>
        </header>

        {/* Section Title */}
        <div className="authors-section-heading">
          <h3>Integrantes del Proyecto · Créditos Oficiales</h3>
          <small>
            Haz clic en el recuadro de foto para cargar una imagen propia o explorar la ficha técnica de cada autor.
          </small>
        </div>

        {/* 6 Authors Responsive Grid */}
        <div className="authors-grid">
          {SELENE_AUTHORS_DATA.members.map((member, index) => {
            const photo = customPhotos[member.id]
            const isSelected = selectedMember?.id === member.id

            return (
              <article
                key={member.id}
                className={`author-card ${isSelected ? 'selected' : ''}`}
                style={{ '--member-accent': member.avatarColor } as React.CSSProperties}
                onClick={() => setSelectedMember(member)}
              >
                {/* Polarized Photo Slot */}
                <div
                  className="author-photo-slot"
                  title="Pulsa para cambiar o cargar fotografía"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePhotoUpload(member.id)
                  }}
                >
                  {photo ? (
                    <img src={photo} alt={member.name} className="author-photo-img" />
                  ) : (
                    <div className="author-photo-placeholder">
                      {/* Stylized Illustrated Astronaut / Engineer Avatar */}
                      <svg
                        className="author-avatar-svg"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="50" cy="50" r="46" fill="#edf0e4" stroke="#3e5158" strokeWidth="2.5" />
                        {/* Helmet / Head */}
                        <circle cx="50" cy="40" r="22" fill={member.avatarColor} stroke="#3e5158" strokeWidth="2" />
                        <ellipse cx="50" cy="42" rx="15" ry="12" fill="#30434a" />
                        <ellipse cx="46" cy="38" rx="6" ry="4" fill="#79b5ac" opacity="0.6" />
                        {/* Suit Shoulders */}
                        <path
                          d="M22 84 C26 62, 74 62, 78 84"
                          fill="#f7f7ed"
                          stroke="#3e5158"
                          strokeWidth="2.5"
                        />
                        <rect x="42" y="66" width="16" height="18" rx="3" fill="#be775d" stroke="#3e5158" strokeWidth="1.5" />
                      </svg>
                      <span className="photo-slot-label">
                        <b>📷</b> {member.photoPlaceholderText}
                      </span>
                    </div>
                  )}
                  <span className="author-badge-number">0{index + 1}</span>
                </div>

                {/* Author Info */}
                <div className="author-body">
                  <span className="author-role-tag">{member.role}</span>
                  <h4 className="author-name">{member.name}</h4>
                  <span className="author-specialty">{member.specialty}</span>

                  <ul className="author-subsystems">
                    {member.subsystems.map((sub, i) => (
                      <li key={i}>
                        <i>▹</i> {sub}
                      </li>
                    ))}
                  </ul>

                  <blockquote className="author-quote">"{member.quote}"</blockquote>
                </div>
              </article>
            )
          })}
        </div>

        {/* NASA & Open Science Acknowledgement Footer */}
        <footer className="authors-footer-section">
          <div className="nasa-ack-card">
            <h4>Fuentes Científicas & Reconocimientos</h4>
            <div className="nasa-badges-row">
              <span className="nasa-badge">NASA ARTEMIS PROGRAM</span>
              <span className="nasa-badge">GLENN RESEARCH CENTER</span>
              <span className="nasa-badge">USGS ASTROGEOLOGY</span>
              <span className="nasa-badge">OPEN SOURCE THREE.JS</span>
            </div>
            <ul className="nasa-ack-list">
              {SELENE_AUTHORS_DATA.nasaAcknowledgements.map((ack, i) => (
                <li key={i}>✓ {ack}</li>
              ))}
            </ul>
          </div>

          <div className="authors-bottom-bar">
            <span className="authors-version-stamp">
              SELENE-01 · VERSIÓN EDUCATIVA · {SELENE_AUTHORS_DATA.year}
            </span>
            <button className="primary-world" onClick={onClose}>
              Volver al Campus
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
