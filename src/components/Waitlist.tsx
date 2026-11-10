import { useState } from 'react'

const schools = [
  'Federal University of Technology Owerri (FUTO)',
  'University of Lagos (UNILAG)',
  'Covenant University',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria Nsukka (UNN)',
  'Other',
]

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [school, setSchool] = useState('')
  const [done, setDone] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !school) return
    setDone(true)
  }

  return (
    <section id="waitlist" className="w-full py-20 px-8" style={{ background: '#dde8ea', boxShadow: 'inset 0 6px 16px #b8c6c9, inset 0 -6px 16px #ffffff' }}>
      <div className="max-w-[1280px] mx-auto">

        {/* Outer raised container */}
        <div
          className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
          style={{ background: '#dde8ea', boxShadow: '12px 12px 28px #b0bec0, -12px -12px 28px #ffffff' }}
        >
          {/* Decorative inset circle top-right */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: '#dde8ea', boxShadow: 'inset 8px 8px 20px #b8c6c9, inset -8px -8px 20px #ffffff', opacity: 0.5 }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

            {/* Left copy */}
            <div className="flex flex-col gap-6">
              <div
                className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full"
                style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#fd8451', textTransform: 'uppercase' }}
              >
                <span className="material-symbols-outlined text-[14px]">sensors</span>
                Launching Soon
              </div>

              <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>
                Be first in line when we go live at your campus.
              </h2>

              <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#5a7578' }}>
                Drop your school email and campus. We will notify you the moment Kilowash machines go live at your hostel — and you will get priority slot access for the first week.
              </p>

              {/* Stats — inset trays */}
              <div className="flex gap-6 pt-2">
                {[
                  { num: '3',      label: 'Campuses in pipeline' },
                  { num: '₦1,500', label: 'Per 30-min cycle' },
                  { num: '0',      label: 'Queues. Ever.' },
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex flex-col px-4 py-3 rounded-2xl"
                    style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff' }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em', color: '#fd8451' }}>{s.num}</span>
                    <span style={{ fontSize: '11px', color: '#8aa8ab', marginTop: '2px' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form — inset panel */}
            <div
              className="rounded-2xl p-8"
              style={{ background: '#dde8ea', boxShadow: 'inset 5px 5px 14px #b8c6c9, inset -5px -5px 14px #ffffff' }}
            >
              {done ? (
                <div className="text-center py-8 flex flex-col items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: '#dde8ea', boxShadow: '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[32px]" style={{ color: '#fd8451' }}>verified</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0b3c42' }}>You are in.</h3>
                  <p style={{ fontSize: '13px', color: '#5a7578', lineHeight: 1.7 }}>
                    We will hit you up the moment Kilowash goes live at your campus. Priority slot access is yours for the first week.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '4px' }}>Step 01 / Identity</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0b3c42', letterSpacing: '-0.02em' }}>Join Kilowash Campus Network</h3>
                  </div>

                  {/* Email input — inset */}
                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>School Email</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: '#8aa8ab' }}>alternate_email</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@student.edu.ng"
                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                        style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                      />
                    </div>
                  </div>

                  {/* School select — inset */}
                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>Your Campus</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: '#8aa8ab' }}>apartment</span>
                      <select
                        required
                        value={school}
                        onChange={e => setSchool(e.target.value)}
                        className="w-full appearance-none pl-10 pr-9 py-3 rounded-xl outline-none transition-all"
                        style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: school ? '#0b3c42' : '#8aa8ab', border: 'none' }}
                      >
                        <option value="" disabled>Select your school</option>
                        {schools.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 text-[18px] pointer-events-none" style={{ color: '#8aa8ab' }}>unfold_more</span>
                    </div>
                  </div>

                  {/* Submit — raised tang */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full flex items-center justify-center gap-2 transition-all group"
                    style={{ background: '#fd8451', boxShadow: '5px 5px 12px rgba(253,132,81,0.45), -3px -3px 8px rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    <span>Secure My Early Access</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>

                  <p style={{ fontSize: '11px', color: '#8aa8ab', textAlign: 'center' }}>
                    No spam. Just a single notification when your campus goes live.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
