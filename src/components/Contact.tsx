import { useState } from 'react'

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    const form = e.currentTarget
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value,
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...data }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  const contacts = [
    { icon: 'mail',      label: 'Email',    value: 'hello@kilowash.ng',   href: 'mailto:hello@kilowash.ng' },
    { icon: 'call',      label: 'Phone',    value: '+234 800 632 426',     href: 'tel:+2348006324260' },
    { icon: 'location_on', label: 'Base',   value: 'FUTO, Owerri — Imo State', href: '#' },
  ]

  return (
    <section id="contact" className="w-full py-20 px-8" style={{ background: '#dde8ea' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase' }}>Get In Touch</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>
              Questions, partnerships, or just want to talk?
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#5a7578' }}>
              Whether you're a student, a hostel manager, an investor, or just curious — we'd love to hear from you.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              {contacts.map(c => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all"
                  style={{ background: '#dde8ea', boxShadow: '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff', textDecoration: 'none' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ color: '#fd8451' }}>{c.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8aa8ab' }}>{c.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0b3c42' }}>{c.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div className="lg:col-span-7">
            <div
              className="p-8 rounded-2xl"
              style={{ background: '#dde8ea', boxShadow: '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff' }}
            >
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0b3c42', letterSpacing: '-0.02em', marginBottom: '24px' }}>Send us a message</h3>

              {status === 'done' ? (
                <div className="py-10 flex flex-col items-center gap-4 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: '#dde8ea', boxShadow: '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[28px]" style={{ color: '#fd8451' }}>mark_email_read</span>
                  </div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0b3c42' }}>Message sent!</h4>
                  <p style={{ fontSize: '13px', color: '#5a7578', lineHeight: 1.7 }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {status === 'error' && (
                    <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(253,132,81,0.12)', fontSize: '12px', color: '#fd8451', fontWeight: 600 }}>
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Your Name', name: 'name',  placeholder: 'Full name',        type: 'text'  },
                      { label: 'Email',     name: 'email', placeholder: 'you@example.com',  type: 'email' },
                    ].map(f => (
                      <div key={f.name} className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>{f.label}</label>
                        <input
                          type={f.type}
                          name={f.name}
                          placeholder={f.placeholder}
                          required
                          className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                          style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>Subject</label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="What's this about?"
                      required
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                      style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Tell us what's on your mind..."
                      required
                      className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                      style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 rounded-full flex items-center justify-center gap-2 transition-all"
                    style={{ background: '#0b3c42', boxShadow: '5px 5px 12px rgba(11,60,66,0.4), -3px -3px 8px rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    {status === 'loading' ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
