import { useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Solid, Sign } from './ArtKit'
import { PALETTE as P } from './worldData'

/** 1.95 m including helmet. Root at the soles; articulated adult limb proportions. */
export default function Astronaut({moving,phase}:{moving?:MutableRefObject<number>;phase?:MutableRefObject<number>}){
 const leftLeg=useRef<Group>(null),rightLeg=useRef<Group>(null),leftArm=useRef<Group>(null),rightArm=useRef<Group>(null)
 useFrame(()=>{const stride=Math.sin(phase?.current??0)*(moving?.current??0)*.35
  if(leftLeg.current)leftLeg.current.rotation.x=stride
  if(rightLeg.current)rightLeg.current.rotation.x=-stride
  if(leftArm.current)leftArm.current.rotation.x=-stride*.7
  if(rightArm.current)rightArm.current.rotation.x=stride*.7
 })
 return <group name="Tripulante / 1.95 m">
  <Solid kind="capsule" position={[0,1.24,0]} scale={[.52,.29,.36]} color={P.paper}/>
  <Solid position={[0,1.22,-.25]} scale={[.42,.56,.22]} color={P.coral}/>
  <Solid position={[0,1.23,-.38]} scale={[.3,.36,.04]} color={P.cream}/>
  <Sign text="S—01" position={[0,1.31,-.405]} rotation={[0,Math.PI,0]} scale={[.25,.08,1]} bg={P.cream}/>
  <Solid kind="sphere" position={[0,1.74,0]} scale={[.22,.21,.23]} color={P.cream}/>
  <Solid kind="sphere" position={[0,1.75,.14]} scale={[.18,.14,.14]} color={P.teal}/>
  <Solid kind="sphere" position={[-.07,1.8,.26]} scale={[.045,.025,.012]} color={P.aqua} outline={false}/>
  <Solid kind="torus" position={[0,1.53,0]} rotation={[Math.PI/2,0,0]} scale={.18} color={P.ink}/>
  {[-1,1].map(side=><group key={`arm${side}`} ref={side<0?leftArm:rightArm} position={[side*.31,1.43,0]}>
   <Solid kind="capsule" position={[side*.02,-.15,0]} scale={[.19,.19,.21]} color={P.paper}/>
   <Solid kind="capsule" position={[side*.035,-.43,.035]} scale={[.17,.16,.18]} color={P.paper}/>
   <Solid position={[side*.035,-.53,.035]} scale={[.18,.055,.19]} color={P.coral}/>
   <Solid kind="sphere" position={[side*.035,-.64,.05]} scale={[.095,.12,.1]} color={P.teal}/>
  </group>)}
  {[-1,1].map(side=><group key={`leg${side}`} ref={side<0?leftLeg:rightLeg} position={[side*.15,.94,0]}>
   <Solid kind="capsule" position={[0,-.2,0]} scale={[.25,.22,.27]} color={P.paper}/>
   <Solid kind="sphere" position={[0,-.43,.025]} scale={[.115,.12,.13]} color={P.cream}/>
   <Solid kind="capsule" position={[0,-.61,0]} scale={[.21,.18,.23]} color={P.paper}/>
   <Solid position={[0,-.82,.07]} scale={[.24,.19,.35]} color={P.teal}/>
   <Solid position={[0,-.915,.07]} scale={[.245,.05,.36]} color={P.ink}/>
  </group>)}
 </group>
}
