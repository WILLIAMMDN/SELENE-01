import { useEffect, useState } from 'react'
import type { Conversation } from '../../game/narrative/conversations'
import type { Panel } from './worldUiTypes'
import { LUNAR_RESOURCES } from '../../world/lunar/LunarResourcesMission'
import { LUNAR_LANDER } from '../../world/lunar/lunarNavigation'

type Props = {
  onClose: () => void
  onPanel: (p: Panel) => void
  onConversation: (c: Conversation) => void
  onTravelPoint: (point: [number, number]) => void
}

const STORAGE_KEY = 'selene_lunar_resources_collected_v1'

// Opciones para el simulador de compensaciones NASA Space Apps Challenge
type InstrumentChoice = 'optico' | 'espectro' | 'multispectral'
type PowerChoice = 'solar_fijo' | 'solar_tracking' | 'fision'
type CommChoice = 'banda_s' | 'banda_ka' | 'optico_laser'
type LaunchChoice = 'medio' | 'superpesado'

export default function LunarMissionJournal({
  onClose,
  onPanel,
  onConversation,
  onTravelPoint,
}: Props) {
  // Estado de recursos recolectados
  const [collected, setCollected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Tab activo: 'missions' (5 misiones operativas) o 'simulator' (Simulador de Compensaciones NASA)
  const [tab, setTab] = useState<'missions' | 'simulator'>('missions')

  // Estado del simulador de compensaciones NASA
  const [instrument, setInstrument] = useState<InstrumentChoice>('espectro')
  const [power, setPower] = useState<PowerChoice>('solar_tracking')
  const [comm, setComm] = useState<CommChoice>('banda_ka')
  const [launcher, setLauncher] = useState<LaunchChoice>('medio')

  // Estado del enlace de telemetría DSN simulado
  const [telemetryTested, setTelemetryTested] = useState(false)
  const [solarPanelsOpen, setSolarPanelsOpen] = useState(true)

  // Escuchar cambios en la recolección de recursos
  useEffect(() => {
    const handleCollected = (e: Event) => {
      const detail = (e as CustomEvent<string[]>).detail
      if (Array.isArray(detail)) setCollected(detail)
    }
    window.addEventListener('selene-lunar-resource-collected', handleCollected)
    return () => window.removeEventListener('selene-lunar-resource-collected', handleCollected)
  }, [])

  // Cálculo de trade-offs en el Simulador NASA
  const simData = (() => {
    // Parámetros de instrumentos
    const instSpecs = {
      optico: { mass: 20, power: 35, cost: 45, data: 12, science: 35, name: 'Cámara HD y sensor térmico' },
      espectro: { mass: 65, power: 110, cost: 110, data: 45, science: 70, name: 'Espectrómetro IR + Taladro regolito' },
      multispectral: { mass: 140, power: 260, cost: 210, data: 120, science: 98, name: 'Radar de subsuelo + Analizador de volátiles' },
    }[instrument]

    // Parámetros de energía
    const pwrSpecs = {
      solar_fijo: { mass: 70, dayPwr: 1400, nightPwr: 150, cost: 50, name: 'Paneles solares fijos + Batería Li-Ion' },
      solar_tracking: { mass: 130, dayPwr: 2800, nightPwr: 600, cost: 120, name: 'Paneles con seguimiento + Celdas regenerativas' },
      fision: { mass: 260, dayPwr: 5000, nightPwr: 5000, cost: 260, name: 'Mini-reactor Kilopower (Fisión limpia)' },
    }[power]

    // Parámetros de comunicaciones
    const commSpecs = {
      banda_s: { mass: 15, powerReq: 30, rate: 10, cost: 25, name: 'Antena Banda S (10 Mbps)' },
      banda_ka: { mass: 40, powerReq: 120, rate: 55, cost: 70, name: 'Parabólica Banda Ka a DSN (55 Mbps)' },
      optico_laser: { mass: 65, powerReq: 190, rate: 200, cost: 130, name: 'Terminal Láser TBIRD/NASA (200 Mbps)' },
    }[comm]

    // Parámetros del cohete
    const lchSpecs = {
      medio: { maxPayload: 800, budgetCap: 400, name: 'Lanzador Comercial Medio (800 kg)' },
      superpesado: { maxPayload: 1600, budgetCap: 700, name: 'Lanzador Superpesado SLS (1600 kg)' },
    }[launcher]

    // Base de la nave (estructura, soporte vital, aviónica): 480 kg, 350 W base, $150M
    const baseMass = 480
    const basePower = 350
    const baseCost = 150

    const totalMass = baseMass + instSpecs.mass + pwrSpecs.mass + commSpecs.mass
    const dayPowerCons = basePower + instSpecs.power + commSpecs.powerReq
    const dayMargin = pwrSpecs.dayPwr - dayPowerCons
    const nightMargin = pwrSpecs.nightPwr - (basePower * 0.6 + instSpecs.power * 0.3)
    const totalCost = baseCost + instSpecs.cost + pwrSpecs.cost + commSpecs.cost
    const dataDelivered = Math.min(100, Math.round((commSpecs.rate / instSpecs.data) * 100))

    // Validaciones de ingeniería NASA
    const massOk = totalMass <= lchSpecs.maxPayload
    const powerOk = dayMargin >= 0 && nightMargin >= 0
    const budgetOk = totalCost <= lchSpecs.budgetCap
    const commOk = dataDelivered >= 80

    // Puntuación global del diseño (0 a 100)
    let score = instSpecs.science
    if (!massOk) score -= 40
    if (!powerOk) score -= 30
    if (!budgetOk) score -= 25
    if (!commOk) score -= 15
    score = Math.max(10, Math.min(100, score))

    let verdict = '¡Misión espacial equilibrada y viable según los criterios de ingeniería de NASA!'
    let verdictType: 'ok' | 'warn' | 'error' = 'ok'

    if (!massOk) {
      verdict = '❌ Carga útil sobrecargada: la masa excede la capacidad del lanzador para TLI (Inyección Trans-Lunar).'
      verdictType = 'error'
    } else if (!budgetOk) {
      verdict = '❌ Presupuesto excedido: la combinación tecnológica sobrepasa el límite financiero asignado.'
      verdictType = 'error'
    } else if (!powerOk) {
      verdict = '⚠️ Déficit de potencia: la nave no resistirá la noche polar de 354 horas o entrará en apagón de subsistemas.'
      verdictType = 'warn'
    } else if (!commOk) {
      verdict = '⚠️ Cuello de botella de datos: la antena no tiene suficiente ancho de banda para transmitir los datos científicos generados.'
      verdictType = 'warn'
    }

    return {
      totalMass,
      maxPayload: lchSpecs.maxPayload,
      massOk,
      dayMargin,
      nightMargin,
      powerOk,
      totalCost,
      budgetCap: lchSpecs.budgetCap,
      budgetOk,
      dataDelivered,
      commOk,
      score,
      verdict,
      verdictType,
      instSpecs,
      pwrSpecs,
      commSpecs,
      lchSpecs,
    }
  })()

  // Diálogo interactivo con TARS enfocado en la misión lunar y los trade-offs de NASA
  const consultTars = () => {
    onClose()
    const count = collected.length
    onConversation({
      speaker: 'TARS · INGENIERO DE OPERACIONES',
      lines: [
        'Base ODYSSEY en línea. Bienvenido al Polo Sur lunar (89.9°S).',
        'El Reto NASA Space Apps nos enseña la regla de oro de la astronáutica: toda decisión tiene consecuencias. Si sumas instrumental científico pesado, te verás forzado a recortar baterías o contratar un cohete más costoso.',
        `Estado actual de prospección: ${count} de 6 recursos caracterizados. ${
          count === 6
            ? '¡Excelente trabajo geológico! Las muestras están listas para ser transferidas a la cápsula de ascenso L01.'
            : count > 0
              ? 'Buen avance en el sendero. Usa el Rover Lunar para acelerar la travesía hacia los afloramientos occidentales.'
              : 'Acércate a la Dra. Elena Silva [46, 64] o sigue las balizas luminosas a lo largo de la explanada para iniciar la extracción.'
        }`,
        'Recuerda: equilibrar masa, potencia, presupuesto, comunicaciones y retorno científico es lo que convierte un concepto teórico en una misión espacial exitosa.',
      ],
      action: '¡Entendido, TARS!',
    })
  }

  // Toggle de paneles PWR-L01
  const toggleSolarPanels = () => {
    const nextState = !solarPanelsOpen
    setSolarPanelsOpen(nextState)
    window.dispatchEvent(new CustomEvent('selene-lunar-power', { detail: nextState }))
  }

  return (
    <div className="lunar-journal-container">
      <span className="paper-kicker">BITÁCORA DE OPERACIONES · BASE ODYSSEY</span>
      <h2 id="dialog-title" style={{ margin: '6px 0 10px', fontSize: 32 }}>
        Misiones Lunares y Reto NASA
      </h2>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#4a6064' }}>
        <strong>Programa Artemisa · Polo Sur Lunar.</strong> Diseña, opera y simula la misión espacial
        resolviendo las compensaciones reales de ingeniería: masa, potencia, comunicaciones, presupuesto y retorno científico.
      </p>

      {/* Selector de pestañas */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          borderBottom: '2px solid #bdc8b6',
          paddingBottom: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setTab('missions')}
          style={{
            background: tab === 'missions' ? '#56878b' : '#f0f3e6',
            color: tab === 'missions' ? '#ffffff' : '#32474c',
            border: '1.5px solid #486168',
            borderRadius: 4,
            padding: '7px 14px',
            font: "700 15px 'Space Grotesk', sans-serif",
            cursor: 'pointer',
            boxShadow: tab === 'missions' ? '2px 2px 0 #32474c' : 'none',
          }}
        >
          📋 5 Misiones de Superficie ({collected.length}/6 Recursos)
        </button>
        <button
          type="button"
          onClick={() => setTab('simulator')}
          style={{
            background: tab === 'simulator' ? '#cf4d44' : '#f0f3e6',
            color: tab === 'simulator' ? '#ffffff' : '#32474c',
            border: '1.5px solid #486168',
            borderRadius: 4,
            padding: '7px 14px',
            font: "700 15px 'Space Grotesk', sans-serif",
            cursor: 'pointer',
            boxShadow: tab === 'simulator' ? '2px 2px 0 #32474c' : 'none',
          }}
        >
          ⚖️ Simulador de Compensaciones NASA
        </button>
      </div>

      {/* Vista de las 5 Misiones de Superficie */}
      {tab === 'missions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Misión 01: Prospección Geológica e ISRU */}
          <article
            style={{
              background: '#fcfdf8',
              border: '1.5px solid #465b60',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '3px 3px 0 #52676d',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: '#cf4d44',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    font: "700 13px 'Space Grotesk', sans-serif",
                  }}
                >
                  FASE 01
                </span>
                <strong style={{ font: "22px 'Patrick Hand', cursive", color: '#273a3e' }}>
                  Prospección Geológica e ISRU
                </strong>
              </div>
              <span
                style={{
                  background: collected.length === 6 ? '#2e6f40' : '#456a73',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 'bold',
                }}
              >
                {collected.length === 6 ? '✓ 6/6 COMPLETADO' : `${collected.length} / 6 RECOLECTADOS`}
              </span>
            </div>

            <p style={{ margin: '8px 0', fontSize: 13, lineHeight: 1.5, color: '#3f5559' }}>
              Recolecta muestras a lo largo del sendero entre Base ODYSSEY y el cráter Shackleton.
              La caracterización in-situ (ISRU) permite producir agua, oxígeno y combustible reduciendo la masa de lanzamiento terrestre.
            </p>

            {/* Cuadrícula de los 6 materiales distribuidos */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 6,
                margin: '10px 0',
              }}
            >
              {LUNAR_RESOURCES.map((r) => {
                const done = collected.includes(r.id)
                return (
                  <div
                    key={r.id}
                    style={{
                      background: done ? '#ebf5ec' : '#f0f3e8',
                      border: `1.5px solid ${done ? '#2e6f40' : '#a3b4a5'}`,
                      borderRadius: 4,
                      padding: '6px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 'bold', color: r.color }}>
                        ● {r.number}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 'bold', color: done ? '#2e6f40' : '#738a8e' }}>
                        {done ? '✓ Recogido' : 'Pendiente'}
                      </span>
                    </div>
                    <strong style={{ fontSize: 13, color: '#25373a' }}>{r.name}</strong>
                    <small style={{ fontSize: 10, color: '#566e72' }}>{r.tool}</small>
                  </div>
                )
              })}
            </div>

            <div
              style={{
                background: '#e9efdf',
                borderLeft: '3px solid #56878b',
                padding: '6px 10px',
                fontSize: 11,
                color: '#344b4e',
                margin: '8px 0',
              }}
            >
              <strong>Compensación NASA (Trade-off):</strong> Cada kilogramo de agua o regolito extraído in-situ ahorra ~$100,000 en masa de combustible y lanzamiento desde la Tierra.
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="secondary-world"
                style={{ fontSize: 14, padding: '5px 12px' }}
                onClick={() => {
                  onTravelPoint([46, 64])
                  onClose()
                }}
              >
                Ir con Dra. Elena Silva [46, 64] →
              </button>
              <button
                type="button"
                className="secondary-world"
                style={{ fontSize: 14, padding: '5px 12px' }}
                onClick={() => {
                  // Ir a la primera estación pendiente
                  const nextRes = LUNAR_RESOURCES.find((r) => !collected.includes(r.id)) ?? LUNAR_RESOURCES[0]
                  onTravelPoint(nextRes.position)
                  onClose()
                }}
              >
                Buscar estación {LUNAR_RESOURCES.find((r) => !collected.includes(r.id))?.name ?? '01'} →
              </button>
            </div>
          </article>

          {/* Misión 02: Despliegue de Red Energética PWR-L01 */}
          <article
            style={{
              background: '#fcfdf8',
              border: '1.5px solid #465b60',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '3px 3px 0 #52676d',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: '#56878b',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    font: "700 13px 'Space Grotesk', sans-serif",
                  }}
                >
                  FASE 02
                </span>
                <strong style={{ font: "22px 'Patrick Hand', cursive", color: '#273a3e' }}>
                  Red de Energía y Paneles PWR-L01
                </strong>
              </div>
              <span
                style={{
                  background: solarPanelsOpen ? '#2e6f40' : '#b0653f',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 'bold',
                }}
              >
                {solarPanelsOpen ? '2.8 kW · PANELES DESPLEGADOS' : 'MODO STANDBY (RECOGIDOS)'}
              </span>
            </div>

            <p style={{ margin: '8px 0', fontSize: 13, lineHeight: 1.5, color: '#3f5559' }}>
              La unidad PWR-L01 gestiona la energía solar en las crestas de iluminación cuasi-permanente y el almacenamiento en celdas de combustible para la noche lunar (354 horas).
            </p>

            <div
              style={{
                background: '#e9efdf',
                borderLeft: '3px solid #56878b',
                padding: '6px 10px',
                fontSize: 11,
                color: '#344b4e',
                margin: '8px 0',
              }}
            >
              <strong>Compensación NASA (Trade-off):</strong> Paneles más extensos generan más potencia pero añaden inercia, masa de lanzamiento y son susceptibles al polvo abrasivo levantado por los motores.
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="primary-world"
                style={{ fontSize: 14, padding: '5px 12px' }}
                onClick={toggleSolarPanels}
              >
                {solarPanelsOpen ? 'Recoger paneles PWR-L01 ◀' : 'Desplegar paneles PWR-L01 ▶'}
              </button>
              <button
                type="button"
                className="secondary-world"
                style={{ fontSize: 14, padding: '5px 12px' }}
                onClick={() => {
                  onTravelPoint([47.5, 73])
                  onClose()
                }}
              >
                Visitar unidad PWR-L01 [47, 78] →
              </button>
            </div>
          </article>

          {/* Misión 03: Telemetría y Enlace DSN */}
          <article
            style={{
              background: '#fcfdf8',
              border: '1.5px solid #465b60',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '3px 3px 0 #52676d',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: '#56878b',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    font: "700 13px 'Space Grotesk', sans-serif",
                  }}
                >
                  FASE 03
                </span>
                <strong style={{ font: "22px 'Patrick Hand', cursive", color: '#273a3e' }}>
                  Telemetría y Enlace DSN / Lunar Gateway
                </strong>
              </div>
              <span
                style={{
                  background: '#39787e',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 'bold',
                }}
              >
                BANDA KA · 45 MBPS
              </span>
            </div>

            <p style={{ margin: '8px 0', fontSize: 13, lineHeight: 1.5, color: '#3f5559' }}>
              Enlace de microondas de alta frecuencia (32 GHz) apuntado a la Red del Espacio Profundo de NASA (Goldstone, Robledo, Tidbinbilla) y repetidores orbitales.
            </p>

            {telemetryTested && (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  padding: '8px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  margin: '8px 0',
                  color: '#166534',
                }}
              >
                📡 <strong>Presupuesto de enlace verificado:</strong> Retardo 1.28 s · SNR +14.8 dB · Pérdida de paquetes 0.001% · Paquetes científicos listos para transmisión a centros de investigación.
              </div>
            )}

            <div
              style={{
                background: '#e9efdf',
                borderLeft: '3px solid #56878b',
                padding: '6px 10px',
                fontSize: 11,
                color: '#344b4e',
                margin: '8px 0',
              }}
            >
              <strong>Compensación NASA (Trade-off):</strong> Transmitir datos de alta resolución exige amplificadores TWT de 120W; si la potencia escasea, el equipo de Tierra debe restringir la bajada de telemetría.
            </div>

            <button
              type="button"
              className="secondary-world"
              style={{ fontSize: 14, padding: '5px 12px', marginTop: 8 }}
              onClick={() => setTelemetryTested(true)}
            >
              {telemetryTested ? '✓ Enlace DSN verificado (Repetir test)' : '📡 Comprobar telemetría y enlace DSN'}
            </button>
          </article>

          {/* Misión 04: Travesía y Operaciones del Rover Lunar */}
          <article
            style={{
              background: '#fcfdf8',
              border: '1.5px solid #465b60',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '3px 3px 0 #52676d',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: '#56878b',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    font: "700 13px 'Space Grotesk', sans-serif",
                  }}
                >
                  FASE 04
                </span>
                <strong style={{ font: "22px 'Patrick Hand', cursive", color: '#273a3e' }}>
                  Travesía y Operaciones del Rover Lunar
                </strong>
              </div>
              <span
                style={{
                  background: '#526b70',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 'bold',
                }}
              >
                VEHÍCULO EN [53, 63]
              </span>
            </div>

            <p style={{ margin: '8px 0', fontSize: 13, lineHeight: 1.5, color: '#3f5559' }}>
              El Rover Lunar presurizado cuenta con suspensión de malla metálica, tracción en las 4 ruedas y baterías térmicamente aisladas para atravesar el terreno polvoriento.
            </p>

            <div
              style={{
                background: '#e9efdf',
                borderLeft: '3px solid #56878b',
                padding: '6px 10px',
                fontSize: 11,
                color: '#344b4e',
                margin: '8px 0',
              }}
            >
              <strong>Compensación NASA (Trade-off):</strong> En gravedad de 1.62 m/s², la adherencia de las ruedas disminuye drásticamente. Velocidades mayores a 15 km/h aumentan el deslizamiento y el riesgo de volcadura en bordes de cráteres.
            </div>

            <button
              type="button"
              className="secondary-world"
              style={{ fontSize: 14, padding: '5px 12px', marginTop: 8 }}
              onClick={() => {
                onTravelPoint([53, 63])
                onClose()
              }}
            >
              Ir junto al Rover Lunar [53, 63] →
            </button>
          </article>

          {/* Misión 05: Embalaje y Retorno Científico (Cápsula L01) */}
          <article
            style={{
              background: '#fcfdf8',
              border: '1.5px solid #465b60',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '3px 3px 0 #52676d',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    background: '#cf4d44',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    font: "700 13px 'Space Grotesk', sans-serif",
                  }}
                >
                  FASE 05
                </span>
                <strong style={{ font: "22px 'Patrick Hand', cursive", color: '#273a3e' }}>
                  Embalaje y Retorno Científico (Cápsula L01)
                </strong>
              </div>
              <span
                style={{
                  background: '#6d5a48',
                  color: '#ffffff',
                  padding: '3px 9px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 'bold',
                }}
              >
                PLATAFORMA [-84, 78]
              </span>
            </div>

            <p style={{ margin: '8px 0', fontSize: 13, lineHeight: 1.5, color: '#3f5559' }}>
              Transfiere las muestras de los 6 recursos al módulo de ascenso L01. El motor de hipergólicos elevará la cápsula hacia la órbita de transferencia lunar para su regreso a la Tierra.
            </p>

            <div
              style={{
                background: '#e9efdf',
                borderLeft: '3px solid #56878b',
                padding: '6px 10px',
                fontSize: 11,
                color: '#344b4e',
                margin: '8px 0',
              }}
            >
              <strong>Compensación NASA (Trade-off):</strong> Límite de carga de retorno: 120 kg de roca y regolito. Cada kilogramo extra disminuye el margen de combustible (Δv) necesario para alcanzar la velocidad de escape lunar.
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="secondary-world"
                style={{ fontSize: 14, padding: '5px 12px' }}
                onClick={() => {
                  onTravelPoint([LUNAR_LANDER.x, LUNAR_LANDER.z + 8])
                  onClose()
                }}
              >
                Ir a la explanada de la Cápsula L01 →
              </button>
              <button
                type="button"
                className="primary-world"
                style={{ fontSize: 14, padding: '5px 12px' }}
                onClick={() => {
                  onPanel('lander')
                }}
              >
                Controlar ascenso Cápsula L01 ▶
              </button>
            </div>
          </article>
        </div>
      )}

      {/* Vista del Simulador de Compensaciones NASA Space Apps */}
      {tab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              background: '#eef3ea',
              border: '1.5px solid #6b8684',
              borderRadius: 6,
              padding: '12px 14px',
              fontSize: 13,
              color: '#2a3d40',
            }}
          >
            <strong>🎯 Objetivo del Reto NASA Space Apps:</strong> Experimenta con las decisiones de diseño de una misión espacial completa.
            Ajusta los subsistemas y evalúa en tiempo real cómo interactúan la masa, potencia, comunicaciones y presupuesto.
          </div>

          {/* Configuración de componentes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Instrumental científico */}
            <div style={{ background: '#fcfdf8', border: '1.5px solid #a4b5ad', borderRadius: 6, padding: 10 }}>
              <label style={{ font: "700 13px 'Space Grotesk', sans-serif", color: '#2d4346', display: 'block', marginBottom: 4 }}>
                🔬 Instrumental Científico
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value as InstrumentChoice)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #688285', fontSize: 12 }}
              >
                <option value="optico">Liviano: Cámara HD + Sensor Térmico (20 kg · 35W · $45M)</option>
                <option value="espectro">Equilibrado: Espectrómetro IR + Taladro (65 kg · 110W · $110M)</option>
                <option value="multispectral">Avanzado: Radar Subsuelo + Volátiles (140 kg · 260W · $210M)</option>
              </select>
            </div>

            {/* Subsistema de potencia */}
            <div style={{ background: '#fcfdf8', border: '1.5px solid #a4b5ad', borderRadius: 6, padding: 10 }}>
              <label style={{ font: "700 13px 'Space Grotesk', sans-serif", color: '#2d4346', display: 'block', marginBottom: 4 }}>
                ⚡ Subsistema de Energía
              </label>
              <select
                value={power}
                onChange={(e) => setPower(e.target.value as PowerChoice)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #688285', fontSize: 12 }}
              >
                <option value="solar_fijo">Solar Estándar: Paneles Fijos + Li-Ion (70 kg · 1.4 kW día · $50M)</option>
                <option value="solar_tracking">Matriz Tracking + Celdas Regenerativas (130 kg · 2.8 kW día · $120M)</option>
                <option value="fision">Mini-reactor Kilopower (260 kg · 5 kW continuo día/noche · $260M)</option>
              </select>
            </div>

            {/* Antena y Comunicaciones */}
            <div style={{ background: '#fcfdf8', border: '1.5px solid #a4b5ad', borderRadius: 6, padding: 10 }}>
              <label style={{ font: "700 13px 'Space Grotesk', sans-serif", color: '#2d4346', display: 'block', marginBottom: 4 }}>
                📡 Comunicaciones a DSN
              </label>
              <select
                value={comm}
                onChange={(e) => setComm(e.target.value as CommChoice)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #688285', fontSize: 12 }}
              >
                <option value="banda_s">Antena Banda S (15 kg · 30W · 10 Mbps · $25M)</option>
                <option value="banda_ka">Parabólica Banda Ka (40 kg · 120W · 55 Mbps · $70M)</option>
                <option value="optico_laser">Terminal Láser TBIRD (65 kg · 190W · 200 Mbps · $130M)</option>
              </select>
            </div>

            {/* Vehículo de lanzamiento */}
            <div style={{ background: '#fcfdf8', border: '1.5px solid #a4b5ad', borderRadius: 6, padding: 10 }}>
              <label style={{ font: "700 13px 'Space Grotesk', sans-serif", color: '#2d4346', display: 'block', marginBottom: 4 }}>
                🚀 Cohete de Lanzamiento
              </label>
              <select
                value={launcher}
                onChange={(e) => setLauncher(e.target.value as LaunchChoice)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #688285', fontSize: 12 }}
              >
                <option value="medio">Lanzador Comercial Medio (Límite 800 kg · Presupuesto $400M)</option>
                <option value="superpesado">Lanzador Superpesado SLS (Límite 1600 kg · Presupuesto $700M)</option>
              </select>
            </div>
          </div>

          {/* Panel de Evaluación en Tiempo Real */}
          <div
            style={{
              background: '#f8faf3',
              border: '2px solid #3c5459',
              borderRadius: 6,
              padding: '14px 16px',
              boxShadow: '4px 4px 0 #52676d',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <strong style={{ font: "24px 'Patrick Hand', cursive", color: '#24373a' }}>
                Evaluación de Ingeniería de la Misión
              </strong>
              <div
                style={{
                  background: simData.score >= 70 ? '#2e6f40' : simData.score >= 50 ? '#b07525' : '#ba4848',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: 16,
                  font: "700 15px 'Space Grotesk', sans-serif",
                }}
              >
                Puntuación: {simData.score} / 100
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '10px 0' }}>
              <div style={{ background: '#eef2e6', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: '#566e72', display: 'block' }}>MASA TOTAL</span>
                <strong style={{ fontSize: 14, color: simData.massOk ? '#23373a' : '#ba4848' }}>
                  {simData.totalMass} / {simData.maxPayload} kg
                </strong>
                <small style={{ fontSize: 10, color: simData.massOk ? '#2e6f40' : '#ba4848', display: 'block' }}>
                  {simData.massOk ? '✓ Margen Δv OK' : '✕ Sobrecargado'}
                </small>
              </div>

              <div style={{ background: '#eef2e6', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: '#566e72', display: 'block' }}>POTENCIA NOCHE</span>
                <strong style={{ fontSize: 14, color: simData.powerOk ? '#23373a' : '#ba4848' }}>
                  {simData.nightMargin >= 0 ? `+${simData.nightMargin} W` : `${simData.nightMargin} W`}
                </strong>
                <small style={{ fontSize: 10, color: simData.powerOk ? '#2e6f40' : '#ba4848', display: 'block' }}>
                  {simData.powerOk ? '✓ Batería estable' : '✕ Apagón polar'}
                </small>
              </div>

              <div style={{ background: '#eef2e6', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: '#566e72', display: 'block' }}>TELEMETRÍA CIENCIA</span>
                <strong style={{ fontSize: 14, color: simData.commOk ? '#23373a' : '#b07525' }}>
                  {simData.dataDelivered}% bajada
                </strong>
                <small style={{ fontSize: 10, color: simData.commOk ? '#2e6f40' : '#b07525', display: 'block' }}>
                  {simData.commOk ? '✓ Enlace óptimo' : '⚠ Retraso de datos'}
                </small>
              </div>

              <div style={{ background: '#eef2e6', padding: 8, borderRadius: 4, textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: '#566e72', display: 'block' }}>PRESUPUESTO</span>
                <strong style={{ fontSize: 14, color: simData.budgetOk ? '#23373a' : '#ba4848' }}>
                  ${simData.totalCost}M / ${simData.budgetCap}M
                </strong>
                <small style={{ fontSize: 10, color: simData.budgetOk ? '#2e6f40' : '#ba4848', display: 'block' }}>
                  {simData.budgetOk ? `✓ Sobra $${simData.budgetCap - simData.totalCost}M` : '✕ Excedido'}
                </small>
              </div>
            </div>

            {/* Veredicto de la misión */}
            <div
              style={{
                background:
                  simData.verdictType === 'ok'
                    ? '#ebf8ee'
                    : simData.verdictType === 'warn'
                      ? '#fffbeb'
                      : '#fef2f2',
                border: `1.5px solid ${
                  simData.verdictType === 'ok'
                    ? '#86efac'
                    : simData.verdictType === 'warn'
                      ? '#fde047'
                      : '#fca5a5'
                }`,
                borderRadius: 4,
                padding: '8px 12px',
                fontSize: 12,
                color:
                  simData.verdictType === 'ok'
                    ? '#166534'
                    : simData.verdictType === 'warn'
                      ? '#854d0e'
                      : '#991b1b',
                marginTop: 8,
              }}
            >
              {simData.verdict}
            </div>
          </div>
        </div>
      )}

      {/* Botón de consulta a TARS */}
      <button
        type="button"
        className="primary-world"
        style={{ marginTop: 18, width: '100%', fontSize: 18 }}
        onClick={consultTars}
      >
        TARS, informe de operaciones en la Luna ▶
      </button>

      {/* Acordeón educativo del Reto NASA Space Apps */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ font: "18px 'Patrick Hand', cursive", cursor: 'pointer', color: '#385559' }}>
          ⚖️ Reto NASA: Por qué importan las compensaciones de ingeniería (Trade-Offs)
        </summary>
        <div style={{ fontSize: 12, lineHeight: 1.6, color: '#3f5559', marginTop: 8 }}>
          <p>
            En la astronáutica real no existe una única solución perfecta. Cada decisión técnica tiene un impacto en cascada:
          </p>
          <ul style={{ paddingLeft: 18, margin: '6px 0' }}>
            <li>
              <strong>Masa vs. Propulsión:</strong> Por la ecuación de Tsiolkovski, cada kilogramo extra de sensores requiere exponencialmente más combustible para escapar de la Tierra.
            </li>
            <li>
              <strong>Potencia vs. Masa:</strong> Generar más vatios requiere matrices solares o reactores más pesados, reduciendo la masa disponible para instrumental científico.
            </li>
            <li>
              <strong>Comunicaciones vs. Potencia:</strong> Transmitir señales a 384,400 km exige transpondedores de alta potencia que compiten con los calentadores durante la noche lunar de 14.5 días terrestres.
            </li>
            <li>
              <strong>ISRU (Recursos in-situ):</strong> Procesar agua y regolito en la Luna permite que la arquitectura espacial sea sostenible sin depender de suministros continuos desde la Tierra.
            </li>
          </ul>
        </div>
      </details>
    </div>
  )
}
