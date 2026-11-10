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
  const scheduleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Header slides up + fades in
      gsap.from(headingRef.current, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      })

      // Cards stagger in from below
      gsap.from('.hiw-card', {
        y: 60, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
      })

      // Connector line draws across (desktop only)
      gsap.from('.hiw-connector', {
        scaleX: 0, transformOrigin: 'left center', duration: 1, ease: 'power2.inOut',
        scrollTrigger: { trigger: cardsRef.current, start: 'top 75%' },
      })

      // Schedule panel slides up
      gsap.from(scheduleRef.current, {
        y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: scheduleRef.current, start: 'top 85%' },
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="how" className="w-full py-20 px-8" style={{ background: '#dde8ea' }}>
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <div ref={headingRef} className="mb-14 max-w-xl">
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '8px' }}>Zero Line Friction</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>
            Four steps from phone to fresh clothes.
          </h2>
        </div>

        {/* Steps */}
        <div ref={cardsRef} className="relative">

          {/* Connector line — desktop only */}
          <div
            className="hiw-connector absolute top-[3.25rem] left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px hidden lg:block"
            style={{ background: 'linear-gradient(to right, #b8c6c9 0%, #fd8451 50%, #b8c6c9 100%)', opacity: 0.5 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(s => (
              <div
                key={s.num}
                className="hiw-card relative flex flex-col p-7 rounded-2xl"
                style={{ background: '#dde8ea', boxShadow: '8px 8px 18px #b8c6c9, -8px -8px 18px #ffffff' }}
              >
                {/* Ghost number */}
                <span
                  className="absolute top-4 right-5 select-none"
                  style={{ fontWeight: 800, fontSize: '3.5rem', lineHeight: 1, color: 'rgba(11,60,66,0.05)', letterSpacing: '-0.04em' }}
                >
                  {s.num}
                </span>

                {/* Icon — inset circle */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
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

        {/* Slot schedule */}
        <div
          ref={scheduleRef}
          className="mt-10 p-8 rounded-2xl"
          style={{ background: '#0b3c42', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(255,255,255,0.05)' }}
        >
          <div className="mb-6">
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '8px' }}>How Slots Work</div>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white', letterSpacing: '-0.02em', marginBottom: '8px' }}>Your 30 minutes is yours — no overlap, ever.</h3>
            <p style={{ fontSize: '13px', color: 'rgba(162,206,213,0.6)', lineHeight: 1.7, maxWidth: '560px' }}>
              Every wash cycle is followed by a mandatory 10-minute unload buffer — so the next person can't start until you've cleared your clothes. Here's what a real afternoon looks like on one machine:
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { time: '12:00 – 12:30', status: 'booked'    },
              { time: '12:30 – 12:40', status: 'buffer'    },
              { time: '12:40 – 01:10', status: 'available' },
              { time: '01:10 – 01:20', status: 'buffer'    },
              { time: '01:20 – 01:50', status: 'available' },
              { time: '01:50 – 02:00', status: 'buffer'    },
              { time: '02:00 – 02:30', status: 'booked'    },
            ].map(slot => {
              const colors = { available: '#0E8A5E', buffer: '#2A6099', booked: '#fd8451' }
              const c = colors[slot.status as keyof typeof colors]
              return (
                <div
                  key={slot.time}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: `${c}18`, border: `1px solid ${c}40` }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: c }}></span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: `${c}cc` }}>{slot.time}</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: `${c}60`, textTransform: 'uppercase' }}>
                    {slot.status === 'buffer' ? '10m buffer' : slot.status}
                  </span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(162,206,213,0.4)', marginTop: '16px' }}>
            The buffer is automatic — no one can book the next slot until the machine is physically clear.
          </p>
        </div>
      </div>
    </section>
  )
}
