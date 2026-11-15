import { skyStore, useSkySettings, type SkySettings } from '../../world/sky/skySettings'

export default function SkyPanel({ reduced }: { reduced: boolean }) {
  const settings = useSkySettings()
  return (
    <>
      <span className="paper-kicker">ARTEMISA / ATMÓSFERA</span>
      <h2 id="dialog-title">El cielo también cambia.</h2>
      <label className="world-setting">
        Momento del día
        <select
          value={settings.phase}
          onChange={(e) =>
            skyStore.set({ ...settings, phase: e.target.value as SkySettings['phase'] })
          }
        >
          <option value="cycle">Ciclo · 5 minutos de día y 1 de noche</option>
          <option value="day">Día</option>
          <option value="sunset">Atardecer</option>
          <option value="night">Noche</option>
        </select>
      </label>
      <label className="world-setting">
        Clima
        <select
          value={settings.weather}
          onChange={(e) =>
            skyStore.set({ ...settings, weather: e.target.value as SkySettings['weather'] })
          }
        >
          <option value="clear">Despejado</option>
          <option value="rain">Lluvia</option>
          <option value="storm">Tormenta · con destellos</option>
        </select>
      </label>
      <p>
        El ciclo avanza mientras exploras. Al abrir un panel se detiene; estas opciones se aplican
        al instante.
      </p>
      {reduced && <p>Movimiento reducido: cielo y lluvia estáticos, sin destellos.</p>}
      <small>
        Ambientación artística. El clima no cambia los requisitos ni los resultados de tu misión.
      </small>
    </>
  )
}
