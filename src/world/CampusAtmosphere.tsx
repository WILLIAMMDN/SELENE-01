import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as T from 'three'
import { Solid, Stroke, Sign, toon } from './ArtKit'
import { groundHeight, canWalk } from './worldData'
import { CAMPUS_ROADS, CAMPUS_TREES, insideBuilding } from './campusLayout'

function Grass({reduced}:{reduced:boolean}){
 const instances=useRef<T.InstancedMesh>(null),time=useMemo(()=>({value:0}),[])
 const blades=useMemo(()=>{
  const g=new T.BufferGeometry(),p:number[]=[],indices:number[]=[]
  for(let i=0;i<4;i++){const angle=i*2.1,dx=Math.cos(angle)*.035,dz=Math.sin(angle)*.035,h=.16+i*.035,k=p.length/3;
   p.push(-dx,0,-dz,dx,0,dz,-dx*.6,h*.5,-dz*.6,dx*.6,h*.5,dz*.6,dx*.8,h,dz*.8+.055);indices.push(k,k+1,k+2,k+1,k+3,k+2,k+2,k+3,k+4)}
  g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g
 },[])
 const material=useMemo(()=>{
  const m=new T.MeshToonMaterial({color:'#37754f',side:T.DoubleSide,gradientMap:toon('#37754f').gradientMap})
  m.onBeforeCompile=shader=>{shader.uniforms.breeze=time;shader.vertexShader='uniform float breeze;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(breeze*1.5 + instanceMatrix[3].x*.7 + instanceMatrix[3].z*.3)*position.y*.16;')};return m
 },[time])
 const points=useMemo(()=>{
  const routes=CAMPUS_ROADS.map(r=>({curve:new T.CatmullRomCurve3(r.points.map(([x,z])=>new T.Vector3(x,0,z))),width:r.width}))
  const samples=routes.map(r=>({points:r.curve.getPoints(160),margin:r.width/2+.65}))
  const result:[number,number,number][]=[]
  routes.forEach(({curve,width},j)=>{for(let i=0;i<80;i++){const p=curve.getPoint(i/80),t=curve.getTangent(i/80),side=i%2?1:-1,offset=width*.5+.95+(i%5)*.18,x=p.x-t.z*offset*side,z=p.z+t.x*offset*side;if(canWalk(x,z)&&!insideBuilding(x,z,1)&&!samples.some(r=>r.points.some(p=>Math.hypot(p.x-x,p.z-z)<r.margin)))result.push([x,z,(i*7+j)%11])}})
  return result
 },[])
 useEffect(()=>{if(!instances.current)return;const m=new T.Object3D();points.forEach(([x,z,seed],i)=>{m.position.set(x,groundHeight(x,z)+.03,z);m.rotation.y=seed*1.7;m.scale.setScalar(.65+seed*.06);m.updateMatrix();instances.current!.setMatrixAt(i,m.matrix);instances.current!.setColorAt(i,new T.Color(seed%3===0?'#9ebd75':seed%3===1?'#75a66f':'#bdd292'))});instances.current.instanceMatrix.needsUpdate=true},[points])
 useFrame((_,dt)=>{if(!reduced)time.value+=Math.min(dt,.05)})
 return <instancedMesh ref={instances} args={[blades,material,points.length]} frustumCulled={false}/>
}
function DriftingLeaves({reduced}:{reduced:boolean}){
 const ref=useRef<T.InstancedMesh>(null),elapsed=useRef(0),dummy=useMemo(()=>new T.Object3D(),[])
 const geometry=useMemo(()=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,.12,0,-.045,0,0,0,-.12,0,.045,0,0],3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return g},[])
 const material=useMemo(()=>new T.MeshToonMaterial({color:'#c7c79a',side:T.DoubleSide,gradientMap:toon('#c7c79a').gradientMap}),[])
 useFrame((_,dt)=>{
  if(!ref.current)return;if(!reduced)elapsed.current+=Math.min(dt,.05)
  for(let i=0;i<18;i++){const [x,z]=CAMPUS_TREES[(i*3)%CAMPUS_TREES.length],t=(elapsed.current*.13+i*.37)%1;dummy.position.set(x+Math.sin(t*6+i)*1.3,groundHeight(x,z)+.12+(1-t)*5.5,z+t*1.8);dummy.rotation.set(t*9,i+t*7,t*5);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix)}ref.current.instanceMatrix.needsUpdate=true
 })
 return <instancedMesh ref={ref} args={[geometry,material,18]} frustumCulled={false}/>
}
function Rail({x,z,angle=0}:{x:number;z:number;angle?:number}){return <group position={[x,groundHeight(x,z),z]} rotation={[0,angle,0]}>
 {[-2,0,2].map(a=><Solid key={a} position={[a,.48,0]} scale={[.12,.96,.13]} color="#d9ddc6"/>)}
 {[.48,.86].map(y=><Solid key={y} position={[0,y,0]} scale={[4.4,.16,.12]} color="#dde1cd"/>)}
 {[-1.9,1.9].map(a=><Solid key={a} position={[a,.86,.075]} scale={[.12,.18,.025]} color="#b96958" outline={false}/>)}
 </group>}
export default function CampusAtmosphere({reduced=false}:{reduced?:boolean}){return <>
 <Grass reduced={reduced}/><DriftingLeaves reduced={reduced}/>
 {[[-11,40,-.12],[-20,43,-.3],[-32,47,-.1],[6,49,Math.PI/2],[6,55,Math.PI/2]].map(([x,z,a],i)=><Rail key={i} x={x} z={z} angle={a}/>)}
 {[[8,20],[-30,15],[-57,-23],[30,4]].map(([x,z],i)=><group key={i} position={[x,groundHeight(x,z),z]} rotation={[0,i*.7,0]}><Solid position={[0,.55,0]} scale={[.85,1.1,.42]} color="#78aaa1"/><Solid position={[0,.86,.23]} scale={[.55,.18,.035]} color="#dce0d5"/><Stroke points={[[-.28,.13,.23],[-.27,.7,.23],[.28,.7,.23],[.28,.13,.23]]} width={.008}/><Sign text="SELENE" position={[0,.4,.25]} scale={[.45,.11,1]}/></group>)}
 {[[7,36],[-10,25],[16,19],[-28,39],[-39,36],[45,18]].map(([x,z],i)=><group key={i} position={[x,groundHeight(x,z),z]} rotation={[0,i*1.1,0]}><Solid kind="sphere" position={[0,.17,0]} scale={[.5,.27,.34]} color="#c1c6a5"/><Solid kind="sphere" position={[.44,.09,.2]} scale={[.22,.13,.18]} color="#a6b297"/><Stroke points={[[-.24,.34,.18],[.03,.39,.19],[.18,.28,.25]]} width={.008} color="#60745e"/></group>)}
 </>}
