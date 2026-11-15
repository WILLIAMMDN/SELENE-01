import type { Scene, Group, Camera, Mesh, MeshBasicMaterial, ShaderMaterial } from 'three'
export class AnimeSky {
  constructor(
    scene: Scene,
    options?: {
      daySeconds?: number
      nightSeconds?: number
      startHour?: number
      autoCycle?: boolean
      cloudCount?: number
      rainCount?: number
      fog?: boolean
      lighting?: boolean
    },
  )
  rain: Group
  group: Group
  hour: number
  time: number
  autoCycle: boolean
  sun: Mesh
  sunMaterial: MeshBasicMaterial
  skyMaterial: ShaderMaterial
  setHour(hour: number): this
  setWeather(weather: 'clear' | 'rain' | 'storm', transitionSeconds?: number): this
  update(deltaSeconds: number, camera?: Camera): void
  dispose(): void
}
