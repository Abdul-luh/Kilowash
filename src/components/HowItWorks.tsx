import { useEffect, useRef, useState } from 'react'
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
  const sectionRef      = useRef<HTMLElement>(null)
  const headingRef      = useRef<HTMLDivElement>(null)
  const mobileStageRef  = useRef<HTMLDivElement>(null)
  const cardRefs        = useRef<(HTMLDivElement | null)[]>([])
  const desktopCardsRef = useRef<HTMLDivElement>(null)
  const triggerRef      = useRef<ScrollTrigger | null>(null)

  const [activeStep, setActiveStep] = useState(0)
  const touchStartX     = useRef(0)
  const touchStartY     = useRef(0)
  const isHorizontalSwipe = useRef(false)

  // Navigate directly to a specific step
  function goToStep(stepIdx: number) {
    if (!triggerRef.current) return
    const target = Math.max(0, Math.min(3, stepIdx))
    const start = triggerRef.current.start
    const end = triggerRef.current.end
    const targetY = start + (target / 3) * (end - start)

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    })
  }

  // 3D Perspective Reel transformation calculation
  function apply3DTransforms(p: number) {
    const currentIdx = Math.round(p)
    setActiveStep(Math.max(0, Math.min(3, currentIdx)))

    cardRefs.current.forEach((card, idx) => {
      if (!card) return
      const delta = idx - p

      // Outside visible perspective boundary
      if (Math.abs(delta) > 1.8) {
        card.style.opacity = '0'
        card.style.pointerEvents = 'none'
        card.style.transform = 'translate3d(0, 0, -300px) scale(0.6)'
        return
      }

      // X translation across 3D conveyor
      const xOffset = delta * 215
      // Z depth recession
      const zOffset = -Math.abs(delta) * 90
      // 3D perspective Y rotation
      const rotateY = -Math.max(-32, Math.min(32, delta * 24))
      // Focal scaling
      const scale = Math.max(0.78, 1 - Math.abs(delta) * 0.14)

      // Smooth opacity curve
      let opacity = 1
      if (Math.abs(delta) > 0.35) {
        opacity = Math.max(0, 1 - (Math.abs(delta) - 0.35) * 0.85)
      }

      // Depth of field blur on angled wing cards
      const blur = Math.max(0, (Math.abs(delta) - 0.35) * 3)
      const zIndex = Math.max(1, Math.round((4 - Math.abs(delta)) * 10))

      card.style.opacity = opacity.toFixed(3)
      card.style.zIndex = zIndex.toString()
      card.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : 'none'
      card.style.transform = `translate3d(${xOffset.toFixed(1)}px, 0, ${zOffset.toFixed(1)}px) rotateY(${rotateY.toFixed(1)}deg) scale(${scale.toFixed(3)})`
      card.style.pointerEvents = Math.abs(delta) < 1.1 ? 'auto' : 'none'
    })
  }

  // Touch handlers for direct horizontal swipe support on mobile
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isHorizontalSwipe.current = false
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current

    if (!isHorizontalSwipe.current && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
      isHorizontalSwipe.current = true
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isHorizontalSwipe.current) return
    const dx = e.changedTouches[0].clientX - touchStartX.current

    if (Math.abs(dx) > 35) {
      if (dx < 0) {
        // Swiped Left -> Advance to next step
        if (activeStep < 3) {
          goToStep(activeStep + 1)
        } else if (triggerRef.current) {
          window.scrollTo({ top: triggerRef.current.end + 60, behavior: 'smooth' })
        }
      } else {
        // Swiped Right -> Go to previous step
        if (activeStep > 0) {
          goToStep(activeStep - 1)
        } else if (triggerRef.current) {
          window.scrollTo({ top: triggerRef.current.start - 60, behavior: 'smooth' })
        }
      }
    }
  }

  useEffect(() => {
    const mm = gsap.matchMedia()

    // Mobile: (< 768px) Pinned 3D Perspective Reel driven by vertical scroll + touch swipe
    mm.add('(max-width: 767px)', () => {
      // Header entrance
      gsap.from(headingRef.current, {
        y: 25,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: 'top 85%',
        },
      })

      // Initial 3D placement
      apply3DTransforms(0)

      // Pinned vertical scroll driving the 3D perspective reel
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top+=64',
        end: () => `+=${window.innerHeight * 1.5}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          apply3DTransforms(self.progress * 3)
        },
      })

      triggerRef.current = st
    })

    // Desktop & Tablet: (>= 768px) Standard 4-column responsive grid
    mm.add('(min-width: 768px)', () => {
      triggerRef.current = null

      gsap.from(headingRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      })

      if (desktopCardsRef.current) {
        gsap.from(desktopCardsRef.current.querySelectorAll('.hiw-card-desktop'), {
          y: 60,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: { trigger: desktopCardsRef.current, start: 'top 80%' },
        })
      }

      gsap.from('.hiw-connector', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: desktopCardsRef.current, start: 'top 75%' },
      })
    })

    return () => {
      mm.revert()
      triggerRef.current = null
    }
  }, [])

  return (
    <section ref={sectionRef} id="how" className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-8 relative overflow-hidden" style={{ background: '#dde8ea' }}>
      <div className="max-w-[1280px] mx-auto">

        {/* Section Header */}
        <div ref={headingRef} className="mb-6 md:mb-14 max-w-xl">
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '8px' }}>
            Zero Line Friction
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>
            Four steps from phone to fresh clothes.
          </h2>
        </div>

        {/* MOBILE VIEW: 3D Perspective Reel with Dual Gesture (< 768px) */}
        <div className="block md:hidden">
          {/* Dual Gesture Guidance Badge */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                color: steps[activeStep].accent,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: steps[activeStep].accent }} />
              Step {steps[activeStep].num} of 04
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5a7578]">
              <span className="material-symbols-outlined text-[15px] text-[#fd8451]">touch_app</span>
              <span>Swipe or scroll</span>
            </span>
          </div>

          {/* 3D Stage Container */}
          <div
            ref={mobileStageRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full h-[370px] flex items-center justify-center [perspective:1100px] [transform-style:preserve-3d] select-none touch-pan-y"
          >
            {steps.map((s, idx) => (
              <div
                key={s.num}
                ref={el => { cardRefs.current[idx] = el }}
                onClick={() => goToStep(idx)}
                className="absolute w-[84vw] max-w-[340px] h-[350px] p-6 rounded-3xl flex flex-col justify-between cursor-pointer transition-shadow duration-300 will-change-transform"
                style={{
                  background: '#dde8ea',
                  boxShadow: idx === activeStep
                    ? '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff'
                    : '6px 6px 14px #b8c6c9, -6px -6px 14px #ffffff',
                }}
              >
                {/* Ghost number in 3D background */}
                <span
                  className="absolute top-4 right-5 select-none pointer-events-none"
                  style={{
                    fontWeight: 800,
                    fontSize: '3.6rem',
                    lineHeight: 1,
                    color: 'rgba(11,60,66,0.06)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {s.num}
                </span>

                <div>
                  {/* Step Pill */}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${s.accent}14`,
                      color: s.accent,
                      boxShadow: 'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff',
                    }}
                  >
                    Step {s.num}
                  </span>

                  {/* Icon — Inset circle */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
                      color: s.accent,
                    }}
                  >
                    <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0b3c42', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#5a7578', fontWeight: 400 }}>
                    {s.body}
                  </p>
                </div>

                {/* Accent Footer line */}
                <div className="flex items-center justify-between pt-2">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: idx === activeStep ? '48px' : '24px',
                      background: s.accent,
                      boxShadow: `1px 1px 4px ${s.accent}80`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: s.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {idx === activeStep ? 'Active Focus' : 'Tap to focus'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Bottom Navigation Controls */}
          <div className="flex items-center justify-between mt-4 px-2">
            <button
              onClick={() => goToStep(activeStep - 1)}
              disabled={activeStep === 0}
              aria-label="Previous step"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: '#dde8ea',
                boxShadow: activeStep === 0
                  ? 'none'
                  : '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff',
                color: '#0b3c42',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            {/* Interactive Step Pill Dots */}
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => {
                const isActive = activeStep === idx
                return (
                  <button
                    key={s.num}
                    onClick={() => goToStep(idx)}
                    aria-label={`Jump to step ${s.num}`}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? '28px' : '8px',
                      background: isActive ? s.accent : '#b8c6c9',
                      boxShadow: isActive ? `0 2px 6px ${s.accent}60` : 'none',
                    }}
                  />
                )
              })}
            </div>

            <button
              onClick={() => goToStep(activeStep + 1)}
              disabled={activeStep === 3}
              aria-label="Next step"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: '#dde8ea',
                boxShadow: activeStep === 3
                  ? 'none'
                  : '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff',
                color: '#0b3c42',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* DESKTOP & TABLET VIEW: 4-Column Responsive Grid (>= 768px) */}
        <div className="hidden md:block relative">
          {/* Connector line — desktop only */}
          <div
            className="hiw-connector absolute top-[3.25rem] left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px hidden lg:block"
            style={{ background: 'linear-gradient(to right, #b8c6c9 0%, #fd8451 50%, #b8c6c9 100%)', opacity: 0.5 }}
          />

          <div
            ref={desktopCardsRef}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {steps.map(s => (
              <div
                key={s.num}
                className="hiw-card-desktop relative flex flex-col p-7 rounded-2xl"
                style={{ background: '#dde8ea', boxShadow: '8px 8px 18px #b8c6c9, -8px -8px 18px #ffffff' }}
              >
                {/* Ghost number */}
                <span
                  className="absolute top-4 right-5 select-none pointer-events-none"
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

                {/* Icon — inset circle */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
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
        </div>

      </div>
    </section>
  )
}
