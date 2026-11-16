import { useSyncExternalStore } from 'react'
import { getLanguage, setLanguage, subscribeLanguage, type Language } from './language'
import './language.css'

export default function LanguageSwitcher() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage)
  return (
    <div className="selene-language" data-no-translate>
      <label htmlFor="selene-language-select">Language / Idioma</label>
      <select
        id="selene-language-select"
        aria-label="Language / Idioma"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  )
}
