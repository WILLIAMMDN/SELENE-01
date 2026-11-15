import { buggy, nearBuggy } from '../buggyControl'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import * as T from 'three'
import { Solid, Sign, toon } from '../ArtKit'
import { groundHeight } from '../worldData'
import { occupant } from '../buildingNavigation'
import { TOOL_ACTIONS, TOOL_STATION } from './toolLayout'
import timeline from './toolTimeline.json'

export default function EarthTools({ paused, reduced }: { paused: boolean; reduced: boolean }) {
  const { scene, animations } = useGLTF(`${import.meta.env.BASE_URL}models/tools/earth_tools.glb`)
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const asset = useMemo(() => {
    const root = clone(scene),
      materials = new Map<T.Material, T.MeshToonMaterial>()
    root.traverse((n) => {
      if (!(n instanceof T.Mesh)) return
      const convert = (source: T.Material) => {
        if (materials.has(source)) return materials.get(source)!
        const m = source as T.MeshStandardMaterial
        const colors: Record<string, string> = {
          Rojo: '#bd7862',
          Cofre: '#a96150',
          Azul: '#4c8587',
          Naranja: '#c68f60',
          Amarillo: '#dec478',
        }
        const result = new T.MeshToonMaterial({
          name: source.name,
          color: colors[source.name] ?? m.color,
          gradientMap: toon('#dedfc8').gradientMap,
          emissive: m.emissive,
          emissiveIntensity: 0,
          side: m.side,
          transparent: m.transparent,
          opacity: m.opacity,
        })
        materials.set(source, result)
        return result
      }
      n.material = Array.isArray(n.material) ? n.material.map(convert) : convert(n.material)
      n.castShadow = true
      n.receiveShadow = true
    })
    const mixer = new T.AnimationMixer(root)
    const actions = animations.map((clip) => {
      const a = mixer.clipAction(clip)
      a.setLoop(T.LoopOnce, 1)
      a.clampWhenFinished = true
      return a
    })
    return { root, mixer, actions, materials }
  }, [scene, animations])
  const playback = useRef({ time: 0, end: 0, playing: false })
  useEffect(() => {
    const seek = (frame: number) => {
      asset.actions.forEach((a) => a.reset().play())
      asset.mixer.setTime(frame / timeline.fps)
    }
    seek(0)
    const play = (event: Event) => {
      const id = (event as CustomEvent<string>).detail
      const marker = (timeline.markers as Record<string, number>)[`SEL_${id}`]
      const start = id === 'open' ? 1 : id === 'close' ? 1640 : marker
      if (
        start === undefined ||
        (marker !== undefined && !TOOL_ACTIONS.some(([name]) => name === id))
      )
        return
      const end = marker === undefined ? start + 30 : start + 196
      // Explicit demonstrations still play with reduced motion; ambient motion stays off.
      playback.current = { time: start / timeline.fps, end: end / timeline.fps, playing: true }
      seek(start)
    }
    const open = (e: KeyboardEvent) => {
      if (buggy.driving || nearBuggy(occupant.x, occupant.z)) return
      if (pausedRef.current || !occupant.active || !occupant.earth || e.repeat || e.code !== 'KeyE')
        return
      if (Math.hypot(occupant.x - TOOL_STATION.entry[0], occupant.z - TOOL_STATION.entry[1]) > 2.5)
        return
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('button,input,select,textarea,[role="dialog"]')
      )
        return
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('selene-tools-panel'))
    }
    window.addEventListener('selene-tool-action', play)
    window.addEventListener('keydown', open)
    return () => {
      window.removeEventListener('selene-tool-action', play)
      window.removeEventListener('keydown', open)
      asset.mixer.stopAllAction()
      asset.mixer.uncacheRoot(asset.root)
    }
  }, [asset])
  useEffect(() => () => asset.materials.forEach((m) => m.dispose()), [asset])
  useFrame((_, delta) => {
    const state = playback.current
    if (paused || !state.playing) return
    state.time = Math.min(state.end, state.time + Math.min(delta, 0.05))
    asset.mixer.setTime(state.time)
    const frame = Math.min(1670, Math.round(state.time * timeline.fps))
    asset.materials.forEach((m) => {
      const samples = timeline.emission[m.name as keyof typeof timeline.emission]
      if (samples) m.emissiveIntensity = reduced ? 0 : Math.min(samples[frame], 2)
    })
    if (state.time >= state.end) state.playing = false
  })
  return (
    <group
      position={[TOOL_STATION.x, groundHeight(TOOL_STATION.x, TOOL_STATION.z), TOOL_STATION.z]}
    >
      <Solid position={[0, 0.22, 0]} scale={[3.4, 0.44, 1.4]} color="#6f8e87" />
      <group
        position={[0, TOOL_STATION.height, 0]}
        onClick={(e) => {
          if (paused) return
          e.stopPropagation()
          window.dispatchEvent(new CustomEvent('selene-tools-panel'))
        }}
      >
        <primitive object={asset.root} dispose={null} />
      </group>
      <Sign text="E / HERRAMIENTAS" position={[0, 0.72, 0.76]} scale={[1.8, 0.45, 1]} />
    </group>
  )
}
