import {Canvas,useFrame} from '@react-three/fiber'
import {Edges,Float,OrbitControls,Stars} from '@react-three/drei'
import {useCallback,useEffect,useRef} from 'react'
import * as THREE from 'three'
export type Station='briefing'|'hangar'|'launch'|'control'
const stations:{id:Station;name:string;x:number;z:number}[]=[
  {id:'briefing',name:'Centro de investigación',x:-12,z:-8},
  {id:'hangar',name:'Hangar de ingeniería',x:12,z:-8},
  {id:'launch',name:'Plataforma de lanzamiento',x:12,z:10},
  {id:'control',name:'Control de misión',x:-12,z:10},
]
function Building({x,z,color,roof}: {x:number;z:number;color:string;roof:string}) {
  return <group position={[x,0,z]}>
    <mesh position={[0,2.5,0]} castShadow receiveShadow><boxGeometry args={[8,5,7]}/><meshToonMaterial color={color}/><Edges color="#38515a" threshold={15}/></mesh>
    <mesh position={[0,5.5,0]} castShadow><boxGeometry args={[9.2,1.1,8.2]}/><meshToonMaterial color={roof}/><Edges color="#33424b"/></mesh>
    <mesh position={[0,1.55,3.53]}><boxGeometry args={[2,3.1,0.17]}/><meshToonMaterial color="#466c83"/></mesh>
    {[-2.8,2.8].map(xPos=><mesh key={xPos} position={[xPos,3.3,3.54]}><boxGeometry args={[1.5,1.4,0.12]}/><meshToonMaterial color="#a9d8e4"/></mesh>)}
  </group>
}
function Tree({x,z,s=1}:{x:number;z:number;s?:number}) {
  return <group position={[x,0,z]} scale={s}>
    <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[0.18,0.24,2.4,8]}/><meshToonMaterial color="#8e674a"/></mesh>
    <mesh position={[0,3.2,0]} castShadow><dodecahedronGeometry args={[1.65,0]}/><meshToonMaterial color="#729a76"/></mesh>
    <mesh position={[-0.7,2.8,0.2]} castShadow><dodecahedronGeometry args={[1.1,0]}/><meshToonMaterial color="#84aa84"/></mesh>
  </group>
}
const treePositions=[[-24,-20],[-20,-14],[-23,-2],[-25,10],[-19,18],[-7,-21],[1,-19],[8,-21],[20,-17],[24,-8],[22,0],[26,12],[18,20],[2,22],[-7,21],[-22,19],[-18,1],[20,-1]]
function Rocket(){
  return <group position={[12,0,10]}>
    <mesh position={[0,1,0]} receiveShadow><cylinderGeometry args={[6.5,6.5,0.6,32]}/><meshToonMaterial color="#c9c0a4"/></mesh>
    <mesh position={[0,5,0]} castShadow><cylinderGeometry args={[1.1,1.5,10,12]}/><meshToonMaterial color="#eee5d5"/></mesh>
    <mesh position={[0,11,0]} castShadow><coneGeometry args={[1.1,3,12]}/><meshToonMaterial color="#c46c61"/></mesh>
    <mesh position={[0,3.2,0]}><cylinderGeometry args={[1.51,1.51,0.45,12]}/><meshToonMaterial color="#c46c61"/></mesh>
    <mesh position={[3,6,0]} castShadow><boxGeometry args={[0.6,13,0.8]}/><meshToonMaterial color="#536c7d"/></mesh>
    <mesh position={[1.7,12.5,0]}><boxGeometry args={[3.4,0.4,0.75]}/><meshToonMaterial color="#698291"/></mesh>
  </group>
}
function AstronautModel(){
  return <group>
    <mesh position={[0,0.95,0]} castShadow><capsuleGeometry args={[0.35,0.9,6,12]}/><meshToonMaterial color="#e9ddc4"/></mesh>
    <mesh position={[0,1.97,0]} castShadow><sphereGeometry args={[0.37,16,12]}/><meshToonMaterial color="#d3a58e"/></mesh>
    <mesh position={[0,2.26,-0.12]} castShadow><sphereGeometry args={[0.36,14,10,0,Math.PI*2,0,Math.PI/1.7]}/><meshToonMaterial color="#293643"/></mesh>
    <mesh position={[0,1.12,-0.34]} castShadow><boxGeometry args={[0.62,0.86,0.24]}/><meshToonMaterial color="#c8775c"/></mesh>
    {[-0.23,0.23].map((x,i)=><mesh key={i} position={[x,0.33,0]} castShadow><capsuleGeometry args={[0.12,0.55,4,10]}/><meshToonMaterial color="#516678"/></mesh>)}
  </group>
}
function OrbiModel({robot}:{robot:React.RefObject<THREE.Group|null>}) {
  return <group ref={robot}>
    <mesh castShadow><sphereGeometry args={[0.55,16,12]}/><meshToonMaterial color="#fbf3df"/></mesh>
    <mesh position={[0,0,0.45]}><boxGeometry args={[0.7,0.3,0.12]}/><meshToonMaterial color="#27495a"/></mesh>
    {[-0.17,0.17].map(x=><mesh key={x} position={[x,0,0.53]}><sphereGeometry args={[0.07,10,8]}/><meshBasicMaterial color="#c7ffdd"/></mesh>)}
    <mesh position={[0,0.7,0]}><cylinderGeometry args={[0.04,0.04,0.42,8]}/><meshToonMaterial color="#728992"/></mesh>
    <mesh position={[0,0.95,0]}><sphereGeometry args={[0.12,10,10]}/><meshBasicMaterial color="#ebb269"/></mesh>
  </group>
}
function Campus({onInteract}:{onInteract:(id:Station)=>void}){
  const player=useRef<THREE.Group>(null)
  const robot=useRef<THREE.Group>(null)
  const keys=useRef(new Set<string>())
  const activate=useCallback(()=>{
    const p=player.current?.position
    if(!p)return
    const nearest=stations.map(s=>({id:s.id,d:Math.hypot(p.x-s.x,p.z-s.z)})).sort((a,b)=>a.d-b.d)[0]
    if(nearest && nearest.d<7)onInteract(nearest.id)
  },[onInteract])
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{
      const target=e.target
      if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement)return
      keys.current.add(e.code)
      if(e.code==='KeyE')activate()
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()
    }
    const up=(e:KeyboardEvent)=>keys.current.delete(e.code)
    window.addEventListener('keydown',down)
    window.addEventListener('keyup',up)
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[activate])
  useFrame((state,delta)=>{
    const p=player.current
    if(!p)return
    const dx=(keys.current.has('KeyD')||keys.current.has('ArrowRight')?1:0)-(keys.current.has('KeyA')||keys.current.has('ArrowLeft')?1:0)
    const dz=(keys.current.has('KeyS')||keys.current.has('ArrowDown')?1:0)-(keys.current.has('KeyW')||keys.current.has('ArrowUp')?1:0)
    const length=Math.hypot(dx,dz)||1
    p.position.x=THREE.MathUtils.clamp(p.position.x+dx/length*delta*6,-28,28)
    p.position.z=THREE.MathUtils.clamp(p.position.z+dz/length*delta*6,-26,26)
    if(dx||dz)p.rotation.y=Math.atan2(dx,dz)
    state.camera.position.lerp(new THREE.Vector3(p.position.x+8,9,p.position.z+12),0.065)
    state.camera.lookAt(p.position.x,1.5,p.position.z)
    const r=robot.current
    if(r)r.position.lerp(new THREE.Vector3(p.position.x+1.4,2.5+Math.sin(state.clock.elapsedTime*2)*0.12,p.position.z+0.6),0.045)
  })
  return <>
    <color attach="background" args={['#a8cfd3']}/><fog attach="fog" args={['#a8cfd3',45,110]}/>
    <ambientLight intensity={1.65}/><directionalLight position={[10,19,12]} intensity={2.7} castShadow shadow-mapSize={[1024,1024]}/>
    <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[110,110]}/><meshToonMaterial color="#8eb497"/></mesh>
    <mesh position={[0,0.03,0]} receiveShadow><boxGeometry args={[6,0.06,60]}/><meshToonMaterial color="#c9bca5"/></mesh>
    <mesh position={[0,0.04,0]} receiveShadow><boxGeometry args={[45,0.06,5]}/><meshToonMaterial color="#cfbea5"/></mesh>
    <mesh position={[-12,0.07,-8]}><boxGeometry args={[12,0.1,12]}/><meshToonMaterial color="#dfd6bf"/></mesh>
    <Building x={-12} z={-8} color="#e8d8bd" roof="#607f88"/>
    <Building x={12} z={-8} color="#e2e1d4" roof="#678a80"/>
    <Building x={-12} z={10} color="#ebd9c8" roof="#71829b"/>
    {treePositions.map(([x,z],i)=><Tree key={i} x={x} z={z} s={0.82+(i%4)*0.1}/>)}
    <Rocket/>
    <group ref={player} position={[0,0,8]}><AstronautModel/></group>
    <OrbiModel robot={robot}/>
  </>
}
function Orbiter(){
  const ref=useRef<THREE.Group>(null)
  useFrame((state,delta)=>{
    if(ref.current){ref.current.rotation.y+=delta*0.25;ref.current.position.y=2.5+Math.sin(state.clock.elapsedTime*0.8)*0.4}
  })
  return <group ref={ref} position={[0,2.5,0]}>
    <mesh castShadow><cylinderGeometry args={[0.8,0.8,2.2,8]}/><meshToonMaterial color="#d9b06c"/></mesh>
    <mesh position={[0,0,-1.4]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.8,0.8,0.1,24]}/><meshToonMaterial color="#e2e6ea"/></mesh>
    {[-3.2,3.2].map(x=><mesh key={x} position={[x,0,0]} castShadow><boxGeometry args={[5.6,0.12,1.9]}/><meshToonMaterial color="#456a97"/><Edges color="#a5c5d5"/></mesh>)}
  </group>
}
function OrbitScene(){
  return <><color attach="background" args={['#121a2d']}/><ambientLight intensity={1.9}/>
    <directionalLight position={[11,10,13]} intensity={3}/>
    <Stars radius={100} depth={50} count={1400} factor={3} saturation={0} fade speed={0}/>
    <mesh position={[-8,-10,-14]}><sphereGeometry args={[12,48,36]}/><meshToonMaterial color="#949ba3" /></mesh>
    <Orbiter/><OrbitControls makeDefault minDistance={7} maxDistance={22} enablePan={false}/>
  </>
}
export default function GameWorld({mode,onInteract}:{mode:'campus'|'orbit';onInteract:(id:Station)=>void}){
  return <div className="world-frame" aria-label="Mundo 3D de SELENE-01">
    <Canvas camera={{position:[8,9,20],fov:48,near:0.1,far:400}} shadows dpr={[1,1.6]}>
      {mode==='orbit'?<OrbitScene/>:<Campus onInteract={onInteract}/>}
    </Canvas>
    <div className="world-overlay"><span className="eyebrow">{mode==='orbit'?'ÓRBITA LUNAR · SIMULACIÓN':'ACADEMIA SELENE · CAMPUS EXPLORABLE'}</span><strong>{mode==='orbit'?'Operaciones científicas':'Tú diseñas la misión'}</strong></div>
    <div className="world-help">{mode==='orbit'?'Arrastra para girar el orbitador · Rueda para acercar':'WASD o flechas: caminar · E: entrar a una estación cercana'}</div>
  </div>
}
