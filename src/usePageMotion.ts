import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function usePageMotion(root: RefObject<HTMLDivElement>, enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled) return
      const context = gsap.context(() => {
        gsap.from('.hero-letter', {
          yPercent: 110,
          rotateX: -55,
          duration: 1.1,
          stagger: .055,
          ease: 'power4.out',
        })

        const opening = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: .65,
          },
        })
        opening
          .fromTo('.hero-letter', { yPercent: 0, rotateX: 0 }, { yPercent: -65, stagger: .055, duration: 1, ease: 'power2.in', immediateRender: false }, 0)
          .to('.hero h1 em', { xPercent: 32, rotate: -12, scale: 1.25, duration: 1 }, 0)
          .to('.hero-kicker, .hero-foot', { y: -30, opacity: 0, duration: .45 }, .1)
          .to('.hero-copy', { backgroundColor: '#121212', color: '#f2efe7', duration: .6 }, .35)

        gsap.fromTo('.project-world', {
          clipPath: 'inset(18% 9% 18% 9%)',
          yPercent: 12,
        }, {
          clipPath: 'inset(0% 0% 0% 0%)',
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.project-sequence', start: 'top bottom', end: 'top top', scrub: .65 },
        })

        for (const selector of ['.afterword', '.experience', '.contact']) {
          const section = document.querySelector<HTMLElement>(selector)!
          gsap.fromTo(section, {
            clipPath: 'polygon(0 9%, 100% 0, 100% 100%, 0 100%)',
          }, {
            clipPath: 'polygon(0 0%, 100% 0, 100% 100%, 0 100%)',
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 45%', scrub: .5 },
          })
        }

        gsap.utils.toArray<HTMLElement>('.skill-list > div, .experience-item').forEach(row => {
          // Keep the content readable at every position, including anchor navigation.
          gsap.fromTo(row, { y: 35, '--rule-scale': 0 }, {
            y: 0,
            '--rule-scale': 1,
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 60%', scrub: .35 },
          })
        })
        gsap.fromTo('.contact > a', { yPercent: 18, rotate: -3 }, {
          yPercent: 0,
          rotate: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 15%', scrub: .7 },
        })
      }, root)
    let mounted = true
    document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh() })
    return () => {
      mounted = false
      context.revert()
    }
  }, [root, enabled])
}
