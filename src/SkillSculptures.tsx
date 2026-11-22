import { useFrame,useThree } from '@react-three/fiber'
import { useEffect,useMemo,useRef,type MutableRefObject } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import type { CinemaPose } from './ProjectCinema'

const copper={color:'#c7794e',metalness:.88,roughness:.23}
const dark={color:'#242623',metalness:.78,roughness:.3}
const pale={color:'#dfc8a2',metalness:.65,roughness:.25}
type Props={pose:MutableRefObject<CinemaPose>;motion:boolean;kind:number}

export default function SkillSculpture({pose,motion,kind}:Props){
  const group=useRef<THREE.Group>(null)
  const assembly=useRef<THREE.Group>(null)
  const parts=useRef<(THREE.Object3D|null)[]>([])
  const presence=useRef(0)
  const {size}=useThree()
  const box=useMemo(()=>new RoundedBoxGeometry(1,1,1,3,.065),[])
  const sectors=useMemo(()=>kind===1?[.26,.21,.18,.2,.15].map((fraction,index,all)=>{
    const start=all.slice(0,index).reduce((a,b)=>a+b,0)*Math.PI*2+.035
    const end=start+fraction*Math.PI*2-.07
    const shape=new THREE.Shape()
    shape.absarc(0,0,2.45,start,end,false)
    shape.absarc(0,0,1.1,end,start,true)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape,{depth:.5+index*.17,bevelEnabled:true,bevelSize:.055,bevelThickness:.045,bevelSegments:3,curveSegments:36})
  }):[],[kind])
  useEffect(()=>()=>{box.dispose();sectors.forEach(g=>g.dispose())},[box,sectors])
  useFrame(({clock,pointer},delta)=>{
    if(!group.current||!assembly.current)return
    const active=pose.current.chapter===8+kind
    presence.current=motion?THREE.MathUtils.damp(presence.current,active?1:0,5,Math.min(delta,.05)):active?1:0
    const amount=presence.current
    group.current.visible=amount>.003
    if(!group.current.visible)return
    const p=motion?pose.current.progress:.3
    const open=THREE.MathUtils.smoothstep(p,.25,.78)
    const small=(size.width<=900 && size.height>560)
    const fit=small?Math.min(.9,size.width/size.height*1.55):1
    group.current.scale.setScalar((.8+amount*.2)*fit)
    group.current.position.set(0,active?-(1-amount):7*(1-amount),active?-8*(1-amount):3*(1-amount))
    assembly.current.rotation.set(kind===1?-.65:kind===3?.2:0,-.35-open*.55+(motion?pointer.x*.04:0),kind===1?-.15:0)
    parts.current.forEach((part,i)=>{
      if(!part)return
      if(kind===0){part.position.y=(i-1)*(.75+open*.8);part.rotation.y=(motion?clock.elapsedTime*.12:0)+i*.16}
      if(kind===1){const angle=i*1.28;part.position.set(Math.cos(angle)*open*.55,Math.sin(angle)*open*.55,open*(i-2)*.25)}
      if(kind===2){const t=motion?(clock.elapsedTime*.2+i*.25)%1:i*.25;part.position.set((i%2-.5)*.8,Math.floor(i/2)*.65-.35,-3.4+t*6.8);part.rotation.y=t*Math.PI/2}
      if(kind===3){part.position.y=i===0?.45+open*1.7:.15;part.rotation.y=i===0?open*.15:0}
    })
  })
  return <group ref={group}><group ref={assembly}>
    {kind===0&&<>{[0,1,2].map(i=><group key={i} ref={el=>{parts.current[i]=el}}>
      <mesh castShadow receiveShadow><cylinderGeometry args={[1.9,1.9,.48,80]}/><meshStandardMaterial {...(i===1?copper:dark)}/></mesh>
      <mesh rotation={[Math.PI/2,0,0]} position={[0,.25,0]}><torusGeometry args={[1.74,.055,12,80]}/><meshStandardMaterial {...pale}/></mesh>
      {Array.from({length:12},(_,j)=><mesh key={j} position={[Math.cos(j/12*Math.PI*2)*1.89,0,Math.sin(j/12*Math.PI*2)*1.89]} rotation={[0,-j/12*Math.PI*2,0]}><boxGeometry args={[.08,.16,.08]}/><meshStandardMaterial {...copper}/></mesh>)}
      <mesh position={[0,.26,0]}><cylinderGeometry args={[.54,.54,.03,48]}/><meshStandardMaterial {...copper}/></mesh>
    </group>)}</>}
    {kind===1&&<group rotation={[-.35,0,0]}>{sectors.map((geometry,i)=><mesh key={i} geometry={geometry} ref={el=>{parts.current[i]=el}} castShadow receiveShadow><meshStandardMaterial {...(i===2?pale:copper)}/></mesh>)}</group>}
    {kind===2&&<>
      {[-.6,.6].map(z=><group key={z} position={[0,0,z]}>{[[0,2.1,4.4,.3], [0,-2.1,4.4,.3],[-2.1,0,.3,4.4],[2.1,0,.3,4.4]].map(([x,y,w,h],i)=><mesh key={i} geometry={box} position={[x,y,0]} scale={[w,h,.45]} castShadow><meshStandardMaterial {...(z>0?copper:dark)}/></mesh>)}</group>)}
      {[0,1,2,3].map(i=><mesh key={i} ref={el=>{parts.current[i]=el}} geometry={box} scale={[.48,.48,.75]} castShadow><meshStandardMaterial {...(i%2?pale:copper)}/></mesh>)}
    </>}
    {kind===3&&<group rotation={[.35,.15,-.12]}>
      <mesh geometry={box} scale={[4.8,.18,3.5]} receiveShadow castShadow><meshStandardMaterial color="#293b32" metalness={.4} roughness={.4}/></mesh>
      <mesh geometry={box} scale={[2.15,.38,1.7]} position={[0,.27,0]} castShadow><meshStandardMaterial {...dark}/></mesh>
      <mesh geometry={box} scale={[2.3,.12,1.85]} ref={el=>{parts.current[0]=el}} castShadow><meshStandardMaterial {...pale}/></mesh>
      {[-1,1].map(side=><group key={side}>{Array.from({length:12},(_,i)=><group key={i}>
        <mesh geometry={box} position={[(i-5.5)*.34,.05,side*1.65]} scale={[.1,.32,.42]} castShadow><meshStandardMaterial {...copper}/></mesh>
        <mesh position={[(i-5.5)*.34,.105,side*1.1]}><boxGeometry args={[.025,.015,.65]}/><meshStandardMaterial {...copper}/></mesh>
      </group>)}</group>)}
      {[-1,1].map(x=><mesh key={x} geometry={box} position={[x*1.8,.22,0]} scale={[.35,.3,.7]} castShadow><meshStandardMaterial {...dark}/></mesh>)}
      {[-1,1].flatMap(x=>[-1,1].map(z=><mesh key={`${x}${z}`} rotation={[Math.PI/2,0,0]} position={[x*2.1,.11,z*1.35]}><torusGeometry args={[.1,.035,8,20]}/><meshStandardMaterial {...pale}/></mesh>))}
    </group>}
  </group></group>
}
