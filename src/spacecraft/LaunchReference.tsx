import { Edges } from '@react-three/drei'
import { Solid, Sign, Stroke, toon } from '../world/ArtKit'
import { NASA_DIMENSIONS } from '../world/physicalScale'

function Segment({bottom,top,lower,upper=lower,color}:{bottom:number;top:number;lower:number;upper?:number;color:string}){
 return <mesh position={[0,(bottom+top)/2,0]} castShadow receiveShadow material={toon(color)}><cylinderGeometry args={[upper,lower,top-bottom,32]}/><Edges threshold={35} color="#35474a"/></mesh>
}
/** Static SLS Block 1 size reference: documented main envelopes, illustrated secondary details. */
export default function LaunchReference(){
 const d=NASA_DIMENSIONS.sls
 return <group name="SLS Block 1 / referencia dimensional">
  <Segment bottom={2} top={d.coreHeight} lower={d.coreDiameter/2} color="#bf8464"/>
  <Segment bottom={d.coreHeight} top={70} lower={4.2} upper={2.5} color="#e7e1cd"/>
  <Segment bottom={70} top={78.4} lower={2.5} color="#e7e1cd"/>
  <Segment bottom={78.4} top={83.2} lower={2.5} color="#8c9c95"/>
  <Segment bottom={83.2} top={86.55} lower={2.5} upper={1.15} color="#e7e1cd"/>
  <Segment bottom={86.55} top={95.8} lower={.45} color="#e7e1cd"/>
  <Segment bottom={95.8} top={d.height} lower={.45} upper={0} color="#e7e1cd"/>
  {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}${z}`} position={[x*1.65,0,z*1.65]}><Segment bottom={0} top={2.3} lower={1.05} upper={.65} color="#364b50"/></group>))}
  {[-1,1].map(side=><group key={side} position={[side*6.15,0,0]}>
   <Segment bottom={0} top={3} lower={1.85} upper={1.35} color="#35494d"/>
   <Segment bottom={3} top={d.boosterHeight-5} lower={d.boosterDiameter/2} color="#e7e1cd"/>
   <Segment bottom={d.boosterHeight-5} top={d.boosterHeight} lower={d.boosterDiameter/2} upper={.2} color="#e7e1cd"/>
   {[9,18,27,36,45].map(y=><Solid key={y} kind="cylinder" position={[0,y,0]} scale={[1.87,.22,1.87]} color="#657570"/>)}
  </group>)}
  <Sign text="SLS" sub="BLOCK 1" position={[0,43,4.22]} scale={[3,1.5,1]} bg="#bf8464"/>
  <group position={[16,0,-5]}>
   {[-2,2].flatMap(x=>[-2,2].map(z=><Solid key={`${x}${z}`} position={[x,52,z]} scale={[.45,104,.45]} color="#567e7b"/>))}
   {Array.from({length:13},(_,i)=>i*8+4).map(y=><group key={y}><Solid position={[0,y,0]} scale={[5,.25,5]} color="#8d9d93"/><Stroke points={[[-2,y-4,2],[2,y+4,2]]} width={.1} color="#567e7b"/></group>)}
   <Solid position={[-7,83,0]} scale={[14,.6,2]} color="#567e7b"/>
  </group>
 </group>
}
