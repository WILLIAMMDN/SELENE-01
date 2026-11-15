import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { buildingAt, occupant, stationAt, walkingHeight } from './buildingNavigation'
import { groundHeight } from './worldData'
import { buggy } from './buggyControl'
import { roberRemote } from './roberControl'
import type { SectorId } from '../game/missionTypes'
import {
  projectOnRoute,
  relativeGuideAngle,
  sampleRoute,
  type RoutePoint,
} from './navigation/missionRoute'
import { missionDestination, type MissionGuideReport } from './navigation/missionDestination'

export default function MissionGuide({
  sector,
  enabled,
  reduced,
  onUpdate,
}: {
  sector: SectorId
  enabled: boolean
  reduced: boolean
  onUpdate?: (report: MissionGuideReport) => void
}) {
  const mesh = useRef<T.InstancedMesh>(null)
  const worker = useRef<Worker | null>(null)
  const currentSector = useRef(sector)
  currentSector.current = sector
  const destination = useMemo(() => missionDestination(sector, occupant), [sector])
  const route = useRef<{
    sector: SectorId | null
    path: RoutePoint[]
    planTime: number
    reportTime: number
    angle: number
    pending: boolean
    serial: number
  }>({
    sector: null,
    path: [],
    planTime: -Infinity,
    reportTime: -Infinity,
    angle: 0,
    pending: false,
    serial: 0,
  })
  useEffect(() => {
    const planner = new Worker(new URL('./navigation/missionRoute.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.current = planner
    planner.onmessage = (
      event: MessageEvent<{ serial: number; sector: SectorId; path: RoutePoint[] }>,
    ) => {
      if (event.data.serial !== route.current.serial || event.data.sector !== currentSector.current)
        return
      route.current.path = event.data.path
      route.current.pending = false
    }
    planner.onerror = () => {
      route.current.pending = false
      worker.current = null
    }
    return () => {
      planner.terminate()
      worker.current = null
      route.current.pending = false
    }
  }, [])
  const scratch = useMemo(() => ({ forward: new T.Vector3(), object: new T.Object3D() }), [])
  const geometry = useMemo(() => {
    const result = new T.BufferGeometry()
    result.setAttribute(
      'position',
      new T.Float32BufferAttribute(
        [
          -0.25, 0, -0.09, -0.19, 0, -0.15, 0, 0, 0.09, -0.25, 0, -0.09, 0, 0, 0.09, 0, 0, 0.18, 0,
          0, 0.18, 0, 0, 0.09, 0.19, 0, -0.15, 0, 0, 0.18, 0.19, 0, -0.15, 0.25, 0, -0.09,
        ],
        3,
      ),
    )
    return result
  }, [])
  const material = useMemo(
    () =>
      new T.MeshBasicMaterial({
        color: '#aac9b6',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: T.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    [],
  )
  useFrame(({ camera, clock }, rawDelta) => {
    const marks = mesh.current
    if (!marks) return
    if (!enabled || !occupant.earth || !occupant.active) {
      marks.visible = false
      material.opacity = 0
      return
    }
    const time = clock.elapsedTime,
      state = route.current,
      p = { x: occupant.x, z: occupant.z }
    if (buggy.driving || roberRemote.current) {
      marks.visible = false
      material.opacity = 0
      if (time - state.reportTime > 0.15) {
        state.reportTime = time
        onUpdate?.({
          sector,
          angle: state.angle,
          arrived: false,
          routed: false,
          distance: Math.hypot(p.x - destination.station.x, p.z - destination.station.z),
          hint: 'Guía a pie',
        })
      }
      return
    }
    const arrived = stationAt(p.x, p.z)?.sector === sector
    let progress = projectOnRoute(state.path, p)
    if (
      worker.current &&
      destination.point &&
      !arrived &&
      (state.sector !== sector ||
        (!state.pending &&
          (!state.path.length || progress.distance > 1.15) &&
          time - state.planTime > 1))
    ) {
      if (state.sector !== sector || progress.distance > 6) state.path = []
      state.sector = sector
      state.planTime = time
      state.pending = true
      worker.current.postMessage({ serial: ++state.serial, sector, from: p, to: destination.point })
      progress = projectOnRoute(state.path, p)
    }
    material.opacity = reduced
      ? 0.38
      : T.MathUtils.damp(material.opacity, arrived ? 0 : 0.38, 5, Math.min(rawDelta, 0.05))
    marks.visible = !arrived && state.path.length > 1 && material.opacity > 0.01
    let count = 0
    for (const ahead of [1.7, 3.6, 5.5]) {
      if (arrived || ahead > progress.remaining - 0.25) break
      const a = sampleRoute(state.path, progress.along + ahead),
        b = sampleRoute(state.path, progress.along + ahead + 0.7)
      if (!a || !b) break
      scratch.object.position.set(a.x, walkingHeight(a.x, a.z, groundHeight, true) + 0.035, a.z)
      scratch.object.rotation.set(0, Math.atan2(b.x - a.x, b.z - a.z), 0)
      scratch.object.updateMatrix()
      marks.setMatrixAt(count++, scratch.object.matrix)
    }
    marks.count = count
    marks.instanceMatrix.needsUpdate = true
    if (time - state.reportTime > 0.15) {
      state.reportTime = time
      const next = sampleRoute(state.path, progress.along + 1.5)
      camera.getWorldDirection(scratch.forward)
      if (next) state.angle = relativeGuideAngle(p, next, scratch.forward, state.angle)
      const room = buildingAt(p.x, p.z)
      onUpdate?.({
        sector,
        angle: state.angle,
        arrived,
        distance: arrived
          ? 0
          : state.path.length
            ? progress.remaining
            : Math.hypot(p.x - destination.station.x, p.z - destination.station.z),
        routed: state.path.length > 1,
        hint: arrived
          ? 'Has llegado · pulsa E'
          : room && room !== destination.station.room
            ? 'Sal por la puerta'
            : room === destination.station.room
              ? destination.station.label
              : state.path.length
                ? 'Sigue las marcas'
                : 'Hacia el objetivo',
      })
    }
  })
  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, material, 3]}
      frustumCulled={false}
      renderOrder={2}
    />
  )
}
