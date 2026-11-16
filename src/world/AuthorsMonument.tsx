import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as T from 'three'
import { Solid, Sign } from './ArtKit'
import { occupant } from './buildingNavigation'
import { SELENE_AUTHORS_DATA } from '../game/authorsData'

function AuthorPortrait({ photo }: { photo: string }) {
  const texture = useTexture(`${import.meta.env.BASE_URL}${photo}`)
  const portrait = useMemo(() => {
    const map = texture.clone()
    const image = texture.image as HTMLImageElement
    const imageAspect = image.width / image.height
    const frameAspect = 0.62 / 0.75
    if (imageAspect > frameAspect) {
      map.repeat.x = frameAspect / imageAspect
      map.offset.x = (1 - map.repeat.x) / 2
    } else {
      map.repeat.y = imageAspect / frameAspect
      map.offset.y = (1 - map.repeat.y) / 2
    }
    map.colorSpace = T.SRGBColorSpace
    map.needsUpdate = true
    return map
  }, [texture])

  useEffect(() => () => portrait.dispose(), [portrait])

  return (
    <mesh position={[-1.25, 0, 0.075]} scale={[0.62, 0.75, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={portrait} side={T.DoubleSide} toneMapped={false} />
    </mesh>
  )
}

type Props = {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export default function AuthorsMonument({
  position = [-14, 0, 36],
  rotation = [0, 0.45, 0],
}: Props) {
  const promptRef = useRef<T.Group>(null)

  const openAuthors = () => {
    window.dispatchEvent(new CustomEvent('selene-authors-panel'))
  }

  useFrame((state) => {
    if (!promptRef.current) return
    const dist = Math.hypot(occupant.x - position[0], occupant.z - position[2])
    promptRef.current.visible = dist < 6.5
    if (promptRef.current.visible) {
      const bob = Math.sin(state.clock.elapsedTime * 3) * 0.05
      promptRef.current.position.y = 1.35 + bob
    }
  })

  return (
    <group
      name="AuthorsMonument"
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation()
        openAuthors()
      }}
    >
      {/* 1. Stone Foundation Plinth & Steps */}
      <Solid position={[0, 0.12, 0]} scale={[14.2, 0.24, 4.2]} color="#cfcfb8" />
      <Solid position={[0, 0.28, 0]} scale={[13.4, 0.16, 3.4]} color="#e3e2cf" />

      {/* 2. Structural Steel / Timber Pillars */}
      {[-6.2, -2.1, 2.1, 6.2].map((x) => (
        <group key={x} position={[x, 0, -0.2]}>
          <Solid position={[0, 3.0, 0]} scale={[0.34, 6.0, 0.34]} color="#384950" />
          <Solid position={[0, 0.4, 0.18]} scale={[0.42, 0.8, 0.42]} color="#4e6269" />
          {/* Diagonal truss brace */}
          <Solid
            position={[0, 1.8, -0.45]}
            rotation={[0.45, 0, 0]}
            scale={[0.18, 3.2, 0.18]}
            color="#384950"
          />
        </group>
      ))}

      {/* Crossbeams */}
      <Solid position={[0, 5.85, -0.2]} scale={[13.2, 0.28, 0.34]} color="#384950" />
      <Solid position={[0, 1.35, -0.2]} scale={[13.2, 0.24, 0.34]} color="#384950" />

      {/* 3. Massive Commemorative Billboard Canvas */}
      <group position={[0, 3.6, 0]}>
        {/* Main background board */}
        <Solid position={[0, 0, 0]} scale={[12.6, 4.6, 0.18]} color="#f7f7ed" />
        {/* Outer Inked Border */}
        <Solid position={[0, 0, -0.01]} scale={[12.75, 4.75, 0.15]} color="#26343a" />

        {/* Top Header Marquee */}
        <Sign
          text="EQUIPO CREADOR · SELENE-01"
          sub="SEIS INTEGRANTES · CRÉDITOS DEL PROYECTO"
          position={[0, 1.75, 0.14]}
          scale={[11.8, 0.85, 1]}
          bg="#ba6061"
          fg="#fffdf3"
        />

        {/* 6 Author Placards on the Board */}
        <group position={[0, -0.2, 0.12]}>
          {SELENE_AUTHORS_DATA.members.map((member, i) => {
            const col = i % 3
            const row = Math.floor(i / 3)
            const x = (col - 1) * 3.8
            const y = row === 0 ? 0.65 : -0.75

            return (
              <group key={member.id} position={[x, y, 0]}>
                {/* Frame card */}
                <Solid position={[0, 0, 0]} scale={[3.45, 1.15, 0.04]} color="#edf0e2" />
                <Solid position={[0, 0, -0.01]} scale={[3.52, 1.22, 0.03]} color="#384950" />

                {/* Photo avatar slot in 3D */}
                <Solid position={[-1.25, 0, 0.03]} scale={[0.72, 0.85, 0.03]} color="#ffffff" />
                <Solid
                  position={[-1.25, 0, 0.04]}
                  scale={[0.62, 0.75, 0.02]}
                  color={member.avatarColor}
                />
                <Suspense fallback={null}>
                  <AuthorPortrait photo={member.photo} />
                </Suspense>

                {/* Inscribed Member Sign */}
                <Sign
                  text={member.shortName.toUpperCase()}
                  sub={member.role}
                  position={[0.42, 0, 0.04]}
                  scale={[2.2, 0.78, 1]}
                  bg="#ffffff"
                  fg="#26343a"
                />
              </group>
            )
          })}
        </group>

        {/* Scientific acknowledgement footer on board */}
        <Sign
          text="INSPIRADO EN EL PROGRAMA ARTEMIS DE LA NASA · CIENCIA & SIMULACIÓN"
          sub="POLO SUR LUNAR · ARQUITECTURA DE VEHÍCULOS · FÍSICA EN TIEMPO REAL"
          position={[0, -1.82, 0.14]}
          scale={[11.8, 0.62, 1]}
          bg="#3e595e"
          fg="#eef2e6"
        />
      </group>

      {/* 4. Interactive Call-To-Action Prompt */}
      <group ref={promptRef} position={[0, 1.35, 1.4]}>
        <Sign
          text="E · EXPLORAR DOSSIER DE AUTORES"
          sub="PULSA O HAZ CLIC PARA ABRIR CRÉDITOS COMPLETOS"
          position={[0, 0, 0]}
          scale={[5.4, 0.95, 1]}
          bg="#457d80"
          fg="#fffef6"
        />
      </group>

      {/* 5. Architectural Ground Spotlights */}
      {[-4.5, 4.5].map((x) => (
        <group key={x} position={[x, 0.35, 1.2]}>
          <Solid
            kind="cylinder"
            position={[0, 0.15, 0]}
            rotation={[0.3, 0, 0]}
            scale={[0.22, 0.3, 0.22]}
            color="#26343a"
          />
          <Solid
            kind="cylinder"
            position={[0, 0.28, -0.06]}
            rotation={[0.6, 0, 0]}
            scale={[0.18, 0.08, 0.18]}
            color="#eedc82"
          />
        </group>
      ))}
    </group>
  )
}
