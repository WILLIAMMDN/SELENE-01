import { LUNAR_RESOURCES } from '../../world/lunar/lunarResources'
import {
  setLunarRockDisposition,
  useLunarFieldwork,
  useLunarOperations,
  useLunarSamples,
} from '../../world/lunar/lunarMissionProgress'

export default function LunarInventory() {
  const collected = useLunarSamples()
  const { rock, steps } = useLunarFieldwork()
  const prepared = useLunarOperations().includes('return')
  const hasRock = collected.includes('roca')
  return (
    <>
      <span className="paper-kicker">ALMACÉN STO-L01</span>
      <h2 id="dialog-title">Inventario de muestras</h2>
      {collected.length ? (
        <ul className="debrief-notes">
          {LUNAR_RESOURCES.filter(({ id }) => collected.includes(id)).map(({ id, name }) => (
            <li key={id}>
              <strong>{name}</strong>
              {' · '}
              {id === 'roca'
                ? prepared
                  ? 'En manifiesto L01'
                  : rock === 'archived'
                    ? 'En archivo local'
                    : rock === 'reserved'
                      ? 'Reservada para retorno'
                      : 'En equipo de campo'
                : id === 'hielo' && steps.includes('iceAnalyzed')
                  ? 'Analizado en LAB-L01'
                  : 'Registro de campo'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no hay registros. Recoge una muestra en el sendero lunar.</p>
      )}
      {hasRock && !prepared && (
        <>
          <p>
            Decide el destino de la roca. Si la reservas, confirma la carga desde la explanada L01.
          </p>
          <div className="menu-grid">
            <button
              type="button"
              aria-pressed={rock === 'archived'}
              onClick={() => setLunarRockDisposition('archived')}
            >
              Archivar en ODYSSEY
            </button>
            <button
              type="button"
              aria-pressed={rock === 'reserved'}
              onClick={() => setLunarRockDisposition('reserved')}
            >
              Reservar para retorno
            </button>
          </div>
        </>
      )}
    </>
  )
}
