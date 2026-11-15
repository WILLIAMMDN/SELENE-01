import { buildingAt, occupant } from '../buildingNavigation'
import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AmbientLight, DirectionalLight } from 'three'
import { AnimeSky } from './AnimeSky.js'
import { effectiveWeather, useSkySettings } from './skySettings'
import { getLaunchFrame, type LaunchClock } from '../../spacecraft/launchTimeline'

export default function CampusSky({
  reduced,
  paused,
  quality,
  launchClock,
}: {
  reduced: boolean
  paused: boolean
  quality: 'standard' | 'light'
  /** A launch overrides the simulated hour based on ascent altitude. */
  launchClock?: LaunchClock
}) {
  const { scene, camera } = useThree()
  const settings = useSkySettings()
  const sky = useRef<AnimeSky | null>(null)
  const ambient = useRef<AmbientLight>(null)
  const sun = useRef<DirectionalLight>(null)
  useEffect(() => {
    const instance = new AnimeSky(scene, {
      startHour: 10,
      daySeconds: 300,
      nightSeconds: 60,
      cloudCount: quality === 'light' ? 16 : 28,
      rainCount: quality === 'light' ? 250 : 650,
    })
    sky.current = instance
    return () => {
      instance.dispose()
      sky.current = null
    }
  }, [scene, quality])
  useEffect(() => {
    if (!sky.current) return
    sky.current.autoCycle = settings.phase === 'cycle' && !reduced
    sky.current.setHour({ cycle: 10, day: 12, sunset: 17.6, night: 22 }[settings.phase])
  }, [settings.phase, reduced, quality])
  useEffect(() => {
    sky.current?.setWeather(effectiveWeather(settings.weather, reduced), 0)
  }, [settings.weather, reduced, quality])
  useFrame((_, dt) => {
    const current = sky.current
    if (!current) return
    current.update(paused || reduced ? 0 : Math.min(dt, 0.05), camera)
    if (occupant.active && buildingAt(occupant.x, occupant.z)) current.rain.visible = false
    const { day, wet, flash, dusk } = current.skyMaterial.uniforms
    if (launchClock) {
      const flight = getLaunchFrame(launchClock.current, 'aurora')
      const night = flight.spaceBlend
      day.value = Math.min(day.value, 1 - night * 0.98)
      dusk.value = Math.max(0, Math.sin(night * Math.PI) * 0.09)
      current.starMaterial.uniforms.opacity.value = Math.max(
        current.starMaterial.uniforms.opacity.value,
        Math.max(0, (night - 0.25) / 0.75),
      )
      current.cloudMeshes.forEach((mesh) => {
        mesh.visible = night < 0.84
      })
    }
    if (ambient.current) ambient.current.intensity = 0.22 + day.value * 1.03
    if (sun.current) {
      // Keep the existing shadow coverage over the campus while varying daylight.
      sun.current.color.copy(current.sunMaterial.color)
      sun.current.intensity = (0.15 + day.value * 1.95) * (1 - wet.value * 0.55) + flash.value * 2
    }
    if (scene.fog)
      scene.fog.color
        .set(day.value > 0.5 ? '#b1cec5' : '#25334e')
        .lerp(current.sunMaterial.color, current.skyMaterial.uniforms.dusk.value * 0.25)
  })
  return (
    <>
      <ambientLight ref={ambient} intensity={1.25} color="#e1ebdf" />
      <directionalLight
        ref={sun}
        position={[-80, 150, 65]}
        intensity={2.1}
        color="#fff0d2"
        castShadow={quality === 'standard'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-95}
        shadow-camera-far={420}
        shadow-normalBias={0.025}
      />
    </>
  )
}
