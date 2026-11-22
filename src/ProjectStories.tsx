import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './stories.css'
import { type CinemaPose } from './ProjectCinema'

type ProjectStory = { id:string; scene:number; title:string[]; name:string; category:string; lead:string; copy:string; focus:string; detail:string; steps:string[]; note?:string; sourceUrl?:string }
const stories:ProjectStory[] = [
  { id:'jobmatch', scene:13, title:['Job','Match.'], name:'JobMatch', category:'Python / FastAPI / React / SQLite', lead:'Find the requirements. See where you match.', copy:'A local job-search assistant that collects public listings, checks eligibility and compares required skills against a saved profile.', focus:'From a listing to a clear comparison.', detail:'A React dashboard connects to FastAPI and SQLite. Local CV extraction helps build a profile; transparent keyword rules separate matched, missing and unclear skills. Applications remain a manual step.', steps:['Collect public listings','Check requirements and eligibility','Review matched and missing skills'] },
  { id:'demand', scene:0, title:['Demand','AI.'], name:'DemandAI', category:'Python / Streamlit / Scikit-learn', lead:'Historical sales. A next-day estimate.', copy:'A Streamlit app for exploring store and product sales, monthly trends and one-day-ahead demand estimates.', focus:'Seven observations. One day ahead.', detail:'Calendar features, the previous day and week, and a seven-day rolling mean feed a Random Forest regressor. The app estimates the next day for a selected store and product using the included historical dataset.', steps:['Choose a store and product','Build lag and calendar features','Estimate next-day demand'], sourceUrl:'https://github.com/rajanalarakesh1/DemandAI' },
  { id: 'sales', scene: 1, title: ['Sales', 'Dashboard.'], name: 'Sales Dashboard', category: 'Tableau / Excel', lead: 'A clearer view of sales performance.', copy: 'An interactive Tableau dashboard for comparing performance, filtering records and reviewing trends.', focus: 'One view. Several questions.', detail: 'KPI views establish the overview. Filters and trend reporting make it possible to look more closely at the underlying performance.', steps: ['Sales records', 'Filtered KPI views', 'Trend reporting'], note: 'Reporting structure · Illustrative data' },
  { id: 'charging', scene: 2, title: ['Wireless', 'EV charging.'], name: 'Wireless EV Charging', category: 'ESP32 / IoT', lead: 'Taking the work from data into a physical system.', copy: 'An ESP32-based prototype for dynamic wireless EV charging, with sensor and parameter monitoring.', focus: 'Follow the energy. Check the readings.', detail: 'The prototype connects wireless charging with sensor monitoring. System validation brings the hardware behaviour and recorded parameters together.', steps: ['Wireless transfer', 'Sensor monitoring', 'System validation'], note: 'System concept · 3D concept' },
  { id: 'automation', scene: 3, title: ['Alexa +', 'Telegram.'], name: 'Alexa + Telegram', category: 'Voice / Automation / IoT', lead: 'A command becomes an action. A message closes the loop.', copy: 'A voice-to-message automation system for remote control and real-time notifications.', focus: 'From command to confirmation.', detail: 'Voice commands and remote control connect to device actions, while notifications provide a way to follow what is happening.', steps: ['Voice command', 'Remote control', 'Notification'], note: 'Automation flow · 3D interpretation' },
  { id:'portfolio', scene:12, title:['This','portfolio.'], name:'WebGL Portfolio', category:'React / Three.js / GSAP / Lenis', lead:'One scene, moving through the work.', copy:'A React and TypeScript portfolio with a shared WebGL canvas, scroll-driven camera movement and animated project stories.', focus:'The camera and the page move together.', detail:'Three.js renders the project sculptures while GSAP controls the copy and transitions. Lenis smooths scrolling, responsive framing adapts the scene to the display.', steps:['A shared Three.js canvas','Scroll-linked camera and typography','Responsive layouts and smooth scrolling'], sourceUrl:'https://github.com/rajanalarakesh1/Portfolio' },
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
      if (motion) gsap.fromTo('.work-heading-copy', { y: 20, opacity: .3 }, { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '.work-intro', start: 'top 95%', end: 'top 70%', scrub: .35 } })
      gsap.utils.toArray<HTMLElement>('.case-chapter', root.current).forEach((section, index) => {
        const chapter = stories[index].scene
        const select = gsap.utils.selector(section)
        const cameraTravel = { value: 0 }
        ScrollTrigger.create({ trigger: section, start: 'top 60%', end: 'bottom 60%', onToggle: self => { if (self.isActive) { pose.current.chapter = chapter; pose.current.progress = cameraTravel.value } }, onRefresh: self => { if (self.isActive) { pose.current.chapter = chapter; pose.current.progress = cameraTravel.value } } })
        if (!motion) return
        const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .65 } })
        timeline
          .to(cameraTravel, { value: 1, duration: 1, ease: 'none', onUpdate: () => { if (pose.current.chapter === chapter) pose.current.progress = cameraTravel.value } }, 0)
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

      <h2 className="work-heading"><span className="work-heading-copy"><span>Look</span><span><em>closer.</em></span></span></h2>
      <div className="work-intro-foot"><p>From comparing job requirements and forecasting sales to connected devices and this WebGL site. Each project has a different problem to work through.</p><nav aria-label="Choose a project">{stories.map(s => <a href={`#${s.id}`} key={s.id}>{s.name}</a>)}</nav></div>
    </div>
    </section>
    <div className="project-gallery">{stories.map((story, index) => <section className={`case-chapter case-${story.id}`} id={story.id} key={story.id} aria-labelledby={`${story.id}-title`}>
      <div className="case-sticky">

        <div className="case-intro"><h2 className="case-title" id={`${story.id}-title`}>{story.title.map(line=><div key={line}><span>{line}</span></div>)}</h2><div className="case-intro-copy"><p className="case-lead">{story.lead}</p><p>{story.copy}</p></div></div>
        <div className="case-detail"><h3>{story.focus.split(/(?<=\.) /).map(line=><div key={line}><span>{line}</span></div>)}</h3><p>{story.detail}</p><ol className="case-steps">{story.steps.map((step,i)=><li key={step}><span>{String(i+1).padStart(2,'0')}</span>{step}</li>)}</ol></div>
        <div className="case-bottom">{story.sourceUrl && <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`View ${story.name} source on GitHub`}>GitHub &#8599;</a>}<a href={index < stories.length - 1 ? `#${stories[index+1].id}` : '#approach'}>{index < stories.length - 1 ? 'Next project' : 'Across the work'}</a></div>
      </div>
    </section>)}</div>
    <section className="approach" id="approach"><div className="narrative-pin"><h2>Build it.<br/><em>Understand it.</em><br/>Check it.</h2><div className="approach-notes"><p>These projects span software and hardware. The common thread is working through a system: its inputs, its behaviour and the information it gives back.</p><div><h3>Read the inputs</h3><p>Historical sales records in DemandAI. Sensor readings in the charging prototype.</p></div><div><h3>Make the behaviour visible</h3><p>Filtered KPI views in Tableau. Notifications in the automation system.</p></div><div><h3>Check what comes back</h3><p>Connectivity checks, API response validation and test documentation during my internships.</p></div></div></div></section>
  </div>
}
