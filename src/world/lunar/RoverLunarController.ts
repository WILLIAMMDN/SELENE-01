import * as T from 'three'

export type RoverInput = { throttle: number; steer: number; brake?: boolean; boost?: boolean }
export type RoverOptions = {
  position?: T.Vector3
  heightAt?: (x: number, z: number) => number
  canMove?: (position: T.Vector3, yaw: number) => boolean
}
const TAGS = ['FL', 'FR', 'RL', 'RR'] as const
const up = new T.Vector3(0, 1, 0)
const approach = (a: number, b: number, step: number) => a + T.MathUtils.clamp(b - a, -step, step)

export class RoverLunarController {
  readonly vehicle = new T.Group()
  readonly effects = new T.Group()
  readonly dust: T.Points<T.BufferGeometry, T.ShaderMaterial>
  speed = 0
  yaw = 0
  steering = 0
  distance = 0
  input: RoverInput = { throttle: 0, steer: 0 }
  private readonly wheels: T.Object3D[]
  private readonly steeringNodes: T.Object3D[]
  private readonly rolls = [0, 0, 0, 0]
  private readonly rear = new T.Vector3()
  private readonly proposed = new T.Vector3()
  private readonly contact = new T.Vector3()
  private readonly heightAt: (x: number, z: number) => number
  private readonly canMove: (position: T.Vector3, yaw: number) => boolean
  private readonly spawn = new T.Vector3()
  private readonly capacity = 320
  private readonly positions = new Float32Array(320 * 3)
  private readonly velocities = new Float32Array(320 * 3)
  private readonly ages = new Float32Array(320)
  private readonly lifetimes = new Float32Array(320)
  private readonly sizes = new Float32Array(320)
  private readonly opacity = new Float32Array(320)
  private readonly emission = [0, 0, 0, 0]
  private cursor = 0
  private elapsed = 0
  private readonly cameraYaw: T.Object3D | undefined
  private readonly antennaYaw: T.Object3D | undefined
  private readonly cameraRest: T.Quaternion | undefined
  private readonly antennaRest: T.Quaternion | undefined
  private readonly scanRotation = new T.Quaternion()

  constructor(model: T.Object3D, options: RoverOptions = {}) {
    const find = (name: string) => {
      const node = model.getObjectByName(name)
      if (!node) throw new Error(`Falta el pivote ${name}`)
      return node
    }
    this.wheels = TAGS.map(tag => find(`Wheel_${tag}`))
    this.steeringNodes = TAGS.map(tag => find(`Steering_${tag}`))
    this.heightAt = options.heightAt ?? (() => 0)
    this.canMove = options.canMove ?? (() => true)
    this.spawn.copy(options.position ?? new T.Vector3())
    this.vehicle.name = 'RoverLunar_Controlled'
    this.vehicle.add(model)
    model.traverse(node => {
      if ((node as T.Mesh).isMesh) { node.castShadow = true; node.receiveShadow = true }
    })
    this.cameraYaw = model.getObjectByName('Camera_Yaw')
    this.antennaYaw = model.getObjectByName('Antenna_Yaw')
    this.cameraRest = this.cameraYaw?.quaternion.clone()
    this.antennaRest = this.antennaYaw?.quaternion.clone()
    const geometry = new T.BufferGeometry()
    geometry.setAttribute('position', new T.BufferAttribute(this.positions, 3).setUsage(T.DynamicDrawUsage))
    geometry.setAttribute('size', new T.BufferAttribute(this.sizes, 1).setUsage(T.DynamicDrawUsage))
    geometry.setAttribute('opacity', new T.BufferAttribute(this.opacity, 1).setUsage(T.DynamicDrawUsage))
    const material = new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { color: { value: new T.Color('#b9b1a0') }, pixelScale: { value: 650 } },
      vertexShader: `attribute float size; attribute float opacity; varying float alpha;
        uniform float pixelScale;
        void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); alpha=opacity;
          gl_Position=projectionMatrix*p; gl_PointSize=clamp(size*pixelScale/max(0.1,-p.z),1.0,30.0); }`,
      fragmentShader: `uniform vec3 color; varying float alpha;
        void main(){ float r=length(gl_PointCoord-vec2(0.5));
          float a=(1.0-smoothstep(0.12,0.5,r))*alpha; if(a<0.01)discard;
          gl_FragColor=vec4(color,a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    })
    this.dust = new T.Points(geometry, material)
    this.dust.name = 'Rover_Polvo_Dinamico'
    this.dust.frustumCulled = false
    this.effects.add(this.dust)
    this.reset()
  }

  setInput(input: RoverInput) {
    this.input = { ...input, throttle: T.MathUtils.clamp(input.throttle, -1, 1), steer: T.MathUtils.clamp(input.steer, -1, 1) }
  }
  setViewport(height: number, pixelRatio = 1, fov = 50) {
    this.dust.material.uniforms.pixelScale.value = height * pixelRatio / (2 * Math.tan(T.MathUtils.degToRad(fov / 2)))
  }
  stop() { this.setInput({ throttle: 0, steer: 0, brake: true }) }
  reset(position = this.spawn) {
    this.speed = this.yaw = this.steering = this.distance = 0
    this.vehicle.position.copy(position)
    this.vehicle.position.y = this.heightAt(position.x, position.z)
    this.vehicle.rotation.set(0, 0, 0)
    this.rear.copy(this.vehicle.position); this.rear.z -= 1.15
    this.rolls.fill(0); this.emission.fill(0); this.opacity.fill(0); this.lifetimes.fill(0)
    this.input = { throttle: 0, steer: 0 }
    this.wheels.forEach(wheel => wheel.rotation.x = 0)
    this.steeringNodes.forEach(wheel => wheel.rotation.y = 0)
    this.dust.geometry.attributes.opacity.needsUpdate = true
  }
  get particleCount() { let n = 0; for (const a of this.opacity) if (a > 0) n++; return n }

  update(delta: number) {
    if (!Number.isFinite(delta) || delta <= 0) return
    let remaining = Math.min(delta, 0.12)
    while (remaining > 1e-8) { const dt = Math.min(remaining, 1 / 120); this.step(dt); remaining -= dt }
    for (const name of ['position', 'opacity', 'size']) this.dust.geometry.attributes[name].needsUpdate = true
  }

  private step(dt: number) {
    this.elapsed += dt
    const oldSpeed = this.speed
    const target = this.input.brake
      ? 0
      : this.input.throttle * (this.input.throttle < 0 ? 2.2 : this.input.boost ? 6.5 : 4.0)
    const rate = this.input.brake ? 7.5 : this.input.throttle === 0 ? 2.0 : oldSpeed * target < 0 ? 5.5 : 3.2
    this.speed = approach(this.speed, target, rate * dt)
    // Correct steering sign: pressing A/Left turns Left, D/Right turns Right
    this.steering = approach(this.steering, -this.input.steer * Math.PI / 6, dt * 2.4)
    const ds = (oldSpeed + this.speed) * .5 * dt
    const curvature = Math.tan(this.steering) / 2.3
    const dyaw = ds * curvature, nextYaw = this.yaw + dyaw
    const rearX = this.rear.x + Math.sin(this.yaw + dyaw * .5) * ds
    const rearZ = this.rear.z + Math.cos(this.yaw + dyaw * .5) * ds
    this.proposed.set(rearX + Math.sin(nextYaw) * 1.15, 0, rearZ + Math.cos(nextYaw) * 1.15)
    let actualDistance = ds
    if (Math.abs(ds) > 1e-8 && !this.canMove(this.proposed, nextYaw)) {
      actualDistance = 0; this.speed = 0
    } else {
      this.rear.set(rearX, 0, rearZ); this.yaw = nextYaw
      this.vehicle.position.x = this.proposed.x; this.vehicle.position.z = this.proposed.z
    }
    this.distance += Math.abs(actualDistance)
    const x = this.vehicle.position.x, z = this.vehicle.position.z, s = Math.sin(this.yaw), c = Math.cos(this.yaw)
    const front = this.heightAt(x + s * 1.15, z + c * 1.15), rear = this.heightAt(x - s * 1.15, z - c * 1.15)
    const right = this.heightAt(x + c * 1.04, z - s * 1.04), left = this.heightAt(x - c * 1.04, z + s * 1.04)
    const pitch = T.MathUtils.clamp(Math.atan2(rear - front, 2.3), -.28, .28)
    const roll = T.MathUtils.clamp(Math.atan2(right - left, 2.08), -.28, .28)
    this.vehicle.position.y = (front + rear + right + left) * .25
    this.vehicle.rotation.set(pitch, this.yaw, roll, 'YXZ')
    for (let i = 0; i < 4; i++) {
      const wheelX = i % 2 === 0 ? -1.04 : 1.04, longitudinal = i < 2 ? 2.3 : 0
      const a = 1 - curvature * wheelX, b = curvature * longitudinal
      this.steeringNodes[i].rotation.y = i < 2 ? Math.atan2(b, a) : 0
      this.rolls[i] = (this.rolls[i] + actualDistance * Math.hypot(a, b) / .485) % (Math.PI * 2)
      this.wheels[i].rotation.x = this.rolls[i]
    }
    if (this.cameraYaw && this.cameraRest) this.cameraYaw.quaternion.copy(this.cameraRest).multiply(this.scanRotation.setFromAxisAngle(up, Math.sin(this.elapsed * .55) * .10))
    if (this.antennaYaw && this.antennaRest) this.antennaYaw.quaternion.copy(this.antennaRest).multiply(this.scanRotation.setFromAxisAngle(up, Math.sin(this.elapsed * .3) * .04))
    this.vehicle.updateMatrixWorld(true)
    for (let i = 0; i < 4; i++) {
      if (Math.abs(actualDistance) < 1e-7) { this.emission[i] = 0; continue }
      this.wheels[i].getWorldPosition(this.contact)
      const ground = this.heightAt(this.contact.x, this.contact.z)
      if (this.contact.y - .485 - ground > .10) continue
      this.emission[i] += Math.abs(actualDistance) * (this.input.brake ? 26 : 18)
      while (this.emission[i] >= 1) {
        // Eject behind the contact patch, outside the opaque tyre volume.
        const angle = this.yaw + this.steeringNodes[i].rotation.y
        const sign = Math.sign(actualDistance)
        const px = this.contact.x - Math.sin(angle) * sign * .27
        const pz = this.contact.z - Math.cos(angle) * sign * .27
        this.emit(px, this.heightAt(px, pz) + .016, pz)
        this.emission[i]--
      }
    }
    for (let i = 0; i < this.capacity; i++) {
      if (this.lifetimes[i] <= 0) continue
      this.ages[i] += dt
      if (this.ages[i] >= this.lifetimes[i]) { this.lifetimes[i] = 0; this.opacity[i] = 0; continue }
      const j = i * 3
      this.velocities[j + 1] -= 1.62 * dt
      for (let k = 0; k < 3; k++) this.positions[j + k] += this.velocities[j + k] * dt
      const ground = this.heightAt(this.positions[j], this.positions[j + 2]) + .008
      if (this.positions[j + 1] < ground) {
        this.positions[j + 1] = ground; this.velocities[j + 1] *= -.12
        this.velocities[j] *= .85; this.velocities[j + 2] *= .85
      }
      this.opacity[i] = .62 * Math.pow(1 - this.ages[i] / this.lifetimes[i], 1.5)
    }
  }

  private emit(x: number, y: number, z: number) {
    const i = this.cursor; this.cursor = (i + 1) % this.capacity; const j = i * 3
    this.positions[j] = x + (Math.random() - .5) * .11
    this.positions[j + 1] = y; this.positions[j + 2] = z
    this.velocities[j] = -Math.sin(this.yaw) * this.speed * .20 + (Math.random() - .5) * .35
    this.velocities[j + 1] = .30 + Math.random() * .45
    this.velocities[j + 2] = -Math.cos(this.yaw) * this.speed * .20 + (Math.random() - .5) * .35
    this.ages[i] = 0; this.lifetimes[i] = .60 + Math.random() * .40
    this.sizes[i] = .06 + Math.random() * .10; this.opacity[i] = .62
  }
  dispose() { this.dust.geometry.dispose(); this.dust.material.dispose() }
}
