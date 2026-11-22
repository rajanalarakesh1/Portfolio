import { useLayoutEffect, useRef, type MutableRefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { CinemaPose } from './ProjectCinema'

const skills = [
  {id:'skill-programming',category:'Programming',title:['Python','+ SQL.'],summary:'Working with data, from records to a usable workflow.',focus:'Turn the inputs into a workflow.',detail:'Python connects the stages of my demand forecasting project: historical sales data, pattern analysis and a forecast.',tools:['Python programming','SQL','Data preparation'],evidence:'Applied in DemandAI and technical training'},
  {id:'skill-analysis',category:'Analysis & reporting',title:['Tableau','+ Excel.'],summary:'Organising information so performance is easier to compare.',focus:'Make the patterns readable.',detail:'The sales dashboard brings KPI views, filters and trend reporting together. Statistics provides context for interpreting the data.',tools:['Tableau dashboards','Excel','Statistics'],evidence:'Applied in the Sales Dashboard project'},
  {id:'skill-testing',category:'Testing & support',title:['Postman','+ APIs.'],summary:'Following a request through to the response.',focus:'Check what comes back.',detail:'My internship work included connectivity checks, REST API response validation and documenting test results.',tools:['Postman','REST API testing','Technical documentation'],evidence:'Applied during IoT & automation training'},
  {id:'skill-embedded',category:'Embedded systems',title:['ESP32','+ IoT.'],summary:'Connecting software to a physical device.',focus:'Read the system as it runs.',detail:'Sensor monitoring and parameter checks connect the wireless charging prototype to its behaviour in the real world.',tools:['ESP32','Sensor monitoring','Device connectivity'],evidence:'Applied in wireless charging and automation'},
]

export default function SkillStories({pose,motion}:{pose:MutableRefObject<CinemaPose>;motion:boolean}) {
  const root=useRef<HTMLDivElement>(null)
  useLayoutEffect(()=>{
    const ctx=gsap.context(()=>{
      root.current?.querySelectorAll<HTMLElement>('.skill-chapter').forEach((section,index)=>{
        const chapter=8+index
        const select=gsap.utils.selector(section)
        const travel={value:0}
        ScrollTrigger.create({trigger:section,start:'top 60%',end:'bottom 60%',onToggle:self=>{if(self.isActive){pose.current.chapter=chapter;pose.current.progress=travel.value}},onRefresh:self=>{if(self.isActive){pose.current.chapter=chapter;pose.current.progress=travel.value}}})
        if(!motion)return
        gsap.timeline({scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:.65}})
          .to(travel,{value:1,ease:'none',duration:1,onUpdate:()=>{if(pose.current.chapter===chapter)pose.current.progress=travel.value}},0)
          .fromTo(select('.case-title span'),{yPercent:65},{yPercent:0,stagger:.025,duration:.16,ease:'power3.out'},0)
          .fromTo(select('.case-intro-copy'),{y:0,autoAlpha:1},{y:-30,autoAlpha:0,duration:.12,immediateRender:false},.35)
          .fromTo(select('.case-title span'),{yPercent:0},{yPercent:-110,stagger:.02,duration:.14,immediateRender:false},.38)
          .fromTo(select('.case-title'),{autoAlpha:1},{autoAlpha:0,duration:.04,immediateRender:false},.5)
          .fromTo(select('.case-detail'),{y:40,autoAlpha:0},{y:0,autoAlpha:1,duration:.13},.5)
          .fromTo(select('.case-detail h3 span'),{y:0,yPercent:105},{y:0,yPercent:0,duration:.13},.5)
          .fromTo(select('.case-steps li'),{x:25,autoAlpha:0},{x:0,autoAlpha:1,stagger:.025,duration:.1},.54)
          .fromTo(select('.case-detail'),{autoAlpha:1,y:0},{autoAlpha:0,y:-30,duration:.08,immediateRender:false},.92)
      })
    },root)
    const frame=requestAnimationFrame(()=>ScrollTrigger.refresh())
    return()=>{cancelAnimationFrame(frame);ctx.revert()}
  },[motion,pose])
  return <div className="skill-stories" id="profile" ref={root} aria-label="Skills showcase">
    {skills.map((skill,index)=><section className="case-chapter skill-chapter" id={skill.id} key={skill.id} aria-labelledby={`${skill.id}-title`}><div className="case-sticky">
      <div className="case-top"><span>Skills / {skill.category}</span><nav aria-label="Choose a skill">{skills.map((item,i)=><a href={`#${item.id}`} key={item.id} aria-current={i===index?'step':undefined}>{item.category}</a>)}</nav></div>
      <div className="case-intro"><h2 className="case-title" id={`${skill.id}-title`}>{skill.title.map(line=><div key={line}><span>{line}</span></div>)}</h2><div className="case-intro-copy"><p className="case-lead">{skill.summary}</p><p>{skill.evidence}.</p></div></div>
      <div className="case-detail"><p className="eyebrow">{skill.category} / In practice</p><h3><div><span>{skill.focus}</span></div></h3><p>{skill.detail}</p><ul className="case-steps">{skill.tools.map(tool=><li key={tool}>{tool}</li>)}</ul></div>
      <div className="case-bottom"><span>Skills in practice · 3D interpretation</span><a href={index<3?`#${skills[index+1].id}`:'#experience'}>{index<3?'Next skill':'Experience'}</a></div>
    </div></section>)}
  </div>
}
