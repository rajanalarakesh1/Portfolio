import { useLayoutEffect, type MutableRefObject, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { CinemaPose } from './ProjectCinema'

export function usePageMotion(root: RefObject<HTMLDivElement>, enabled: boolean, pose: MutableRefObject<CinemaPose>) {
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const chapters: [string,number][] = [['.hero',-2],['.work-intro',-1],['.approach',4],['.experience',6],['.contact',7]]
      chapters.forEach(([selector,chapter]) => {
        const section = document.querySelector<HTMLElement>(selector)!
        const travel = { value: 0 }
        ScrollTrigger.create({trigger:section,start:'top 60%',end:'bottom 60%',onToggle:self=>{if(self.isActive){pose.current.chapter=chapter;pose.current.progress=travel.value}},onRefresh:self=>{if(self.isActive){pose.current.chapter=chapter;pose.current.progress=travel.value}}})
        if (!enabled) return
        gsap.to(travel,{value:1,ease:'none',scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:.65},onUpdate:()=>{if(pose.current.chapter===chapter)pose.current.progress=travel.value}})
      })
      if (!enabled) return
      gsap.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom 35%',scrub:.65}})
        .fromTo('.hero h1',{yPercent:0,scale:1,opacity:1},{yPercent:-25,scale:.93,opacity:0,duration:1,ease:'power2.in',immediateRender:false},0)
        .fromTo('.hero-foot',{y:0,opacity:1},{y:-35,opacity:0,duration:.5,immediateRender:false},.25)
      gsap.fromTo('.work-intro-foot,.work-heading',{y:0,opacity:1},{y:-65,opacity:0,stagger:.08,ease:'none',immediateRender:false,scrollTrigger:{trigger:'.work-intro',start:'bottom 85%',end:'bottom 20%',scrub:.65}})
      const approach = gsap.timeline({scrollTrigger:{trigger:'.approach',start:'top top',end:'bottom bottom',scrub:.65}})
      approach.fromTo('.approach h2',{y:0,autoAlpha:1},{y:-45,autoAlpha:0,duration:.15,immediateRender:false},.28)
        .fromTo('.approach-notes',{y:45,autoAlpha:0},{y:0,autoAlpha:1,duration:.18},.43)
        .fromTo('.approach-notes > div',{x:25,opacity:0},{x:0,opacity:1,stagger:.05,duration:.12},.47)
        .to('.approach-notes',{y:-25,autoAlpha:0,duration:.08},.92)
      const experience = gsap.timeline({scrollTrigger:{trigger:'.experience',start:'top top',end:'bottom bottom',scrub:.65}})
      const entries=gsap.utils.toArray<HTMLElement>('.experience-item',root.current!)
      entries.forEach((row,index)=>{
        if(index===0) gsap.set(row,{autoAlpha:1,y:0})
        else experience.fromTo(row,{y:45,autoAlpha:0},{y:0,autoAlpha:1,duration:.055},index*.25-.025)
        if(index<entries.length-1)experience.to(row,{y:-35,autoAlpha:0,duration:.055},index*.25+.19)
      })
      // Keep the last entry readable through the final quarter of the pinned scene.
      experience.to({}, {duration:.03},.97)
      gsap.fromTo('.contact-pin > a',{y:100,rotateX:-18,opacity:.1},{y:0,rotateX:0,opacity:1,ease:'power3.out',scrollTrigger:{trigger:'.contact',start:'top 90%',end:'top top',scrub:.7}})
    }, root)
    // Individual CSS translate composes with the scroll timelines' transforms.
    const movingText = root.current?.querySelectorAll<HTMLElement>('.hero h1, .work-heading, .case-title, .case-intro-copy, .case-detail h3, .approach h2, .approach-notes, .experience-item h3, .contact-pin > a')
    const textObserver = enabled ? new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('text-alive', entry.isIntersecting))
    }, {threshold: .05}) : null
    movingText?.forEach((element,index) => {
      element.style.setProperty('--text-phase', `${-(index % 5) * .8}s`)
      textObserver?.observe(element)
    })
    let mounted=true
    document.fonts.ready.then(()=>{if(mounted)ScrollTrigger.refresh()})
    return ()=>{mounted=false;textObserver?.disconnect();movingText?.forEach(element=>{element.classList.remove('text-alive');element.style.removeProperty('--text-phase')});context.revert()}
  },[root,enabled,pose])
}
