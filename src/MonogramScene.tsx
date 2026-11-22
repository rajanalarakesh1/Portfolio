import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import fontData from 'three/examples/fonts/optimer_bold.typeface.json'

function Sculpture({ progress, motion }: { progress: number; motion: boolean }) {
  const object = useRef<THREE.Group>(null)
  const { gl, scene, viewport } = useThree()
  const geometry = useMemo(() => {
    const font = new FontLoader().parse(fontData)
    const letter = new TextGeometry('R', {
      font,
      size: 4.3,
      depth: .62,
      curveSegments: 24,
      bevelEnabled: true,
      bevelThickness: .09,
      bevelSize: .065,
      bevelSegments: 5,
    })
    letter.center()
    // A slanted serif form keeps the shape related to the name treatment.
    letter.applyMatrix4(new THREE.Matrix4().set(
      1, .16, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ))
    return letter
  }, [])

  useEffect(() => {
    const environment = new RoomEnvironment()
    const generator = new THREE.PMREMGenerator(gl)
    const target = generator.fromScene(environment, .04)
    scene.environment = target.texture
    return () => {
      scene.environment = null
      target.dispose()
      environment.dispose()
      generator.dispose()
    }
  }, [gl, scene])

  useFrame(({ clock, pointer, camera }, delta) => {
    if (!object.current) return
    const scroll = motion ? progress : 0
    const sway = motion ? Math.sin(clock.elapsedTime * .55) * .035 : 0
    const scale = Math.min(viewport.width / 5, 1.35)
    object.current.scale.setScalar(scale * (1 + scroll * 1.6))
    object.current.rotation.y = THREE.MathUtils.damp(
      object.current.rotation.y, -.48 + scroll * 1.7 + pointer.x * .13 + sway, 5, delta,
    )
    object.current.rotation.x = THREE.MathUtils.damp(object.current.rotation.x, -.1 + pointer.y * .08, 5, delta)
    object.current.rotation.z = -.11 + scroll * .23
    object.current.position.y = .4 + scroll * 1.7
    camera.position.x = THREE.MathUtils.damp(camera.position.x, scroll * 1.2, 4, delta)
    camera.lookAt(0, 0, 0)
  })

  return <>
    <ambientLight intensity={.3} />
    <spotLight position={[-5, 7, 6]} intensity={65} angle={.6} penumbra={1} color="#ffe3c4" />
    <spotLight position={[5, 2, -3]} intensity={85} angle={.8} penumbra={1} color="#df581e" />
    <group ref={object}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#c86739"
          metalness={.94}
          roughness={.21}
          clearcoat={.65}
          clearcoatRoughness={.23}
          envMapIntensity={1.7}
        />
      </mesh>
      <mesh geometry={geometry} position={[0, 0, -.82]}>
        <meshStandardMaterial color="#44241b" metalness={.9} roughness={.34} />
      </mesh>
    </group>
  </>
}

export default function MonogramScene({ progress, motion }: { progress: number; motion: boolean }) {
  const stage = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    if (!stage.current) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(stage.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={stage} style={{ height: '100%' }}><Canvas
    frameloop={visible ? 'always' : 'never'}
    dpr={[1, 1.5]}
    camera={{ position: [0, 0, 8.8], fov: 42 }}
    gl={{ antialias: true, alpha: true }}
    aria-label="Three-dimensional copper R monogram"
  >
    <Sculpture progress={progress} motion={motion} />
  </Canvas></div>
}
