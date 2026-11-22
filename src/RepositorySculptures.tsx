import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { CinemaPose } from './ProjectCinema'

type Props = { pose:MutableRefObject<CinemaPose>; motion:boolean; kind:'jobs'|'portfolio' }
const copper={color:'#c7794e',metalness:.82,roughness:.26}
const ivory={color:'#e3cba6',metalness:.6,roughness:.32}
const dark={color:'#343b35',metalness:.65,roughness:.35}

export default function RepositorySculpture({pose,motion,kind}:Props) {
  const root=useRef<THREE.Group>(null), assembly=useRef<THREE.Group>(null)
  const pieces=useRef<(THREE.Group|null)[]>([])
  const presence=useRef(0)
  const {size}=useThree()
  const card=useMemo(()=>new RoundedBoxGeometry(1.3,1.75,.13,3,.075),[])
  const blade=useMemo(()=>{
    const shape=new THREE.Shape()
    shape.moveTo(.48,-.17);shape.lineTo(2.65,-.17)
    shape.quadraticCurveTo(2.7,.55,2.16,1.05)
    shape.lineTo(.72,.42);shape.closePath()
    return new THREE.ExtrudeGeometry(shape,{depth:.095,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,curveSegments:18})
  },[])
  useEffect(()=>()=>{card.dispose();blade.dispose()},[card,blade])
  useFrame(({clock},dt)=>{
    if(!root.current||!assembly.current)return
    const active=pose.current.chapter===(kind==='jobs'?13:12)
    const delta=Math.min(dt,.05)
    presence.current=motion?THREE.MathUtils.damp(presence.current,Number(active),5,delta):Number(active)
    const amount=presence.current
    root.current.visible=amount>.003
    if(!root.current.visible)return
    const small=size.width<=900&&size.height>560
    root.current.scale.setScalar((small?Math.min(.95,size.width/size.height*1.45):1)*(.8+amount*.2))
    root.current.position.set(0,active?-(1-amount):6*(1-amount),active?-8*(1-amount):3*(1-amount))
    const p=motion?pose.current.progress:.65
    assembly.current.rotation.set(kind==='jobs'?.12:0,kind==='jobs'?-.25-p*.3:-.3+p*.5,kind==='jobs'?0:-.12)
    pieces.current.forEach((piece,i)=>{
      if(!piece)return
      if(kind==='jobs'){
        // Each listing leaves the input stack, passes the gate, and settles in a review tray.
        const t=THREE.MathUtils.smoothstep(p,.1+i*.035,.4+i*.035)
        piece.position.set(THREE.MathUtils.lerp(-2.4,1.95,t),THREE.MathUtils.lerp(-.4+i*.075,-1.15+Math.floor(i/3)*.19,t)+Math.sin(t*Math.PI)*1.15,THREE.MathUtils.lerp((i-4)*.12,(i%3-1)*1.65,t))
        piece.rotation.set(-Math.PI/2*t,.1*(1-t),-.08*(1-t))
      } else {
        // Scroll opens an overlapping mechanical aperture; idle motion is a small rotation only.
        const angle=i/10*Math.PI*2, open=THREE.MathUtils.smoothstep(p,.1,.78)
        piece.position.set(Math.cos(angle)*open*.9,Math.sin(angle)*open*.9,i*.018)
        piece.rotation.z=angle+open*.32+(motion?Math.sin(clock.elapsedTime*.35)*.012:0)
      }
    })
  })
  return <group ref={root} visible={false}><group ref={assembly}>
    {kind==='jobs'?<>
      {Array.from({length:9},(_,i)=><group key={i} ref={el=>{pieces.current[i]=el}}>
        <mesh geometry={card} castShadow receiveShadow><meshStandardMaterial {...(i%3===0?ivory:copper)}/></mesh>
        {[0,1,2].map(line=><mesh key={line} position={[-.08,.35-line*.3,.085]}><boxGeometry args={[line===2?.5:.85,.055,.025]}/><meshStandardMaterial {...dark}/></mesh>)}
        <mesh position={[.42,.63,.085]}><circleGeometry args={[.075,20]}/><meshStandardMaterial color={i%3===0?'#476957':i%3===1?'#814d35':'#5d635e'}/></mesh>
      </group>)}
      {[-1,0,1].map((slot,i)=><group key={slot} position={[1.95,-1.38,slot*1.65]}>
        <mesh receiveShadow castShadow><boxGeometry args={[1.65,.18,1.55]}/><meshStandardMaterial {...dark}/></mesh>
        <mesh position={[0,.12,.73]}><boxGeometry args={[1.65,.16,.08]}/><meshStandardMaterial {...(i===0?ivory:copper)}/></mesh>
      </group>)}
      <group position={[-.2,0,0]}>
        {[-1,1].map(side=><mesh key={side} position={[0,.1,side*1.05]} castShadow><boxGeometry args={[.16,3.4,.16]}/><meshStandardMaterial {...ivory}/></mesh>)}
        <mesh position={[0,1.8,0]} castShadow><boxGeometry args={[.16,.16,2.26]}/><meshStandardMaterial {...ivory}/></mesh>
      </group>
    </>:<>
      {Array.from({length:10},(_,i)=><group key={i} ref={el=>{pieces.current[i]=el}}><mesh geometry={blade} castShadow receiveShadow><meshPhysicalMaterial {...(i%5===0?ivory:copper)} clearcoat={.25}/></mesh></group>)}
      <mesh position={[0,0,-.3]} castShadow><torusGeometry args={[3.08,.13,16,96]}/><meshStandardMaterial {...dark}/></mesh>
      <mesh position={[0,0,-.48]} castShadow><torusGeometry args={[2.85,.07,12,96]}/><meshStandardMaterial {...ivory}/></mesh>
      <mesh position={[0,0,-.8]}><circleGeometry args={[2.7,64]}/><meshStandardMaterial color="#151a17" roughness={.4} metalness={.7}/></mesh>
    </>}
  </group></group>
}
