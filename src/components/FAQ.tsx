import { useState } from 'react'

const faqs = [
  { q: 'What happens if I arrive late for my booked slot?', a: "Your slot runs on strict clock time, not elapsed time. If you booked 12:00 – 12:30 PM and arrive at 12:15 PM, you get 15 minutes of run time. The relay cuts power at 12:30 PM regardless. This protects the next student's paid slot. Always arrive 3 minutes early — you will get a reminder notification 15 minutes before your slot starts." },
  { q: 'How do I unlock the physical machine?', a: 'Immediately after payment is confirmed, a unique 4-digit PIN is sent to your email and visible in the app. At the machine, press the wake button (*) on the keypad, enter your 4 digits, then press (#) to confirm. The electronic door solenoid clicks open and main power activates.' },
  { q: 'What if electricity goes off during my wash?', a: 'Kilowash machines run entirely on solar power with a dedicated battery backup. Campus grid failures have zero effect on your cycle. In the rare event of a solar system fault lasting more than 4 minutes, the ESP32 microcontroller logs an interrupted cycle and triggers an automatic 100% wallet credit refund.' },
  { q: 'Can unregistered students view slot availability?', a: 'Yes. The Live Bay Timetable is publicly accessible across all university halls. You can see live cycle minutes, upcoming reservations, and active machine health before creating an account or paying for a slot.' },
  { q: 'What if the previous person leaves their clothes in the machine?', a: 'You have a 10-minute buffer window between every slot specifically for unloading. If clothes are still in the machine when your slot starts, tap "Report Blocked Machine" in the app. The offending user receives a strike and a ₦500 penalty fee on their next booking. Three strikes result in a 7-day account suspension.' },
  { q: 'Can I cancel or reschedule my booking?', a: 'Cancellations are allowed up to 30 minutes before your slot start time for a full wallet credit. Cancellations within 30 minutes of the slot are non-refundable. Rescheduling is free if done more than 1 hour in advance, subject to slot availability.' },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="w-full py-20 px-8" style={{ background: '#dde8ea' }}>
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-14">
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '8px' }}>Common Questions</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>Everything you need to know.</h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div
                key={i}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: '#dde8ea',
                  boxShadow: isOpen
                    ? 'inset 4px 4px 10px #b8c6c9, inset -4px -4px 10px #ffffff'
                    : '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff',
                }}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0b3c42', letterSpacing: '-0.01em', lineHeight: 1.4 }}>{faq.q}</span>
                  <div
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300"
                    style={{
                      background: '#dde8ea',
                      boxShadow: isOpen
                        ? 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff'
                        : '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke={isOpen ? '#fd8451' : '#0b3c42'} strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </button>

                <div className="faq-body" style={{ maxHeight: isOpen ? '400px' : '0' }}>
                  <p
                    className="px-6 pb-6"
                    style={{ fontSize: '13px', lineHeight: 1.75, color: '#5a7578', borderTop: '1px solid rgba(184,198,201,0.5)', paddingTop: '16px' }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
