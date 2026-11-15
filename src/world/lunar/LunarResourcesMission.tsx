import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as T from 'three'
import { toon } from '../ArtKit'
import type { Conversation } from '../../game/narrative/conversations'

import {
  LUNAR_GEOLOGIST,
  LUNAR_RESOURCES,
  LUNAR_RESOURCE_COUNT,
  type LunarResource,
} from './lunarResources'
import { collectLunarResource, useLunarSamples } from './lunarMissionProgress'
import LunarSamplingTools from './LunarSamplingTools'
import { samplingEvents } from './lunarSampling'
import type { LunarSession } from './lunarRoverControl'

type Props = {
  lunar: LunarSession
  heightAt: (x: number, z: number) => number
  paused: boolean
  onConversation: (conv: Conversation) => void
}

export default function LunarResourcesMission({ heightAt, paused, onConversation, lunar }: Props) {
  const collected = useLunarSamples()
  const [nearbyStation, setNearbyStation] = useState<LunarResource | null>(null)
  const [nearGeologist, setNearGeologist] = useState(false)
  const geologistY = heightAt(...LUNAR_GEOLOGIST)

  // Animación del personaje secundario realizando actividades de prospección
  const geologistRef = useRef<T.Group>(null)
  const rightArmRef = useRef<T.Group>(null)
  const leftArmRef = useRef<T.Group>(null)
  const toolScannerRef = useRef<T.Group>(null)
  const holoBeamRef = useRef<T.Mesh>(null)

  useFrame(({ clock }, delta) => {
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
      ;(holoBeamRef.current.material as T.MeshBasicMaterial).opacity = 0.35 + Math.sin(t * 6) * 0.2
    }

    const action = lunar.sampling
    if (action) {
      if (!action.approaching) {
        const before = action.elapsed
        action.elapsed += Math.min(delta, 0.05)
        const events = samplingEvents(action.resource.id, before, action.elapsed)
        if (events.record && !action.replay) collectLunarResource(action.resource.id)
        if (events.finished) {
          lunar.sampling = undefined
          showSample(action.resource, action.replay)
        }
      }
      return
    }
    const target = findInteraction()
    setNearbyStation(typeof target === 'object' ? target : null)
    setNearGeologist(target === 'geologist')
  })

  const findInteraction = () => {
    const player = lunar.position
    if (paused || lunar.boarded || !player) return null
    const nearest = LUNAR_RESOURCES.find(
      ({ position: [x, z] }) => Math.hypot(player.x - x, player.z - z) < 3.2,
    )
    if (nearest) return nearest
    return Math.hypot(player.x - LUNAR_GEOLOGIST[0], player.z - LUNAR_GEOLOGIST[1]) < 4
      ? ('geologist' as const)
      : null
  }

  const talkToGeologist = () => {
    if (findInteraction() !== 'geologist') return
    const total = collected.length
    onConversation({
      speaker: 'DRA. ELENA SILVA · GEÓLOGA',
      lines:
        total < LUNAR_RESOURCE_COUNT
          ? [
              '¿Qué recursos podrían abastecer una base en el polo sur lunar? Vamos a comparar seis registros de campo en la simulación.',
              'Sigue las balizas desde la base hasta la cuenca del cráter. Usa el rover para cubrir distancia, bájate junto a la estación y pulsa E a pie para tomar una muestra o una lectura.',
              `Registros de campo: ${total} de ${LUNAR_RESOURCE_COUNT}. Usa la bitácora para encontrar la siguiente estación.`,
            ]
          : [
              'Los seis registros ya están en la bitácora. Compara qué podría aprovecharse en la base y qué necesitaría más análisis.',
              'Puedes conservar la roca en el archivo o preparar su manifiesto en la explanada de la cápsula L01.',
            ],
      action: 'Volver al campo',
    })
  }

  const sampleStation = (res: LunarResource) => {
    if (lunar.sampling || findInteraction() !== res) return
    lunar.sampling = {
      resource: res,
      elapsed: 0,
      approaching: true,
      replay: collected.includes(res.id),
    }
    setNearbyStation(null)
  }

  const showSample = (res: LunarResource, previous: boolean) => {
    const total = collected.length + Number(!collected.includes(res.id) && !previous)
    onConversation({
      speaker: `ESTACIÓN ${res.number} · ${res.name.toUpperCase()}`,
      lines: [
        previous
          ? 'Este registro ya figura en tu bitácora.'
          : res.id === 'helio'
            ? `Lectura simulada registrada con ${res.tool.toLowerCase()}.`
            : `Muestra ${res.number} registrada con ${res.tool.toLowerCase()}.`,
        res.science,
        `Registros de campo: ${total} de ${LUNAR_RESOURCE_COUNT}.`,
      ],
      action: 'Volver al campo',
    })
  }

  useEffect(() => {
    lunar.interact = () => {
      if (lunar.sampling) return true
      const target = findInteraction()
      if (!target) return false
      if (target === 'geologist') talkToGeologist()
      else sampleStation(target)
      return true
    }
    return () => {
      lunar.interact = undefined
    }
  })

  // Material Toon cel-shaded para los elementos
  const toonCream = useMemo(() => toon('#fdfdf6').gradientMap, [])
  const toonDark = useMemo(() => toon('#243338').gradientMap, [])

  return (
    <group name="LunarResourcesMission">
      <LunarSamplingTools lunar={lunar} />
      {/* ============================================================ */}
      {/* PERSONAJE SECUNDARIO: DRA. ELENA SILVA (GEÓLOGA ARTEMISA) */}
      {/* ============================================================ */}
      <group
        ref={geologistRef}
        position={[LUNAR_GEOLOGIST[0], geologistY, LUNAR_GEOLOGIST[1]]}
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
        {!paused && nearGeologist && (
          <Html position={[0, 2.05, 0]} center distanceFactor={12}>
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
                DRA. ELENA SILVA · GEÓLOGA
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
            {!paused && isCurrentTarget && (
              <Html position={[0, 1.6, 0]} center distanceFactor={12}>
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
                    {isCollected && <span>Registrado</span>}
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
                        {isCollected ? 'Repetir demostración' : `${res.action} (${res.tool})`}
                      </span>
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
