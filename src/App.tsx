import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { usePageMotion } from './usePageMotion'
import MonogramScene from './MonogramScene'

gsap.registerPlugin(ScrollTrigger)

type Project = {
  number: string
  title: string
  display: string
  category: string
  period: string
  copy: string
  details: string[]
  color: string
  ink: string
}

const projects: Project[] = [
  { number: '01', title: 'DemandAI', display: 'Demand\nAI', category: 'Forecasting workflow', period: 'Python / ML', copy: 'A Python workflow for reading historical sales patterns and turning them into a demand forecast.', details: ['Historical data', 'Pattern analysis', 'Forecast support'], color: '#e3522e', ink: '#161412' },
  { number: '02', title: 'Sales Dashboard', display: 'Sales\nDashboard', category: 'Reporting interface', period: 'Tableau / Excel', copy: 'An interactive Tableau dashboard for performance reporting, comparison, and trend analysis.', details: ['KPI views', 'Filters', 'Trend reporting'], color: '#2e59da', ink: '#f1ede6' },
  { number: '03', title: 'Wireless EV Charging', display: 'Wireless\nEV charging', category: 'Embedded prototype', period: 'ESP32 / IoT', copy: 'An ESP32-based prototype for dynamic wireless EV charging with parameter and sensor monitoring.', details: ['Sensor monitoring', 'System validation', 'ESP32 prototype'], color: '#d6e5be', ink: '#162116' },
  { number: '04', title: 'Alexa + Telegram', display: 'Alexa +\nTelegram', category: 'Automation system', period: 'Automation / IoT', copy: 'A voice-to-message automation system for remote control and real-time notifications.', details: ['Voice commands', 'Remote control', 'Live notifications'], color: '#bca6ee', ink: '#201a30' },
]

function makePosterTexture(project: Project) {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1365
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = project.color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = project.ink
  ctx.lineWidth = 3.5
  const variant = Number(project.number)
  // Layer closed contours like a two-colour engraved print.
  ctx.save()
  ctx.translate(1024, 680)
  ctx.scale(1.45, 1)
  for (let ring = 0; ring < 94; ring++) {
    ctx.beginPath()
    for (let step = 0; step <= 440; step++) {
      const angle = step * Math.PI / 220
      const radius = 300 + ring * 2 + 118 * Math.cos(variant * angle + ring * .033)
      const x = Math.cos(angle) * radius + 62 * Math.cos(3 * angle + ring * .047)
      const y = Math.sin(angle) * radius
      if (step === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }
  ctx.restore()
  ctx.fillStyle = project.ink
  ctx.font = '500 34px monospace'
  ctx.fillText(project.number + ' / 04', 62, 77)
  ctx.textAlign = 'right'
  ctx.fillText(project.period.toUpperCase(), canvas.width - 62, canvas.height - 55)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function ProjectPoster({ project, index, progress, motion }: { project: Project; index: number; progress: number; motion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const texture = useMemo(() => makePosterTexture(project), [project])
  const deformation = useMemo(() => ({
    time: { value: 0 },
    bend: { value: 0 },
  }), [])
  useEffect(() => () => texture.dispose(), [texture])
  useFrame(({ pointer, viewport, clock }, delta) => {
    if (!mesh.current || !material.current) return
    const location = progress * (projects.length - 1) - index
    deformation.time.value = !motion ? 0 : clock.elapsedTime
    deformation.bend.value = !motion ? 0 : Math.sin(location * Math.PI) * .65
    const presence = Math.max(0, 1 - Math.abs(location) * 0.97)
    mesh.current.position.x = THREE.MathUtils.damp(mesh.current.position.x, location * -8.4 + pointer.x * 0.18, 6, delta)
    mesh.current.position.y = THREE.MathUtils.damp(mesh.current.position.y, pointer.y * 0.11, 6, delta)
    mesh.current.rotation.y = THREE.MathUtils.damp(mesh.current.rotation.y, location * 0.82 + pointer.x * 0.035, 6, delta)
    mesh.current.rotation.z = THREE.MathUtils.damp(mesh.current.rotation.z, location * -0.06, 6, delta)
    mesh.current.scale.setScalar(Math.min(viewport.width / 12.2, viewport.height / 8.6) * (0.97 + presence * 0.03))
    material.current.opacity = THREE.MathUtils.damp(material.current.opacity, presence, 8, delta)
  })
  return <mesh ref={mesh} position={[18, 0, 0]}><planeGeometry args={[11.2, 7.47, 48, 32]} />
    <meshBasicMaterial
      ref={material}
      map={texture}
      transparent
      opacity={0}
      side={THREE.DoubleSide}
      onBeforeCompile={shader => {
        shader.uniforms.uTime = deformation.time
        shader.uniforms.uBend = deformation.bend
        shader.vertexShader = `uniform float uTime;
uniform float uBend;
` + shader.vertexShader
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
          #include <begin_vertex>
          float edge = sin(uv.x * 3.14159265);
          float breathing = sin(uTime * .65 + uv.x * 4.0) - sin(uv.x * 4.0);
          transformed.z += edge * (uBend * 2.0 + breathing * .12);
          transformed.y += sin(uv.x * 3.14159265) * uBend * .25;
        `)
      }}
    /></mesh>
}

function ProjectWorld({ progress, motion }: { progress: number; motion: boolean }) {
  return <Canvas className="project-canvas" dpr={[1, 1.4]} camera={{ position: [0, 0, 11.2], fov: 44 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
    {projects.map((project, index) => <ProjectPoster key={project.title} project={project} index={index} progress={progress} motion={motion} />)}
  </Canvas>
}

function Hero({ motion }: { motion: boolean }) {
  const hero = useRef<HTMLElement>(null)
  const [journey, setJourney] = useState(0)
  useLayoutEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: hero.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: self => setJourney(self.progress),
    })
    return () => trigger.kill()
  }, [])
  return <section className="hero" ref={hero} id="top"><div className="hero-copy"><div className="monogram-stage"><MonogramScene progress={journey} motion={motion} /></div><div className="hero-kicker" data-hero-kicker><span>Portfolio / 2026</span><span>Bengaluru, India</span></div><h1 data-hero-title aria-label="Rakesh R."><span className="hero-name" aria-hidden="true">{'Rakesh'.split('').map((letter, i) => <span className="hero-letter" key={i}>{letter}</span>)}</span> <em aria-hidden="true">R.</em></h1><div className="hero-line" /><div className="hero-foot" data-hero-note><p>Electronics & communication graduate working with data, embedded systems and API testing.</p><a href="#work">Selected work ↓</a></div></div></section>
}

function App() {
  const root = useRef<HTMLDivElement>(null)
  const [motion, setMotion] = useState(!matchMedia('(prefers-reduced-motion: reduce)').matches)
  usePageMotion(root, motion)
  const sequence = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const [sequenceVisibility, setSequenceVisibility] = useState(1)
  const [active, setActive] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const scroll = useRef<Lenis | null>(null)
  const project = projects[active]
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: !matchMedia("(prefers-reduced-motion: reduce)").matches, anchors: true })
    scroll.current = lenis
    const initialSection = document.getElementById(window.location.hash.slice(1))
    const initialJump = requestAnimationFrame(() => {
      if (initialSection) {
        lenis.resize()
        lenis.scrollTo(initialSection, { immediate: true })
      }
    })
    lenis.on('scroll', ScrollTrigger.update)
    const update = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => {
      cancelAnimationFrame(initialJump)
      lenis.destroy()
      gsap.ticker.remove(update)
    }
  }, [])
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sequence.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const travel = THREE.MathUtils.clamp((self.progress - 0.085) / 0.83, 0, 1)
          const visibility = Math.min(1, self.progress / 0.085, (1 - self.progress) / 0.085)
          setProgress(travel)
          setSequenceVisibility(.78 + .22 * visibility)
          setActive(Math.min(projects.length - 1, Math.round(travel * (projects.length - 1))))
        },
      })
    }, root)
    return () => context.revert()
  }, [])
  const jumpToProject = (index: number) => {
    const el = sequence.current
    if (!el) return
    const stop = .085 + .83 * index / (projects.length - 1)
    scroll.current?.scrollTo(el.offsetTop + (el.offsetHeight - window.innerHeight) * stop, { immediate: matchMedia('(prefers-reduced-motion: reduce)').matches })
  }
  return <div className="site" data-motion={motion ? "full" : "reduced"} ref={root} style={{ '--accent': project.color, '--accent-ink': project.ink } as CSSProperties}>
    <header className="topbar"><button className="motion-toggle" onClick={() => setMotion(value => !value)} aria-pressed={motion}>Motion {motion ? "on" : "off"}</button><a href="#top" className="monogram" aria-label="Back to the top">R<span>R</span></a><button className="index-button" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen}><span>{menuOpen ? 'Close' : 'Index'}</span><i /></button><nav className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'}><a href="#work" onClick={() => setMenuOpen(false)}>Work</a><a href="#profile" onClick={() => setMenuOpen(false)}>Skills</a><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></nav></header>
    <main><Hero motion={motion} />
      <section className="project-sequence" ref={sequence} id="work" aria-label="Selected work"><div className="project-pin"><div className="project-world" style={{ opacity: sequenceVisibility,  }}><ProjectWorld progress={progress} motion={motion} /></div><div className="project-overlay" style={{ opacity: sequenceVisibility, transform: `translateY(${(1 - sequenceVisibility) * 32}px)` }}><div className="sequence-top"><span>Selected work</span><span>{String(active + 1).padStart(2, '0')} / 04</span></div>{projects.map((item, index) => <article className={index === active ? 'project-stage project-stage--active' : 'project-stage'} hidden={index !== active} key={item.title}><p className="stage-label">{item.category}</p><h2 key={active}>{item.title}</h2><p className="stage-copy">{item.copy}</p><ul>{item.details.map(detail => <li key={detail}>{detail}</li>)}</ul><span className="stage-period">{item.period}</span></article>)}<div className="sequence-bottom"><span>Projects</span><div className="project-dots" aria-label="Project navigation">{projects.map((item, index) => <button key={item.title} onClick={() => jumpToProject(index)} className={index === active ? 'dot dot--active' : 'dot'} aria-label={`View ${item.title}`}>{item.number}</button>)}</div></div></div></div></section>
      <section className="afterword" id="profile" aria-labelledby="skills-title">
        <div><h2 id="skills-title">Skills<span>.</span></h2><p className="skills-note">Tools and methods from my projects and internships.</p></div>
        <dl className="skill-list">
          {[
            ['Programming', 'Python · SQL', 'Built a forecasting workflow from historical sales data.'],
            ['Analysis & reporting', 'Tableau · Excel · Statistics', 'Organized sales data and built filtered KPI views.'],
            ['Testing & support', 'Postman · REST APIs', 'Checked connectivity, validated responses and documented test results.'],
            ['Embedded systems', 'ESP32 · IoT', 'Monitored sensor readings during wireless charging tests.']
          ].map(([category, tools, example]) => <div key={category}><dt>{category}</dt><dd><strong>{tools}</strong><p>{example}</p></dd></div>)}
        </dl>
      </section>
      <section className="experience" id="experience" aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience <em>&amp; education</em></h2><div className="experience-list"><article className="experience-item"><span>2024—2025</span><div><h3>Technical Intern</h3><p>Rooman Technologies, Bengaluru</p></div><p>Python programming, debugging, digital electronics, embedded systems, and technical support workflows.</p></article><article className="experience-item"><span>2023—2024</span><div><h3>IoT & Automation Intern</h3><p>Makeskilled</p></div><p>Device configuration, connectivity checks, sensor monitoring, REST API testing, and test documentation.</p></article><article className="experience-item"><span>2021—2025</span><div><h3>B.E. Electronics & Communication</h3><p>CMR Institute of Technology, Bengaluru</p></div></article>
        <article className="experience-item"><span>Jul 2026—present</span><div><h3>Data Science with Generative AI and Machine Learning</h3><p>ExcelR, Hyderabad</p></div></article>
        </div></section>
      <section className="contact" id="contact"><p>( Open to entry-level technical opportunities )</p><a href="mailto:rajanalarakesh1@gmail.com">Start a<br />conversation <span>↗</span></a><div className="contact-foot"><span>Rakesh R / 2026</span><a href="tel:+917842724243">+91 78427 24243</a><span>Bengaluru, India</span></div></section>
    </main>
  </div>
}

export default App
