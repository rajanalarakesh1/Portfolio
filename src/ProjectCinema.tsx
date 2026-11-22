import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import fontData from 'three/examples/fonts/optimer_bold.typeface.json'
import SkillSculpture from './SkillSculptures'
import RepositorySculpture from './RepositorySculptures'

export type CinemaPose = { chapter: number; progress: number }
type SceneProps = { pose: MutableRefObject<CinemaPose>; motion: boolean }
const copper = { color: '#c7794e', metalness: .88, roughness: .23, envMapIntensity: 1.4 }
const graphite = { color: '#242623', metalness: .78, roughness: .3 }
const ivory = { color: '#dfc8a2', metalness: .65, roughness: .25 }
const ease = (a: number, b: number, value: number) => THREE.MathUtils.smoothstep(value, a, b)

function useScenePresence(group: MutableRefObject<THREE.Group | null>, chapter: number | number[], { pose, motion }: SceneProps) {
  const presence = useRef(0)
  const { size } = useThree()
  useFrame((_, delta) => {
    if (!group.current) return
    const active = Array.isArray(chapter) ? chapter.includes(pose.current.chapter) : pose.current.chapter === chapter
    presence.current = motion ? THREE.MathUtils.damp(presence.current, active ? 1 : 0, 5, Math.min(delta, .05)) : active ? 1 : 0
    const amount = presence.current
    group.current.visible = amount > .003
    const screenScale = (size.width <= 900 && size.height > 560) ? Math.min(1, size.width / size.height * (chapter === 3 ? 1.4 : 1.7)) : 1
    group.current.scale.setScalar((.8 + amount * .2) * screenScale)
    group.current.position.z = active ? -8 * (1 - amount) : 3 * (1 - amount)
    group.current.position.y = active ? -(1 - amount) : 7 * (1 - amount)
  })
}

function MonogramJourney({ pose, motion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const { size: screen } = useThree()
  const form = useRef<THREE.Group>(null)
  const layers = useRef<(THREE.Mesh | null)[]>([])
  useScenePresence(group, -2, { pose, motion })
  const geometry = useMemo(() => {
    const letter = new TextGeometry('R', { font: new FontLoader().parse(fontData), size: 4.3, depth: .19, curveSegments: 24, bevelEnabled: true, bevelThickness: .035, bevelSize: .045, bevelSegments: 3 })
    letter.center()
    letter.applyMatrix4(new THREE.Matrix4().set(1,.16,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1))
    return letter
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(({ clock, pointer }, delta) => {
    if (!form.current || !group.current?.visible) return
    const chapter = pose.current.chapter
    const p = motion ? pose.current.progress : .3
    const spread = chapter === 5 ? .25 + p * .9 : chapter === 6 ? .9 - p * .5 : chapter === 4 ? .35 + p*.35 : .02
    const rotation = chapter === -2 ? -.48 + p*.8 : chapter === -1 ? .3 + p*.7 : chapter === 5 ? -.5-p*.55 : chapter === 6 ? -1+p*.75 : -.35
    const size = chapter === -2 ? 1.4 : chapter === -1 ? 1.15 : chapter === 7 ? 1.2 : 1
    const damping = motion ? 4 : 100
    const lift = (screen.width <= 900 && screen.height > 560) && chapter >= 4 && chapter <= 6 ? ease(0,.8,p)*8 : 0
    form.current.position.y = THREE.MathUtils.damp(form.current.position.y, lift, damping, delta)
    form.current.rotation.y = THREE.MathUtils.damp(form.current.rotation.y, rotation + (motion ? pointer.x*.12 : 0), damping, delta)
    form.current.rotation.z = THREE.MathUtils.damp(form.current.rotation.z, chapter === 6 ? .16 : -.1, damping, delta)
    form.current.rotation.x = THREE.MathUtils.damp(form.current.rotation.x, -.12 + (motion ? Math.sin(clock.elapsedTime*.45)*.025 : 0), damping, delta)
    form.current.scale.setScalar(THREE.MathUtils.damp(form.current.scale.x, size, damping, delta))
    layers.current.forEach((layer,i) => {
      if (!layer) return
      layer.position.z = THREE.MathUtils.damp(layer.position.z, (i-1.5)*(.28+spread), damping, delta)
      layer.position.x = THREE.MathUtils.damp(layer.position.x, chapter === 5 ? (i-1.5)*p*.24 : 0, damping, delta)
    })
  })
  return <group ref={group}><group ref={form}>{[0,1,2,3].map(i => <mesh key={i} geometry={geometry} ref={el=>{layers.current[i]=el}} castShadow receiveShadow><meshPhysicalMaterial {...copper} clearcoat={.5} roughness={.2}/></mesh>)}</group></group>
}

function Lighting() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const room = new RoomEnvironment()
    const generator = new THREE.PMREMGenerator(gl)
    const target = generator.fromScene(room, .035)
    scene.environment = target.texture
    return () => { scene.environment = null; target.dispose(); room.dispose(); generator.dispose() }
  }, [gl, scene])
  return <>
    <ambientLight intensity={.35}/>
    <directionalLight position={[-5, 9, 5]} color="#ffe7c6" intensity={3.5} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.035}/>
    <spotLight position={[5, 4, -5]} color="#e18a51" intensity={100} angle={1.2} penumbra={1}/>
    <spotLight position={[-3, -2, 5]} color="#cadbdb" intensity={40} angle={1.1} penumbra={1}/>
  </>
}

function Forecast({ pose, motion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  useScenePresence(group, 0, { pose, motion })
  const slices = useRef<(THREE.Mesh | null)[]>([])
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-3, -.9)
    shape.bezierCurveTo(-2.5, -.8, -2.5, .8, -1.8, .45)
    shape.bezierCurveTo(-1.2, .1, -1.3, 1.8, -.5, 1.25)
    shape.bezierCurveTo(.2, .65, .3, 2.2, 1.1, 1.85)
    shape.bezierCurveTo(1.8, 1.5, 2.3, 2.8, 3, 2.5)
    shape.lineTo(3, 2.15)
    shape.bezierCurveTo(2.3, 2.45, 1.8, 1.15, 1.1, 1.5)
    shape.bezierCurveTo(.3, 1.85, .2, .3, -.5, .9)
    shape.bezierCurveTo(-1.3, 1.45, -1.2, -.25, -1.8, .1)
    shape.bezierCurveTo(-2.5, .45, -2.5, -1.15, -3, -1.25)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: .065, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2, curveSegments: 30 })
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  useFrame(({ clock }) => {
    if (!group.current) return
    if (!group.current.visible) return
    const p = motion ? pose.current.progress : .25
    group.current.rotation.y = .35 - ease(.2, .8, p) * .65
    slices.current.forEach((slice, i) => {
      if (!slice) return
      const unfold = ease(0, .24, p)
      slice.position.z = (i - 8) * (.18 + ease(.38, .75, p) * .1)
      slice.scale.y = .5 + .5 * unfold + (motion ? Math.sin(clock.elapsedTime * .9 + i * .25) * .035 : 0)
      slice.position.y = -.18 * Math.cos(i * .24)
    })
  })
  return <group ref={group}>
    {Array.from({length:17}, (_,i) => <mesh key={i} ref={el => { slices.current[i] = el }} geometry={geometry} castShadow receiveShadow><meshStandardMaterial {...(i % 8 === 0 ? ivory : copper)} /></mesh>)}
  </group>
}

function Sales({ pose, motion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  useScenePresence(group, 1, { pose, motion })
  const bars = useRef<(THREE.Mesh | null)[]>([])
  const geometry = useMemo(() => new RoundedBoxGeometry(.68, 1, .68, 3, .055), [])
  useEffect(() => () => geometry.dispose(), [geometry])
  const data = useMemo(() => Array.from({length:24}, (_,i) => ({ x: (i % 6 - 2.5) * .95, z: (Math.floor(i / 6) - 1.5) * .95, height: .6 + (i % 6) * .42 + Math.sin(i * 1.7) * .45 + Math.floor(i / 6) * .25 })), [])
  useFrame(({ clock }) => {
    if (!group.current) return
    if (!group.current.visible) return
    const p = motion ? pose.current.progress : .4
    group.current.rotation.y = -.4 - ease(.28,.8,p) * .5
    bars.current.forEach((bar, i) => {
      if (!bar) return
      const height = data[i].height * (.25 + .75 * ease(i*.005, .22+i*.005, p))
      bar.scale.y = height + (motion ? Math.sin(clock.elapsedTime*.8 + i*.3) * .025 : 0)
      bar.position.set(data[i].x, -1.6 + bar.scale.y/2, data[i].z * (1 + ease(.38,.72,p)*.35))
    })
  })
  return <group ref={group}>
    {data.map((_,i) => <mesh key={i} geometry={geometry} ref={el => { bars.current[i] = el }} castShadow receiveShadow><meshStandardMaterial {...(i%6 === 5 ? ivory : copper)} /></mesh>)}
    <mesh position={[0,-1.78,0]} receiveShadow><boxGeometry args={[6.8,.24,5.1]}/><meshStandardMaterial {...graphite}/></mesh>
    {Array.from({length:7},(_,i)=><mesh key={i} position={[-3.2+i*1.05,-1.645,0]}><boxGeometry args={[.012,.012,4.9]}/><meshStandardMaterial color="#a5967f" metalness={.6} roughness={.3}/></mesh>)}
  </group>
}

function Coil({ upper = false }: { upper?: boolean }) {
  const spiral = useMemo(() => {
    const points = Array.from({length:700},(_,i) => {
      const t = i/699
      const angle = t*Math.PI*2*9
      const radius = .48 + t*2.1
      return new THREE.Vector3(Math.cos(angle)*radius, 0, Math.sin(angle)*radius)
    })
    return new THREE.CatmullRomCurve3(points)
  }, [])
  return <group rotation={[upper ? Math.PI : 0,0,0]}>
    <mesh castShadow><tubeGeometry args={[spiral,700,.065,8,false]}/><meshStandardMaterial {...copper} roughness={.17}/></mesh>
    <mesh position={[0,-.18,0]} receiveShadow castShadow><cylinderGeometry args={[2.8,2.8,.22,80]}/><meshStandardMaterial {...graphite}/></mesh>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,-.05,0]}><torusGeometry args={[2.73,.035,8,96]}/><meshStandardMaterial {...ivory}/></mesh>
    {[0,1,2,3].map(i => <mesh key={i} position={[Math.cos(i*Math.PI/2+.4)*2.67,-.045,Math.sin(i*Math.PI/2+.4)*2.67]}><cylinderGeometry args={[.065,.065,.05,6]}/><meshStandardMaterial {...ivory}/></mesh>)}
  </group>
}

function Charging({ pose, motion }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  useScenePresence(group, 2, { pose, motion })
  const upper = useRef<THREE.Group>(null)
  const lower = useRef<THREE.Group>(null)
  const pulses = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({clock}) => {
    if (!group.current || !upper.current || !lower.current) return
    if (!group.current.visible) return
    const p = motion ? pose.current.progress : .45
    const split = .55 + ease(.12,.62,p)*1.1
    upper.current.position.y = split
    upper.current.rotation.x = -ease(.2,.75,p) * .85
    lower.current.position.y = -split
    group.current.rotation.set(.12, -.45-ease(.2,.85,p)*.4, -.18)
    pulses.current.forEach((pulse,i) => {
      if (!pulse) return
      const t = motion ? (clock.elapsedTime*.45+i/6)%1 : i/6
      pulse.position.set(Math.cos(i*2.4)*1.15, -split+t*split*2, Math.sin(i*2.4)*1.15)
      pulse.scale.setScalar(Math.sin(t*Math.PI)*.8+.2)
    })
  })
  return <group ref={group}>
    <group ref={upper}><Coil upper/></group><group ref={lower}><Coil/></group>
    {Array.from({length:6},(_,i)=><mesh key={i} ref={el=>{pulses.current[i]=el}}><sphereGeometry args={[.055,12,12]}/><meshStandardMaterial color="#f9d4a2" emissive="#ef9552" emissiveIntensity={3}/></mesh>)}
  </group>
}

function Automation({pose,motion}: SceneProps) {
  const group=useRef<THREE.Group>(null)
  useScenePresence(group, 3, { pose, motion })
  const fins=useRef<(THREE.Mesh|null)[]>([])
  const pulses=useRef<(THREE.Mesh|null)[]>([])
  const geometry=useMemo(()=>new RoundedBoxGeometry(.16,1,.65,3,.055),[])
  const paths=useMemo(()=>[
    new THREE.CatmullRomCurve3([new THREE.Vector3(-3,0,0),new THREE.Vector3(-2.2,0,0),new THREE.Vector3(-1,.3,0),new THREE.Vector3(0,0,0)]),
    new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(1.5,.1,0),new THREE.Vector3(2.2,1.7,-.7),new THREE.Vector3(3.3,1.8,-1)]),
    new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(1.4,0,0),new THREE.Vector3(2.4,-1.4,1),new THREE.Vector3(3.3,-1.5,1.2)])
  ],[])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useFrame(({clock})=>{
    if(!group.current)return
    if(!group.current.visible)return
    const p=motion?pose.current.progress:.3
    group.current.rotation.y=-.25-ease(.25,.8,p)*.4
    fins.current.forEach((fin,i)=>{if(fin)fin.scale.y=.5+Math.sin(i*.6+ (motion?clock.elapsedTime*2:0))*.35+Math.sin(i/12*Math.PI)*1.4})
    pulses.current.forEach((pulse,i)=>{if(pulse) paths[i].getPointAt(motion?(clock.elapsedTime*.24+i*.3)%1:.5,pulse.position)})
  })
  return <group ref={group}>
    <group position={[-3.2,0,0]}>{Array.from({length:13},(_,i)=><mesh key={i} ref={el=>{fins.current[i]=el}} geometry={geometry} position={[(i-6)*.2,0,0]} castShadow><meshStandardMaterial {...copper}/></mesh>)}</group>
    {paths.map((path,i)=><group key={i}><mesh castShadow><tubeGeometry args={[path,64,.09,12,false]}/><meshStandardMaterial {...copper}/></mesh><mesh ref={el=>{pulses.current[i]=el}}><sphereGeometry args={[.14,16,16]}/><meshStandardMaterial color="#fff0cf" emissive="#ffb169" emissiveIntensity={2.5}/></mesh></group>)}
    {[[0,0,0],[3.3,1.8,-1],[3.3,-1.5,1.2]].map((position,i)=><group position={position as [number,number,number]} key={i} rotation={[Math.PI/2,0,0]}>
      <mesh castShadow><cylinderGeometry args={[i===0?.8:.6,i===0?.8:.6,.65,64]}/><meshStandardMaterial {...graphite}/></mesh>
      <mesh rotation={[Math.PI/2,0,0]} position={[0,.34,0]}><torusGeometry args={[i===0?.64:.44,.065,12,64]}/><meshStandardMaterial {...copper}/></mesh>
      <mesh position={[0,.35,0]}><cylinderGeometry args={[.22,.22,.04,32]}/><meshStandardMaterial {...ivory}/></mesh>
    </group>)}
  </group>
}

function CameraRig({pose,motion}:SceneProps) {
  const {size}=useThree()
  const target=useMemo(()=>new THREE.Vector3(),[])
  useFrame(({camera,pointer},delta)=>{
    const p=motion?pose.current.progress:.2
    const small=(size.width<=900 && size.height>560)
    const detail=ease(.3,.75,p)
    const opening=pose.current.chapter===-2
    const closing=pose.current.chapter===7
    const narrative=[4,6,7].includes(pose.current.chapter)
    const orbit=narrative?.12:opening?0:-.18+detail*.7+(motion?pointer.x*.065:0)
    const distance=narrative?(small?14.5:12.8):opening?(small?13.5:9.2):(small?16.8:12.5)-detail*(small?1.3:2.2)
    const targetX=opening?0:small?0:narrative?-2.5:closing?-1.5:-2.6
    const targetY=opening?(small?-.65:0):small?(narrative?-3.3:-2.5):0
    target.x=THREE.MathUtils.damp(target.x,targetX,4,delta)
    target.y=THREE.MathUtils.damp(target.y,targetY,4,delta)
    const damping=motion?5:100
    camera.position.x=THREE.MathUtils.damp(camera.position.x,target.x+Math.sin(orbit)*distance,damping,delta)
    camera.position.y=THREE.MathUtils.damp(camera.position.y,target.y+(opening?.4:narrative?1.6:(small?4.2:4.5)-detail*2)+(motion?pointer.y*.12:0),damping,delta)
    camera.position.z=THREE.MathUtils.damp(camera.position.z,Math.cos(orbit)*distance,damping,delta)
    camera.lookAt(target)
  })
  return null
}

class WebGLBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){return this.state.failed?<p className="webgl-fallback">The 3D view is unavailable on this device. Portfolio content remains available.</p>:this.props.children}
}

export default function ProjectCinema({pose,motion}:SceneProps) {
  const stage=useRef<HTMLDivElement>(null)
  const [visible,setVisible]=useState(false)
  const [awake,setAwake]=useState(!document.hidden)
  useEffect(()=>{
    const element=stage.current?.parentElement
    if(!element)return
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'150px'})
    observer.observe(element)
    const visibility=()=>setAwake(!document.hidden)
    document.addEventListener('visibilitychange',visibility)
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility)}
  },[])
  return <div className="project-cinema" ref={stage} aria-label="Three-dimensional portfolio">
    <WebGLBoundary><Canvas shadows dpr={[1,1.5]} frameloop={visible&&awake?'always':'never'} camera={{position:[-4,4.5,12.5],fov:40,near:.1,far:80}} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}}>
      <Lighting/><CameraRig pose={pose} motion={motion}/><MonogramJourney pose={pose} motion={motion}/>
      <Forecast pose={pose} motion={motion}/><Sales pose={pose} motion={motion}/><Charging pose={pose} motion={motion}/><Automation pose={pose} motion={motion}/>
      <RepositorySculpture kind="jobs" pose={pose} motion={motion}/><RepositorySculpture kind="portfolio" pose={pose} motion={motion}/>
      {[0,1,2,3].map(kind=><SkillSculpture key={kind} kind={kind} pose={pose} motion={motion}/>)}
    </Canvas></WebGLBoundary>
    <div className="cinema-shade"/>
  </div>
}
