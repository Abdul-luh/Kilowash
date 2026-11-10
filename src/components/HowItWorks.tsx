import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { num: '01', icon: 'apartment',             title: 'Select Bay & Campus',  body: 'Open the live hostel map. Pick your campus, check machine specs and active load cycles. Past slots are hidden — only future time is bookable.',                                         accent: '#0b3c42' },
  { num: '02', icon: 'credit_card_clock',     title: 'Pick Slot & Pay',      body: 'Choose your guaranteed 30-minute window. Pay ₦1,500 via Card, Transfer, or USSD. Payment confirmed by webhook in seconds — slot locked instantly.',                                      accent: '#fd8451' },
  { num: '03', icon: 'pin',                   title: 'Get Your PIN',         body: 'A unique 4-digit unlock PIN is sent to your email and visible in the app. Valid only during your booked time window — single use, non-transferable.',                                      accent: '#0b3c42' },
  { num: '04', icon: 'local_laundry_service', title: 'Unlock & Wash',        body: 'Arrive at the machine, type your PIN on the keypad. The relay closes, power activates. Machine runs on solar — no NEPA dependency, no interruptions.',                                   accent: '#fd8451' },
]

export default function HowItWorks() {
  const sectionRef  = useRef<HTMLElement>(null)
  const headingRef  = useRef<HTMLDivElement>(null)
  const cardsRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    // Mobile: (< 768px) Pinned horizontal parallax scroll from right to left
    mm.add('(max-width: 767px)', () => {
      // Header slides up
      gsap.from(headingRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 85%',
        },
      })

      const track = cardsRef.current
      if (!track) return

      const getTotalScroll = () => {
        const parentW = sectionRef.current?.clientWidth || window.innerWidth
        return Math.max(0, track.scrollWidth - parentW + 32)
      }

      // Horizontal track scroll from right to left as user scrolls down
      gsap.to(track, {
        x: () => -getTotalScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top+=64',
          end: () => `+=${getTotalScroll() * 1.15}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const activeIndex = Math.min(3, Math.floor(self.progress * 4))
            const dots = document.querySelectorAll('.hiw-dot')
            dots.forEach((dot, idx) => {
              const el = dot as HTMLElement
              if (idx === activeIndex) {
                el.style.width = '20px'
                el.style.opacity = '1'
              } else {
                el.style.width = '6px'
                el.style.opacity = '0.35'
              }
            })
          },
        },
      })

      // Parallax effect on ghost numbers (drifting faster to the left)
      gsap.to('.hiw-ghost-num', {
        x: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top+=64',
          end: () => `+=${getTotalScroll() * 1.15}`,
          scrub: 0.8,
        },
      })

      // Parallax effect on icons (subtle tilt and offset)
      gsap.to('.hiw-card-icon', {
        x: 16,
        rotation: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top+=64',
          end: () => `+=${getTotalScroll() * 1.15}`,
          scrub: 0.8,
        },
      })
    })

    // Desktop & Tablet: (>= 768px) Standard grid stagger entrance
    mm.add('(min-width: 768px)', () => {
      // Header slides up + fades in
      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      })

      // Cards stagger in from below
      gsap.from('.hiw-card', {
        y: 60,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
      })

      // Connector line draws across
      gsap.from('.hiw-connector', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: cardsRef.current, start: 'top 75%' },
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how" className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-8 relative overflow-hidden" style={{ background: '#dde8ea' }}>
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <div ref={headingRef} className="mb-8 md:mb-14 max-w-xl">
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '8px' }}>Zero Line Friction</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>
            Four steps from phone to fresh clothes.
          </h2>
        </div>

        {/* Steps track wrapper */}
        <div className="relative overflow-hidden md:overflow-visible">

          {/* Connector line — desktop only */}
          <div
            className="hiw-connector absolute top-[3.25rem] left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px hidden lg:block"
            style={{ background: 'linear-gradient(to right, #b8c6c9 0%, #fd8451 50%, #b8c6c9 100%)', opacity: 0.5 }}
          />

          {/* Cards Track: flex-nowrap on mobile for right-to-left parallax scroll; grid on desktop */}
          <div
            ref={cardsRef}
            className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 will-change-transform"
          >
            {steps.map(s => (
              <div
                key={s.num}
                className="hiw-card relative flex flex-col p-6 sm:p-7 rounded-2xl w-[82vw] max-w-[340px] shrink-0 md:w-auto md:max-w-none md:shrink"
                style={{ background: '#dde8ea', boxShadow: '8px 8px 18px #b8c6c9, -8px -8px 18px #ffffff' }}
              >
                {/* Ghost number with parallax target */}
                <span
                  className="hiw-ghost-num absolute top-4 right-5 select-none pointer-events-none will-change-transform"
                  style={{ fontWeight: 800, fontSize: '3.5rem', lineHeight: 1, color: 'rgba(11,60,66,0.06)', letterSpacing: '-0.04em' }}
                >
                  {s.num}
                </span>

                {/* Step pill tag */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 self-start text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: `${s.accent}14`,
                    color: s.accent,
                    boxShadow: 'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff',
                  }}
                >
                  Step {s.num}
                </span>

                {/* Icon — inset circle with parallax target */}
                <div
                  className="hiw-card-icon w-12 h-12 rounded-2xl flex items-center justify-center mb-5 will-change-transform"
                  style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff', color: s.accent }}
                >
                  <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
                </div>

                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0b3c42', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{s.title}</h3>
                <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#5a7578', fontWeight: 400, flex: 1 }}>{s.body}</p>

                <div
                  className="mt-6 h-1 rounded-full w-8"
                  style={{ background: s.accent, boxShadow: `1px 1px 4px ${s.accent}80` }}
                />
              </div>
            ))}
          </div>

          {/* Mobile parallax scroll progress indicator */}
          <div className="flex md:hidden items-center justify-between mt-6 px-1">
            <div className="flex items-center gap-1.5">
              {steps.map(s => (
                <span
                  key={s.num}
                  className="hiw-dot h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: s.num === '01' ? '20px' : '6px',
                    background: s.accent,
                    opacity: s.num === '01' ? 1 : 0.35,
                  }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#5a7578' }}>
              <span>Scroll to explore</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
