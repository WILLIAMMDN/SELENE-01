import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as T from 'three'
import { toon } from '../ArtKit'
import type { Conversation } from '../../game/narrative/conversations'

export type LunarResource = {
  id: string
  number: string
  name: string
  tool: string
  science: string
  color: string
  position: [number, number]
  action: string
}

export const LUNAR_RESOURCES: LunarResource[] = [
  {
    id: 'hielo',
    number: '01',
    name: 'Hielo de agua',
    tool: 'Pico criogénico',
    science:
      'Depósitos de hielo en trampas frías de cráteres polares. Esencial para soporte vital humano y electrólisis en hidrógeno y oxígeno líquidos como propelente.',
    color: '#38bdf8',
    position: [28, 70],
    action: 'Extraer hielo',
  },
  {
    id: 'regolito',
    number: '02',
    name: 'Regolito lunar',
    tool: 'Pala de muestreo',
    science:
      'Materia prima de silicatos y óxidos metálicos. Base para sinterizado por microondas y fabricación aditiva de bloques de hábitat y escudos antirradiación.',
    color: '#e2e8f0',
    position: [10, 52],
    action: 'Recoger regolito',
  },
  {
    id: 'helio',
    number: '03',
    name: 'Helio-3',
    tool: 'Sonda y espectrómetro',
    science:
      'Isótopo implantado por el viento solar en el regolito. Recurso estratégico para futuros reactores de fusión nuclear limpia y generación de energía de alta densidad.',
    color: '#4ade80',
    position: [-12, 68],
    action: 'Detectar Helio-3',
  },
  {
    id: 'titanio',
    number: '04',
    name: 'Titanio (Ilmenita)',
    tool: 'Martillo geológico',
    science:
      'Mineral ilmenita (FeTiO3) en basaltos lunares. Fuente de aleaciones ultraligeras para estructuras espaciales y extracción piroclástica de oxígeno.',
    color: '#a78bfa',
    position: [-34, 52],
    action: 'Muestrear ilmenita',
  },
  {
    id: 'hierro',
    number: '05',
    name: 'Hierro nativo',
    tool: 'Martillo geológico',
    science:
      'Granos metálicos de hierro puro en el regolito. Fundición in-situ para componentes estructurales, conductores y herramientas mecánicas sin transporte terrestre.',
    color: '#fb923c',
    position: [-56, 72],
    action: 'Fracturar mena',
  },
  {
    id: 'roca',
    number: '06',
    name: 'Muestra de roca',
    tool: 'Pinza y contenedor sellado',
    science:
      'Brecha anortosítica de las tierras altas polares. Sellada al vacío para análisis petrológico y cronología de impactos en laboratorios de la Tierra.',
    color: '#facc15',
    position: [-74, 64],
    action: 'Embalar muestra',
  },
]

type Props = {
  heightAt: (x: number, z: number) => number
  paused: boolean
  onConversation: (conv: Conversation) => void
}

const STORAGE_KEY = 'selene_lunar_resources_collected_v1'

export default function LunarResourcesMission({ heightAt, paused, onConversation }: Props) {
  const [collected, setCollected] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [nearbyStation, setNearbyStation] = useState<LunarResource | null>(null)
  const [nearGeologist, setNearGeologist] = useState(false)
  const { camera } = useThree()

  // Posición de la Geóloga secundaria (Dra. Elena Silva)
  const geologistPos: [number, number] = [46, 64]
  const geologistY = heightAt(geologistPos[0], geologistPos[1])

  // Guardar progreso
  const markCollected = (id: string) => {
    setCollected((prev) => {
      if (prev.includes(id)) return prev
      const updated = [...prev, id]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        window.dispatchEvent(
          new CustomEvent('selene-lunar-resource-collected', { detail: updated }),
        )
      } catch {
        /* ignore */
      }
      return updated
    })
  }

  // Animación del personaje secundario realizando actividades de prospección
  const geologistRef = useRef<T.Group>(null)
  const rightArmRef = useRef<T.Group>(null)
  const leftArmRef = useRef<T.Group>(null)
  const toolScannerRef = useRef<T.Group>(null)
  const holoBeamRef = useRef<T.Mesh>(null)

  useFrame(({ clock }) => {
    if (paused) return
    const t = clock.getElapsedTime()

    // Animación de respiración / flotación sutil en baja gravedad
    if (geologistRef.current) {
      geologistRef.current.position.y = geologistY + Math.sin(t * 1.5) * 0.02
    }

    // Actividad: La geóloga escanea muestras y analiza con su herramienta
    if (rightArmRef.current) {
      // Movimiento de apuntar con el sensor geológico hacia la muestra
      rightArmRef.current.rotation.x = -1.1 + Math.sin(t * 1.2) * 0.18
      rightArmRef.current.rotation.y = 0.2 + Math.cos(t * 0.8) * 0.12
    }
    if (leftArmRef.current) {
      // Brazo izquierdo sostiene la tableta de telemetría
      leftArmRef.current.rotation.x = -0.9 + Math.sin(t * 1.5 + 1) * 0.08
      leftArmRef.current.rotation.z = 0.35 + Math.cos(t * 1.1) * 0.05
    }
    if (holoBeamRef.current) {
      holoBeamRef.current.scale.y = 0.8 + Math.sin(t * 4) * 0.25
      ;(holoBeamRef.current.material as T.MeshBasicMaterial).opacity =
        0.35 + Math.sin(t * 6) * 0.2
    }

    // Proximidad al jugador estimada vía distancia a la cámara
    const camPos = camera.position
    const distGeol = Math.hypot(camPos.x - geologistPos[0], camPos.z - geologistPos[1])
    setNearGeologist(distGeol < 14)

    let closest: LunarResource | null = null
    let minDist = 14 // Cómoda distancia de interacción en terreno abierto
    for (const res of LUNAR_RESOURCES) {
      const d = Math.hypot(camPos.x - res.position[0], camPos.z - res.position[1])
      if (d < minDist) {
        minDist = d
        closest = res
      }
    }
    setNearbyStation(closest)
  })

  // Diálogo con la Geóloga estilo Imagen 3
  const talkToGeologist = () => {
    const total = collected.length
    if (total === 0) {
      onConversation({
        speaker: 'DRA. ELENA SILVA · GEÓLOGA',
        lines: [
          '¡Qué bueno que llegaste! Estamos ejecutando la prospección geológica del programa Artemisa en la base ODYSSEY.',
          'Necesitamos recolectar muestras de los 6 recursos clave: Hielo de agua, Regolito, Helio-3, Titanio, Hierro y Muestra de roca.',
          'Sigue el sendero señalizado hacia el oeste. Puedes ir a pie con la gravedad lunar o conducir el Rover Lunar para avanzar rápido.',
        ],
        action: '¡Entendido, vamos!',
      })
    } else if (total < 6) {
      onConversation({
        speaker: 'DRA. ELENA SILVA · GEÓLOGA',
        lines: [
          `Excelente avance: ya llevamos ${total} de 6 recursos prospectados.`,
          'Revisa las estaciones restantes a lo largo del sendero. Cada recurso incluye datos espectrales certificados por NASA.',
          'Cuando tengas las 6 muestras, las prepararemos en el contenedor de retorno de la cápsula L01.',
        ],
        action: 'Seguir prospectando',
      })
    } else {
      onConversation({
        speaker: 'DRA. ELENA SILVA · GEÓLOGA',
        lines: [
          '¡Misión de prospección cumplida con honores! Los 6 recursos del polo sur lunar han sido caracterizados.',
          'El hielo para soporte vital, el regolito para construcción, el He-3 para investigación energética y la muestra de roca sellada para retorno a la Tierra.',
          'El equipo científico de la misión espacial SELENE-01 te agradece este extraordinario trabajo.',
        ],
        action: '¡Misión completada!',
      })
    }
  }

  // Interactuar con estación de recurso
  const sampleStation = (res: LunarResource) => {
    markCollected(res.id)
    onConversation({
      speaker: `ESTACIÓN ${res.number} · ${res.name.toUpperCase()}`,
      lines: [
        `Has utilizado: ${res.tool.toUpperCase()}. Muestra de ${res.name} recolectada con éxito.`,
        res.science,
        `Progreso de la misión: ${Math.min(6, collected.includes(res.id) ? collected.length : collected.length + 1)} / 6 recursos lunares.`,
      ],
      action: 'Registrar muestra',
    })
  }

  // Teclado para interactuar con tecla E cuando está cerca
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (paused || e.code !== 'KeyE' || e.repeat) return
      if (
        (e.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable="true"]')
      )
        return

      if (nearbyStation) {
        e.preventDefault()
        sampleStation(nearbyStation)
      } else if (nearGeologist) {
        e.preventDefault()
        talkToGeologist()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [paused, nearbyStation, nearGeologist, collected])

  // Material Toon cel-shaded para los elementos
  const toonCream = useMemo(() => toon('#fdfdf6').gradientMap, [])
  const toonDark = useMemo(() => toon('#243338').gradientMap, [])

  return (
    <group name="LunarResourcesMission">
      {/* ============================================================ */}
      {/* PERSONAJE SECUNDARIO: DRA. ELENA SILVA (GEÓLOGA ARTEMISA) */}
      {/* ============================================================ */}
      <group
        ref={geologistRef}
        position={[geologistPos[0], geologistY, geologistPos[1]]}
        rotation={[0, 0.4, 0]}
      >
        {/* Cuerpo del traje EVA */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <capsuleGeometry args={[0.26, 0.65, 8, 16]} />
          <meshToonMaterial color="#ebece6" gradientMap={toonCream} />
        </mesh>
        {/* Placa de misión pectoral */}
        <mesh position={[0, 1.12, 0.22]}>
          <boxGeometry args={[0.22, 0.12, 0.06]} />
          <meshToonMaterial color="#ba6061" />
        </mesh>
        {/* Mochila de soporte vital PLSS */}
        <mesh position={[0, 1.05, -0.22]} castShadow>
          <boxGeometry args={[0.42, 0.58, 0.2]} />
          <meshToonMaterial color="#2d3f47" gradientMap={toonDark} />
        </mesh>
        {/* Tanques de oxígeno en la mochila */}
        <mesh position={[-0.12, 1.05, -0.32]}>
          <cylinderGeometry args={[0.06, 0.06, 0.44, 12]} />
          <meshToonMaterial color="#ebece6" />
        </mesh>
        <mesh position={[0.12, 1.05, -0.32]}>
          <cylinderGeometry args={[0.06, 0.06, 0.44, 12]} />
          <meshToonMaterial color="#ebece6" />
        </mesh>
        {/* Casco con visor dorado/azulado */}
        <mesh position={[0, 1.52, 0]} castShadow>
          <sphereGeometry args={[0.23, 16, 16]} />
          <meshToonMaterial color="#ebece6" gradientMap={toonCream} />
        </mesh>
        <mesh position={[0, 1.53, 0.11]}>
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshToonMaterial color="#1f4b5b" />
        </mesh>

        {/* Piernas con botas EVA */}
        <mesh position={[-0.14, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 0.62, 12]} />
          <meshToonMaterial color="#ebece6" />
        </mesh>
        <mesh position={[0.14, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.11, 0.62, 12]} />
          <meshToonMaterial color="#ebece6" />
        </mesh>
        <mesh position={[-0.14, 0.08, 0.04]}>
          <boxGeometry args={[0.14, 0.14, 0.24]} />
          <meshToonMaterial color="#ba6061" />
        </mesh>
        <mesh position={[0.14, 0.08, 0.04]}>
          <boxGeometry args={[0.14, 0.14, 0.24]} />
          <meshToonMaterial color="#ba6061" />
        </mesh>

        {/* Brazo Izquierdo (sostiene tableta de telemetría) */}
        <group ref={leftArmRef} position={[-0.32, 1.25, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.08, 0.07, 0.4, 10]} />
            <meshToonMaterial color="#ebece6" />
          </mesh>
          {/* Tableta holográfica de telemetría */}
          <mesh position={[0, -0.4, 0.12]} rotation={[0.4, 0.2, 0]}>
            <boxGeometry args={[0.22, 0.15, 0.015]} />
            <meshToonMaterial color="#243338" />
          </mesh>
          <mesh position={[0, -0.4, 0.13]} rotation={[0.4, 0.2, 0]}>
            <planeGeometry args={[0.19, 0.12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Brazo Derecho (apuntando escáner geológico activo) */}
        <group ref={rightArmRef} position={[0.32, 1.25, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.08, 0.07, 0.4, 10]} />
            <meshToonMaterial color="#ebece6" />
          </mesh>
          {/* Herramienta escáner espectral en mano */}
          <group ref={toolScannerRef} position={[0, -0.4, 0.14]}>
            <mesh>
              <cylinderGeometry args={[0.035, 0.04, 0.22, 8]} />
              <meshToonMaterial color="#2d3f47" />
            </mesh>
            <mesh position={[0, 0.11, 0.04]}>
              <boxGeometry args={[0.09, 0.08, 0.14]} />
              <meshToonMaterial color="#ba6061" />
            </mesh>
            {/* Haz de luz de escaneo holográfico */}
            <mesh ref={holoBeamRef} position={[0, -0.26, 0.2]} rotation={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.16, 0.4, 12]} />
              <meshBasicMaterial color="#4ade80" transparent opacity={0.4} />
            </mesh>
          </group>
        </group>

        {/* Muestra de roca sobre soporte que está examinando */}
        <mesh position={[0.3, 0.45, 0.55]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 0.9, 12]} />
          <meshToonMaterial color="#3a4b52" gradientMap={toonDark} />
        </mesh>
        <mesh position={[0.3, 0.96, 0.55]} rotation={[0.2, 0.5, 0]}>
          <dodecahedronGeometry args={[0.11, 1]} />
          <meshToonMaterial color="#facc15" />
        </mesh>

        {/* Cartel flotante anime sobre el personaje */}
        {!paused && (
          <Html position={[0, 2.05, 0]} center distanceFactor={20}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                pointerEvents: 'auto',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  background: '#ba6061',
                  color: '#fffdf3',
                  padding: '3px 10px',
                  borderRadius: 6,
                  font: "800 11px 'Space Grotesk', sans-serif",
                  letterSpacing: '0.04em',
                  boxShadow: '2px 3px 0 #23343a',
                  border: '2px solid #23343a',
                  whiteSpace: 'nowrap',
                }}
              >
                DRA. ELENA SILVA · GEÓLOGA ARTEMISA
              </div>
              {nearGeologist && (
                <button
                  type="button"
                  style={{
                    background: '#fdfdf6',
                    color: '#26343a',
                    border: '2px solid #26343a',
                    borderRadius: 6,
                    padding: '6px 12px',
                    font: "700 12px 'Space Grotesk', sans-serif",
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0 #26343a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={talkToGeologist}
                >
                  <kbd
                    style={{
                      background: '#26343a',
                      color: '#fdfdf6',
                      padding: '1px 5px',
                      borderRadius: 3,
                      fontSize: 10,
                    }}
                  >
                    E
                  </kbd>
                  <span>Hablar sobre prospección</span>
                  <span style={{ color: '#ba6061', fontWeight: 900 }}>▶</span>
                </button>
              )}
            </div>
          </Html>
        )}
      </group>

      {/* ============================================================ */}
      {/* 6 ESTACIONES DE RECURSOS LUNARES */}
      {/* ============================================================ */}
      {LUNAR_RESOURCES.map((res) => {
        const y = heightAt(res.position[0], res.position[1])
        const isCollected = collected.includes(res.id)
        const isCurrentTarget = nearbyStation?.id === res.id

        return (
          <group key={res.id} position={[res.position[0], y, res.position[1]]}>
            {/* Plinto de la estación */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
              <cylinderGeometry args={[1.1, 1.25, 0.2, 16]} />
              <meshToonMaterial color="#303f47" gradientMap={toonDark} />
            </mesh>

            {/* Afloramiento de roca mineral con el color característico */}
            <mesh position={[0, 0.45, 0]} castShadow>
              <dodecahedronGeometry args={[0.38, 1]} />
              <meshToonMaterial color={res.color} />
            </mesh>
            <mesh position={[0.28, 0.3, 0.15]} castShadow>
              <dodecahedronGeometry args={[0.22, 1]} />
              <meshToonMaterial color={res.color} />
            </mesh>
            <mesh position={[-0.22, 0.28, -0.18]} castShadow>
              <dodecahedronGeometry args={[0.18, 1]} />
              <meshToonMaterial color="#64748b" />
            </mesh>

            {/* Poste y baliza indicadora visible a distancia */}
            <mesh position={[-0.65, 1.1, -0.65]}>
              <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
              <meshToonMaterial color="#243338" />
            </mesh>
            <mesh position={[-0.65, 2.25, -0.65]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshBasicMaterial color={isCollected ? '#4ade80' : res.color} />
            </mesh>

            {/* Rótulo e interacción estilo anime */}
            {!paused && (
              <Html position={[0, 1.6, 0]} center distanceFactor={22}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    pointerEvents: 'auto',
                    userSelect: 'none',
                  }}
                >
                  <div
                    style={{
                      background: isCollected ? '#2e6f40' : '#23343a',
                      color: '#fdfdf6',
                      padding: '3px 8px',
                      borderRadius: 5,
                      font: "800 11px 'Space Grotesk', sans-serif",
                      border: '2px solid #3e5158',
                      boxShadow: '2px 2px 0 #1b2529',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span>{res.number}</span>
                    <span>·</span>
                    <span>{res.name.toUpperCase()}</span>
                    {isCollected && <span style={{ color: '#4ade80' }}>✓</span>}
                  </div>

                  {isCurrentTarget && (
                    <button
                      type="button"
                      style={{
                        background: '#fdfdf6',
                        color: '#26343a',
                        border: '2.5px solid #26343a',
                        borderRadius: 6,
                        padding: '6px 12px',
                        font: "700 12px 'Space Grotesk', sans-serif",
                        cursor: 'pointer',
                        boxShadow: '3px 3px 0 #26343a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        whiteSpace: 'nowrap',
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => sampleStation(res)}
                    >
                      <kbd
                        style={{
                          background: '#26343a',
                          color: '#fdfdf6',
                          padding: '1px 5px',
                          borderRadius: 3,
                          fontSize: 10,
                        }}
                      >
                        E
                      </kbd>
                      <span>
                        {isCollected ? 'Revisar datos' : `${res.action} (${res.tool})`}
                      </span>
                      <span style={{ color: '#ba6061', fontWeight: 900 }}>▶</span>
                    </button>
                  )}
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
