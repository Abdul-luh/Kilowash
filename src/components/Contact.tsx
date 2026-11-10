export default function Contact() {
  const contacts = [
    { icon: 'support_agent', label: 'FUTO Hostel Hub Supervisor', sub: 'Hostel Block C, Ground Utility Bay', action: 'Call Node', href: 'tel:0800632426' },
    { icon: 'engineering',   label: 'Emergency Solenoid Override', sub: 'Physical Door Jam & Keypad Lock',  action: '#1188 (Toll Free)', href: '#' },
    { icon: 'mail',          label: 'Email Support',               sub: 'Response within 2 hours',          action: 'hello@kilowash.ng', href: 'mailto:hello@kilowash.ng' },
  ]

  return (
    <section id="contact" className="w-full py-20 px-8" style={{ background: '#dde8ea' }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase' }}>Campus Infrastructure Desk</div>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>
              Questions? Machine issues? Talk to us.
            </h2>
            <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#5a7578' }}>
              Keypad lockouts, payment issues, or machine faults — dedicated on-campus duty supervisors respond within 15 minutes.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              {contacts.map(c => (
                <div
                  key={c.label}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: '#dde8ea', boxShadow: '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff' }}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ color: '#0b3c42' }}>{c.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0b3c42' }}>{c.label}</div>
                      <div style={{ fontSize: '11px', color: '#8aa8ab' }}>{c.sub}</div>
                    </div>
                  </div>
                  <a
                    href={c.href}
                    className="px-3 py-1.5 rounded-full transition-all"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff', fontSize: '11px', fontWeight: 700, color: '#5a7578', textDecoration: 'none' }}
                  >
                    {c.action}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Right form — raised card with inset fields */}
          <div className="lg:col-span-7">
            <div
              className="p-8 rounded-2xl"
              style={{ background: '#dde8ea', boxShadow: '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff' }}
            >
              <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid rgba(184,198,201,0.4)' }}>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0b3c42', letterSpacing: '-0.02em' }}>Direct Ticket Submission</h3>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#fd8451', textTransform: 'uppercase' }}>Hardware Helpdesk</span>
              </div>

              <form
                className="flex flex-col gap-5"
                onSubmit={e => { e.preventDefault(); alert('Ticket received. A supervisor will respond within 15 minutes.') }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Your Name',           placeholder: 'Full name',         type: 'text' },
                    { label: 'Matric / Student ID', placeholder: 'e.g. 2021/119420', type: 'text' },
                  ].map(f => (
                    <div key={f.label} className="flex flex-col gap-1.5">
                      <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        required
                        className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                        style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>Machine Bay ID</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl outline-none appearance-none"
                    style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                  >
                    {['BAY-01 (Dryer - Block C)', 'BAY-02 (Heavy Washer - Block C)', 'BAY-03 (Standard Washer - Block C)', 'BAY-04 (Eco Washer - Block C)', 'General Campus Bay Question'].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>Issue Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Keypad Lockout', 'Payment Issue', 'Machine Fault', 'PIN Not Received', 'Blocked Machine', 'Other'].map((issue, i) => (
                      <label
                        key={issue}
                        className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer"
                        style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                      >
                        <input defaultChecked={i === 0} name="issue" type="radio" className="accent-[#fd8451]" />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#5a7578' }}>{issue}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what happened..."
                    className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                    style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full flex items-center justify-center gap-2 transition-all"
                  style={{ background: '#0b3c42', boxShadow: '5px 5px 12px rgba(11,60,66,0.4), -3px -3px 8px rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Submit Support Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
