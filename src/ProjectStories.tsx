import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './stories.css'
import { type CinemaPose } from './ProjectCinema'

const stories = [
  { id: 'demand', title: ['Demand', 'AI.'], name: 'DemandAI', category: 'Python / Machine learning', lead: 'Reading what came before. Planning what comes next.', copy: 'A Python workflow that uses historical sales patterns to support demand forecasting.', focus: 'From history to a forecast.', detail: 'Historical sales data provides the starting point. Pattern analysis connects those observations to a demand forecast.', steps: ['Historical sales', 'Pattern analysis', 'Demand forecast'], note: 'Forecasting workflow · 3D interpretation' },
  { id: 'sales', title: ['Sales', 'Dashboard.'], name: 'Sales Dashboard', category: 'Tableau / Excel', lead: 'A clearer view of sales performance.', copy: 'An interactive Tableau dashboard for comparing performance, filtering records and reviewing trends.', focus: 'One view. Several questions.', detail: 'KPI views establish the overview. Filters and trend reporting make it possible to look more closely at the underlying performance.', steps: ['Sales records', 'Filtered KPI views', 'Trend reporting'], note: 'Reporting structure · Illustrative data' },
  { id: 'charging', title: ['Wireless', 'EV charging.'], name: 'Wireless EV Charging', category: 'ESP32 / IoT', lead: 'Taking the work from data into a physical system.', copy: 'An ESP32-based prototype for dynamic wireless EV charging, with sensor and parameter monitoring.', focus: 'Follow the energy. Check the readings.', detail: 'The prototype connects wireless charging with sensor monitoring. System validation brings the hardware behaviour and recorded parameters together.', steps: ['Wireless transfer', 'Sensor monitoring', 'System validation'], note: 'System concept · 3D concept' },
  { id: 'automation', title: ['Alexa +', 'Telegram.'], name: 'Alexa + Telegram', category: 'Voice / Automation / IoT', lead: 'A command becomes an action. A message closes the loop.', copy: 'A voice-to-message automation system for remote control and real-time notifications.', focus: 'From command to confirmation.', detail: 'Voice commands and remote control connect to device actions, while notifications provide a way to follow what is happening.', steps: ['Voice command', 'Remote control', 'Notification'], note: 'Automation flow · 3D interpretation' },
]

export default function ProjectStories({ motion, pose }: { motion: boolean; pose: MutableRefObject<CinemaPose> }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    // Motion mode changes the hero height. Measure after all parent effects settle.
    let frame = 0
    const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => ScrollTrigger.refresh()) }
    const observer = new ResizeObserver(refresh)
    if (root.current?.parentElement) observer.observe(root.current.parentElement)
    refresh()
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [motion])
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (motion) gsap.fromTo('.work-heading span', { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.work-intro', start: 'top 80%', end: 'top 20%', scrub: .6 } })
      gsap.utils.toArray<HTMLElement>('.case-chapter', root.current).forEach((section, index) => {
        const select = gsap.utils.selector(section)
        const cameraTravel = { value: 0 }
        ScrollTrigger.create({ trigger: section, start: 'top 60%', end: 'bottom 60%', onToggle: self => { if (self.isActive) { pose.current.chapter = index; pose.current.progress = cameraTravel.value } }, onRefresh: self => { if (self.isActive) { pose.current.chapter = index; pose.current.progress = cameraTravel.value } } })
        if (!motion) return
        const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .65 } })
        timeline
          .to(cameraTravel, { value: 1, duration: 1, ease: 'none', onUpdate: () => { if (pose.current.chapter === index) pose.current.progress = cameraTravel.value } }, 0)
          .fromTo(select('.case-intro'), { xPercent: 8, z: -160, rotationY: -8, scale: .9, autoAlpha: 0 }, { xPercent: 0, z: 0, rotationY: 0, scale: 1, autoAlpha: 1, duration: .16, ease: 'power2.out' }, 0)
          .to(select('.case-intro'), { xPercent: -3, z: 65, scale: 1.035, duration: .18, ease: 'none' }, .16)
          .to(select('.case-intro'), { xPercent: -16, z: 200, rotationY: 12, scale: 1.16, autoAlpha: 0, duration: .16, ease: 'power2.in' }, .34)
          .fromTo(select('.case-intro-copy'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .12 }, .06)
          .fromTo(select('.case-detail'), { xPercent: 10, z: -120, rotationY: -7, scale: .92, autoAlpha: 0 }, { xPercent: 0, z: 0, rotationY: 0, scale: 1, autoAlpha: 1, duration: .17, ease: 'power2.out' }, .5)
          .to(select('.case-detail'), { z: 40, xPercent: -2, duration: .22, ease: 'none' }, .67)
          .fromTo(select('.case-steps li'), { x: 30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: .025, duration: .1 }, .54)
          .to(select('.case-detail'), { autoAlpha: 0, xPercent: -10, z: 150, rotationY: 8, duration: .11 }, .89)
          .fromTo(select('.case-bottom'), { autoAlpha: 0 }, { autoAlpha: 1, duration: .08 }, .72)
          .to(select('.case-bottom'), { autoAlpha: 0, duration: .08 }, .92)
      })
    }, root)
    const refresh = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => { cancelAnimationFrame(refresh); ctx.revert() }
  }, [motion])
  return <div className="work-stories" ref={root}>
    <section className="work-intro" id="work"><div className="work-intro-pin">
      <p className="eyebrow">Selected work / Four projects</p>
      <h2 className="work-heading"><span>Look</span><br/><span><em>closer.</em></span></h2>
      <div className="work-intro-foot"><p>From reading sales patterns to connecting physical devices. Four projects, each with a different problem to work through.</p><nav aria-label="Choose a project">{stories.map(s => <a href={`#${s.id}`} key={s.id}>{s.name}</a>)}</nav></div>
    </div>
    </section>
    <div className="project-gallery">{stories.map((story, index) => <section className={`case-chapter case-${story.id}`} id={story.id} key={story.id} aria-labelledby={`${story.id}-title`}>
      <div className="case-sticky">

        <div className="case-intro"><h2 className="case-title" id={`${story.id}-title`}>{story.title.map(line=><div key={line}><span>{line}</span></div>)}</h2><div className="case-intro-copy"><p className="case-lead">{story.lead}</p><p>{story.copy}</p></div></div>
        <div className="case-detail"><h3>{story.focus.split(/(?<=\.) /).map(line=><div key={line}><span>{line}</span></div>)}</h3><p>{story.detail}</p><ol className="case-steps">{story.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,'0')}</span>{step}</li>)}</ol></div>
        <div className="case-bottom"><a href={index < 3 ? `#${stories[index+1].id}` : '#approach'}>{index < 3 ? 'Next project' : 'Across the work'}</a></div>
      </div>
    </section>)}</div>
    <section className="approach" id="approach"><div className="narrative-pin"><p className="eyebrow">Across the work</p><h2>Build it.<br/><em>Understand it.</em><br/>Check it.</h2><div className="approach-notes"><p>These projects span software and hardware. The common thread is working through a system: its inputs, its behaviour and the information it gives back.</p><div><h3>Read the inputs</h3><p>Historical sales records in DemandAI. Sensor readings in the charging prototype.</p></div><div><h3>Make the behaviour visible</h3><p>Filtered KPI views in Tableau. Notifications in the automation system.</p></div><div><h3>Check what comes back</h3><p>Connectivity checks, API response validation and test documentation during my internships.</p></div></div></div></section>
  </div>
}
