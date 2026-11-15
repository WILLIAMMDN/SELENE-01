import * as THREE from 'three'
import { paintedCloudGeometry } from './paintedCloudGeometry.js'

const TAU = Math.PI * 2
const clamp = THREE.MathUtils.clamp
const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b)
const mod24 = (h) => ((h % 24) + 24) % 24

/** Procedural Y-up anime sky. No textures, loaders, Blender drivers or DOM required. */
export class AnimeSky {
  constructor(
    scene,
    {
      daySeconds = 300,
      nightSeconds = 60,
      cycleSeconds,
      startHour = 6,
      autoCycle = true,
      seed = 417,
      cloudCount = 24,
      rainCount = 850,
      fog = false,
      lighting = false,
    } = {},
  ) {
    if (!scene?.isScene) throw new TypeError('AnimeSky necesita un THREE.Scene.')
    if (
      !Number.isFinite(daySeconds) ||
      daySeconds <= 0 ||
      !Number.isFinite(nightSeconds) ||
      nightSeconds <= 0 ||
      !Number.isFinite(daySeconds + nightSeconds)
    ) {
      throw new RangeError('Las duraciones del día y de la noche deben ser mayores que cero.')
    }
    if (cycleSeconds !== undefined && (!Number.isFinite(cycleSeconds) || cycleSeconds <= 0)) {
      throw new RangeError('cycleSeconds debe ser mayor que cero.')
    }
    if (!Number.isFinite(startHour)) throw new TypeError('startHour debe ser un número.')
    if (!Number.isFinite(cloudCount) || !Number.isFinite(rainCount)) {
      throw new TypeError('Los conteos de nubes y lluvia deben ser números.')
    }
    this.scene = scene
    this.group = new THREE.Group()
    this.group.name = 'AnimeSky'
    scene.add(this.group)
    this.hour = mod24(startHour)
    this.daySeconds = daySeconds
    this.nightSeconds = nightSeconds
    if (cycleSeconds !== undefined) this.setCycleDuration(cycleSeconds)
    this.autoCycle = autoCycle
    this.time = 0
    this.disposed = false
    this.weather = 'clear'
    this._wet = 0
    this._storm = 0
    this._transition = null
    this._boltAge = 100
    this._boltDelay = 5
    this._geometries = new Set()
    this._materials = new Set()
    this._sunDirection = new THREE.Vector3()
    this._moonDirection = new THREE.Vector3()
    this._matrix = new THREE.Matrix4()
    this._position = new THREE.Vector3()
    this._rotation = new THREE.Quaternion()
    this._cameraPosition = new THREE.Vector3()
    this._cameraQuaternion = new THREE.Quaternion()
    let randomState = seed >>> 0
    this._random = () => {
      randomState = (Math.imul(1664525, randomState) + 1013904223) >>> 0
      return randomState / 4294967296
    }
    this._makeSky()
    this._makeClouds(Math.floor(clamp(cloudCount, 0, 100)))
    this._makeCelestials()
    this._makeStars()
    this._makeRain(Math.floor(clamp(rainCount, 0, 5000)))
    if (lighting) {
      this.sunLight = new THREE.DirectionalLight(0xfff3d6, 2)
      this.fillLight = new THREE.HemisphereLight(0x99c7ff, 0x474d69, 1)
      this.flashLight = new THREE.DirectionalLight(0xc3daff, 0)
      this.group.add(this.sunLight, this.sunLight.target, this.fillLight, this.flashLight)
      this.flashLight.target = this.sunLight.target
      this.flashLight.position.set(0, 100, 0)
    }
    if (fog) {
      this._previousFog = scene.fog
      this.fog = new THREE.FogExp2(0xb2d8f4, 0.0012)
      scene.fog = this.fog
    }
    this.update(0)
  }

  _geometry(geometry) {
    this._geometries.add(geometry)
    return geometry
  }
  _material(material) {
    this._materials.add(material)
    return material
  }

  _makeSky() {
    this.skyMaterial = this._material(
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        uniforms: {
          day: { value: 1 },
          dusk: { value: 0 },
          wet: { value: 0 },
          flash: { value: 0 },
          sunDirection: { value: this._sunDirection },
        },
        vertexShader: `varying vec3 vDirection;
        void main(){ vDirection=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `varying vec3 vDirection;
        uniform float day,dusk,wet,flash; uniform vec3 sunDirection;
        void main(){
          float h=normalize(vDirection).y;
          float t=pow(clamp(h,0.,1.),.55);
          vec3 night=mix(vec3(.055,.075,.16),vec3(.006,.012,.055),t);
          vec3 daylight=mix(vec3(.67,.83,.80),vec3(.10,.43,.59),t);
          vec3 sunset=mix(vec3(1.,.40,.25),vec3(.18,.12,.38),t);
          vec3 c=mix(night,daylight,day);
          c=mix(c,sunset,dusk*.85);
          vec3 storm=mix(vec3(.20,.27,.38),vec3(.055,.09,.16),t);
          c=mix(c,storm*(.42+.58*day),wet*.8);
          float sunGlow=pow(max(0.,dot(normalize(vDirection),sunDirection)),32.);
          c+=vec3(.20,.13,.045)*sunGlow*day*(1.-wet);
          float horizon=pow(1.-clamp(h,0.,1.),8.);
          c=mix(c,vec3(.83,.86,.76),horizon*.12*day*(1.-wet));
          c+=vec3(.4,.55,.8)*flash;
          gl_FragColor=vec4(c,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      }),
    )
    this.dome = new THREE.Mesh(
      this._geometry(new THREE.SphereGeometry(500, 48, 24)),
      this.skyMaterial,
    )
    this.dome.frustumCulled = false
    this.dome.renderOrder = -100
    this.group.add(this.dome)
  }

  _makeClouds(count) {
    // Four original silhouettes, four instanced draws for the whole cloudscape.
    this.cloudMaterial = this._material(
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          top: { value: new THREE.Color() },
          shadow: { value: new THREE.Color() },
          sun: { value: new THREE.Vector3(1, 1, 0) },
          flash: { value: 0 },
        },
        vertexShader: `attribute float shadeBand; varying float vBand;
        void main(){ vBand=shadeBand;
          gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.); }`,
        fragmentShader: `varying float vBand; uniform vec3 top,shadow; uniform float flash;
        void main(){
          vec3 ink=mix(shadow,vec3(.24,.36,.39),.18);
          vec3 color=vBand<-.5 ? ink : vBand>1.5 ? mix(top,vec3(1.,.98,.85),.22) : mix(shadow,top,step(.5,vBand));
          gl_FragColor=vec4(color+flash*.25,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
      }),
    )
    this._puffs = []
    this.cloudMeshes = []
    const facing = new THREE.Object3D()
    for (let variant = 0; variant < 4; variant++) {
      const amount = Math.floor(count / 4) + (variant < count % 4 ? 1 : 0)
      const mesh = new THREE.InstancedMesh(
        this._geometry(paintedCloudGeometry(variant)),
        this.cloudMaterial,
        amount,
      )
      mesh.frustumCulled = false
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      this.cloudMeshes.push(mesh)
      this.group.add(mesh)
      for (let j = 0; j < amount; j++) {
        const angle = (j / amount) * TAU + variant * 0.71 + (this._random() - 0.5) * 0.25
        const low = variant === 3,
          tower = variant === 2
        const radius = low ? 390 : tower ? 330 : 280 + this._random() * 50
        const height = low
          ? 18 + this._random() * 26
          : tower
            ? 48 + this._random() * 45
            : 75 + this._random() * 95
        const center = new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius)
        facing.position.copy(center)
        facing.lookAt(0, 0, 0)
        const width = low
          ? 65 + this._random() * 30
          : tower
            ? 42 + this._random() * 24
            : 30 + this._random() * 30
        this._puffs.push({
          mesh,
          index: j,
          center,
          rotation: facing.quaternion.clone(),
          scale: new THREE.Vector3(width, width * (low ? 0.42 : tower ? 0.95 : 0.65), 1),
          phase: this._random() * TAU,
        })
      }
    }
    this._cloudYaw = new THREE.Quaternion()
    this._cloudUp = new THREE.Vector3(0, 1, 0)
    this._lastCloudTime = -1
  }

  _makeCelestials() {
    this.sunMaterial = this._material(
      new THREE.MeshBasicMaterial({ color: 0xffefd0, fog: false, toneMapped: false }),
    )
    this.sun = new THREE.Mesh(this._geometry(new THREE.CircleGeometry(8, 48)), this.sunMaterial)
    const shape = new THREE.Shape()
    shape.absarc(0, 0, 1, Math.PI / 2, Math.PI * 1.5, false)
    shape.bezierCurveTo(-0.45, -0.5, -0.45, 0.5, 0, 1)
    this.moon = new THREE.Mesh(
      this._geometry(new THREE.ShapeGeometry(shape, 40)),
      this._material(
        new THREE.MeshBasicMaterial({
          color: 0xe3eeff,
          fog: false,
          side: THREE.DoubleSide,
          toneMapped: false,
        }),
      ),
    )
    this.moon.scale.setScalar(9)
    this.group.add(this.sun, this.moon)
    const glowMaterial = this._material(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { opacity: { value: 1 } },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 vUv; uniform float opacity;
        void main(){float r=length(vUv-.5)*2.;float a=pow(max(0.,1.-r),3.)*.22*opacity;
        gl_FragColor=vec4(.55,.72,1.,a);}`,
      }),
    )
    this.moonGlow = new THREE.Mesh(this._geometry(new THREE.PlaneGeometry(60, 60)), glowMaterial)
    this.group.add(this.moonGlow)
  }

  _makeStars() {
    const positions = [],
      seeds = []
    for (let i = 0; i < 650; i++) {
      const y = 0.06 + this._random() * 0.94,
        a = this._random() * TAU
      const r = Math.sqrt(1 - y * y) * 455
      positions.push(Math.cos(a) * r, y * 455, Math.sin(a) * r)
      seeds.push(this._random())
    }
    const geometry = this._geometry(new THREE.BufferGeometry())
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('seed', new THREE.Float32BufferAttribute(seeds, 1))
    this.starMaterial = this._material(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { opacity: { value: 0 }, time: { value: 0 } },
        vertexShader: `attribute float seed; varying float vSeed;
        void main(){vSeed=seed; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize=1.5+seed*3.;}`,
        fragmentShader: `varying float vSeed; uniform float opacity,time;
        void main(){vec2 p=abs(gl_PointCoord-.5)*2.;float r=length(p);
        float a=pow(max(0.,1.-r),2.);a+=max(0.,1.-min(p.x,p.y)*15.)*max(0.,1.-r)*.25;
        a*=opacity*(.7+.3*sin(time*(.7+vSeed)+vSeed*40.));
        gl_FragColor=vec4(mix(vec3(.65,.78,1.),vec3(1.,.88,.7),vSeed),a);}`,
      }),
    )
    this.stars = new THREE.Points(geometry, this.starMaterial)
    this.stars.frustumCulled = false
    this.group.add(this.stars)
  }

  _makeRain(count) {
    this._drops = Array.from({ length: count }, () => ({
      x: (this._random() - 0.5) * 44,
      z: (this._random() - 0.5) * 44,
      phase: this._random() * 34,
      speed: 20 + this._random() * 12,
      length: 0.3 + this._random() * 0.55,
    }))
    const geometry = this._geometry(new THREE.BufferGeometry())
    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(count * 6), 3).setUsage(THREE.DynamicDrawUsage),
    )
    this.rainMaterial = this._material(
      new THREE.LineBasicMaterial({
        color: 0xb9daf2,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
      }),
    )
    this.rain = new THREE.LineSegments(geometry, this.rainMaterial)
    this.rain.frustumCulled = false
    this.group.add(this.rain)
  }

  get cycleSeconds() {
    return this.daySeconds + this.nightSeconds
  }
  set cycleSeconds(seconds) {
    this.setCycleDuration(seconds)
  }

  /** Change total duration, preserving the current day/night ratio and hour. */
  setCycleDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) throw new RangeError('Duración inválida.')
    const dayRatio = this.daySeconds / this.cycleSeconds
    return this.setPhaseDurations(seconds * dayRatio, seconds * (1 - dayRatio))
  }

  /** Day spans 06:00–18:00; night spans 18:00–06:00. Durations are real seconds. */
  setPhaseDurations(daySeconds, nightSeconds) {
    if (
      !Number.isFinite(daySeconds) ||
      daySeconds <= 0 ||
      !Number.isFinite(nightSeconds) ||
      nightSeconds <= 0 ||
      !Number.isFinite(daySeconds + nightSeconds)
    ) {
      throw new RangeError('Las duraciones del día y de la noche deben ser mayores que cero.')
    }
    this.daySeconds = daySeconds
    this.nightSeconds = nightSeconds
    return this
  }

  setHour(hour) {
    if (!Number.isFinite(hour)) throw new TypeError('La hora debe ser un número.')
    this.hour = mod24(hour)
    this.update(0)
    return this
  }

  /** Weather transitions independently of the clock; update() drives both. */
  setWeather(weather, transitionSeconds = 3) {
    if (!['clear', 'rain', 'storm'].includes(weather))
      throw new RangeError('Usa clear, rain o storm.')
    if (!Number.isFinite(transitionSeconds) || transitionSeconds < 0)
      throw new RangeError('Transición inválida.')
    this.weather = weather
    this._transition = {
      fromWet: this._wet,
      fromStorm: this._storm,
      wet: weather === 'clear' ? 0 : 1,
      storm: weather === 'storm' ? 1 : 0,
      elapsed: 0,
      duration: transitionSeconds,
    }
    this.update(0)
    return this
  }

  update(deltaSeconds, camera) {
    if (this.disposed) return
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0)
      throw new RangeError('deltaSeconds debe ser positivo o cero.')
    this.time += deltaSeconds
    if (this.autoCycle) {
      // Map hour to elapsed cycle time, then back; this also handles boundaries
      // and whole cycles in a single update without depending on frame rate.
      const solarHour = mod24(this.hour - 6)
      const elapsed =
        solarHour < 12
          ? (solarHour / 12) * this.daySeconds
          : this.daySeconds + ((solarHour - 12) / 12) * this.nightSeconds
      const phase = (elapsed + (deltaSeconds % this.cycleSeconds)) % this.cycleSeconds
      this.hour = mod24(
        phase < this.daySeconds
          ? 6 + (phase / this.daySeconds) * 12
          : 18 + ((phase - this.daySeconds) / this.nightSeconds) * 12,
      )
    }
    if (camera) {
      camera.getWorldPosition(this._cameraPosition)
      camera.getWorldQuaternion(this._cameraQuaternion)
      this.group.position.copy(this._cameraPosition)
      for (const disk of [this.sun, this.moon, this.moonGlow])
        disk.quaternion.copy(this._cameraQuaternion)
    }
    const tr = this._transition
    if (tr) {
      tr.elapsed += deltaSeconds
      const t = tr.duration === 0 ? 1 : smooth(0, 1, Math.min(1, tr.elapsed / tr.duration))
      this._wet = THREE.MathUtils.lerp(tr.fromWet, tr.wet, t)
      this._storm = THREE.MathUtils.lerp(tr.fromStorm, tr.storm, t)
      if (tr.elapsed >= tr.duration) this._transition = null
    }
    const angle = ((this.hour - 6) / 24) * TAU
    this._sunDirection.set(Math.cos(angle) * 0.85, Math.sin(angle), -0.45).normalize()
    this._moonDirection.copy(this._sunDirection).negate()
    const elevation = this._sunDirection.y
    const day = smooth(-0.15, 0.28, elevation)
    const dusk = (1 - smooth(0.06, 0.34, Math.abs(elevation))) * smooth(-0.22, -0.04, elevation)
    const night = 1 - smooth(-0.18, 0.08, elevation)
    this._boltAge += deltaSeconds
    if (this._storm > 0.7) {
      this._boltDelay -= deltaSeconds
      if (this._boltDelay <= 0) {
        this._boltAge = 0
        this._boltDelay = 4 + this._random() * 9
      }
    } else {
      this._boltAge = 100
      this._boltDelay = Math.max(this._boltDelay, 1)
    }
    const flash =
      this._storm *
      ((this._boltAge < 0.045 ? 0.8 : 0) + (this._boltAge > 0.13 && this._boltAge < 0.19 ? 1 : 0))
    const sky = this.skyMaterial.uniforms
    sky.day.value = day
    sky.dusk.value = dusk
    sky.wet.value = this._wet
    sky.flash.value = flash
    this.sun.position.copy(this._sunDirection).multiplyScalar(410)
    this.sun.visible = elevation > -0.04 && this._wet < 0.98
    this.sunMaterial.color.set(0xfff0cd).lerp(new THREE.Color(0xff9975), dusk)
    this.moon.position.copy(this._moonDirection).multiplyScalar(405)
    this.moonGlow.position.copy(this._moonDirection).multiplyScalar(407)
    this.moon.visible = this._moonDirection.y > -0.04
    this.moonGlow.visible = this.moon.visible
    this.moonGlow.material.uniforms.opacity.value = night * (1 - this._wet * 0.9)
    this.moon.material.color
      .set(0xe3eeff)
      .multiplyScalar((0.25 + 0.75 * night) * (1 - this._wet * 0.9))
    this.starMaterial.uniforms.opacity.value = night * (1 - this._wet)
    this.starMaterial.uniforms.time.value = this.time
    this.stars.rotation.y = this.time * 0.0015
    const clouds = this.cloudMaterial.uniforms
    clouds.sun.value.copy(this._sunDirection)
    clouds.top.value
      .set(0xeff0d8)
      .lerp(new THREE.Color(0x354b76), 1 - day)
      .lerp(new THREE.Color(0xffb2a0), dusk * 0.6)
      .lerp(new THREE.Color(0x5d6c88), this._wet * 0.8)
    clouds.shadow.value
      .set(0x9ebfb6)
      .lerp(new THREE.Color(0x182640), 1 - day)
      .lerp(new THREE.Color(0x9b7298), dusk * 0.6)
      .lerp(new THREE.Color(0x29354b), this._wet * 0.8)
    clouds.flash.value = flash
    // Distant painted shapes need only 10 Hz matrix updates; uniforms remain smooth.
    if (this.time - this._lastCloudTime >= 0.1 || this._lastCloudTime < 0) {
      this._lastCloudTime = this.time
      const a = this.time * 0.0015,
        c = Math.cos(a),
        s = Math.sin(a)
      this._cloudYaw.setFromAxisAngle(this._cloudUp, -a)
      this._puffs.forEach((puff) => {
        this._position.set(
          puff.center.x * c - puff.center.z * s,
          puff.center.y + Math.sin(this.time * 0.04 + puff.phase) * 0.35,
          puff.center.x * s + puff.center.z * c,
        )
        this._rotation.copy(this._cloudYaw).multiply(puff.rotation)
        this._matrix.compose(this._position, this._rotation, puff.scale)
        puff.mesh.setMatrixAt(puff.index, this._matrix)
      })
      this.cloudMeshes.forEach((mesh) => {
        mesh.instanceMatrix.needsUpdate = true
      })
    }
    this.rain.visible = this._wet > 0.001
    this.rainMaterial.opacity = this._wet * (0.35 + 0.2 * this._storm)
    if (this.rain.visible) {
      const array = this.rain.geometry.attributes.position.array
      this._drops.forEach((drop, i) => {
        const y = 24 - ((this.time * drop.speed + drop.phase) % 34)
        const x = ((((drop.x + this.time * (1.3 + this._storm) + 22) % 44) + 44) % 44) - 22
        const offset = i * 6
        array[offset] = x
        array[offset + 1] = y
        array[offset + 2] = drop.z
        array[offset + 3] = x + 0.12
        array[offset + 4] = y - drop.length
        array[offset + 5] = drop.z
      })
      this.rain.geometry.attributes.position.needsUpdate = true
    }
    if (this.sunLight) {
      this.sunLight.position.copy(this._sunDirection).multiplyScalar(100)
      this.sunLight.intensity = (0.08 + day * 2) * (1 - this._wet * 0.82)
      this.sunLight.color.copy(this.sunMaterial.color)
      this.fillLight.intensity = 0.12 + day * 0.8
      this.flashLight.intensity = flash * 5
    }
    if (this.fog) {
      this.fog.color
        .set(0xb5d9ed)
        .lerp(new THREE.Color(0x15223f), 1 - day)
        .lerp(new THREE.Color(0xba7e92), dusk * 0.55)
        .lerp(new THREE.Color(0x526279), this._wet * 0.65)
      this.fog.density = 0.0012 + this._wet * 0.006
    }
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.group.removeFromParent()
    this.cloudMeshes.forEach((mesh) => mesh.dispose())
    for (const geometry of this._geometries) geometry.dispose()
    for (const material of this._materials) material.dispose()
    this.sunLight?.dispose()
    this.fillLight?.dispose()
    this.flashLight?.dispose()
    if (this.fog && this.scene.fog === this.fog) this.scene.fog = this._previousFog
    this._geometries.clear()
    this._materials.clear()
  }
}
