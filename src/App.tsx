import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { usePageMotion } from './usePageMotion'
import ProjectCinema, { type CinemaPose } from './ProjectCinema'
import ProjectStories from './ProjectStories'
import SkillStories from './SkillStories'

gsap.registerPlugin(ScrollTrigger)

function Hero() {
  return <section className="hero" id="top"><div className="hero-copy"><div className="hero-kicker" data-hero-kicker><span>Portfolio / 2026</span><span>Bengaluru, India</span></div><h1 data-hero-title aria-label="Rakesh R."><span className="hero-name" aria-hidden="true">Rakesh</span> <em aria-hidden="true">R.</em></h1><div className="hero-foot" data-hero-note><p>Electronics & communication graduate working with data, embedded systems and API testing.</p><a href="#work">Selected work ↓</a></div></div></section>
}

function App() {
  const root = useRef<HTMLDivElement>(null)
  const [motion, setMotion] = useState(() => {
    try { const choice = localStorage.getItem('portfolio-motion'); if (choice) return choice === 'on' } catch { /* Use system preference when storage is unavailable. */ }
    return !matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  const pose = useRef<CinemaPose>({ chapter: -2, progress: 0 })
  usePageMotion(root, motion, pose)
  const [menuOpen, setMenuOpen] = useState(false)
  const scroll = useRef<Lenis | null>(null)
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: motion, anchors: true })
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
  }, [motion])
  return <div className="site" data-motion={motion ? "full" : "reduced"} ref={root} >
    <ProjectCinema pose={pose} motion={motion} />
    <header className="topbar"><button className="motion-toggle" onClick={() => setMotion(value => { try { localStorage.setItem('portfolio-motion', value ? 'off' : 'on') } catch { /* Preference remains active for this visit. */ } return !value })} aria-pressed={motion}>{motion ? "Motion on" : "Enable motion"}</button><a href="#top" className="monogram" aria-label="Back to the top">R<span>R</span></a><button className="index-button" type="button" onClick={() => setMenuOpen(value => !value)} aria-expanded={menuOpen}><span>{menuOpen ? 'Close' : 'Index'}</span></button><nav className={menuOpen ? 'site-nav site-nav--open' : 'site-nav'}><a href="#work" onClick={() => setMenuOpen(false)}>Work</a><a href="#profile" onClick={() => setMenuOpen(false)}>Skills</a><a href="#experience" onClick={() => setMenuOpen(false)}>Experience</a><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></nav></header>
    <main><Hero />
      <ProjectStories motion={motion} pose={pose} />
      <SkillStories pose={pose} motion={motion} />
      <section className="experience" id="experience" aria-labelledby="experience-heading"><div className="narrative-pin">
        <h2 id="experience-heading">Experience <em>&amp; education</em></h2><div className="experience-list"><article className="experience-item"><span>2024—2025</span><div><h3>Technical Intern</h3><p>Rooman Technologies, Bengaluru</p></div><p>Python programming, debugging, digital electronics, embedded systems, and technical support workflows.</p></article><article className="experience-item"><span>2023—2024</span><div><h3>IoT & Automation Intern</h3><p>Makeskilled</p></div><p>Device configuration, connectivity checks, sensor monitoring, REST API testing, and test documentation.</p></article><article className="experience-item"><span>2021—2025</span><div><h3>B.E. Electronics & Communication</h3><p>CMR Institute of Technology, Bengaluru</p></div></article>
        <article className="experience-item"><span>Jul 2026—present</span><div><h3>Data Science with Generative AI and Machine Learning</h3><p>ExcelR, Hyderabad</p></div></article>
        </div></div></section>
      <section className="contact" id="contact"><div className="contact-pin"><p>( Open to entry-level technical opportunities )</p><a href="mailto:rajanalarakesh1@gmail.com">Start a<br />conversation <span>↗</span></a><div className="contact-foot"><span>Rakesh R / 2026</span><a href="tel:+917842724243">+91 78427 24243</a><span>Bengaluru, India</span></div></div></section>
    </main>
  </div>
}

export default App
