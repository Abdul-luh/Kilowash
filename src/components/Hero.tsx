import trousers from '../assets/trousers.png'
import natives from '../assets/natives.png'
import machine from '../assets/the machine.png'
import HeroImg from '../assets/Hero.png'
import fila from '../assets/fila.png'

const bays = [
  { id: 'BAY-01', type: 'WASHER',  status: 'IDLE',       statusColor: '#0E8A5E', cap: '9.0 KG',         detail: '100% Ready',   cta: 'Lock Slot' },
  { id: 'BAY-02', type: 'HEAVY',   status: 'IN-USE',     statusColor: '#fd8451', cap: 'Cycle 3/3 Rinse', detail: '14m left',     cta: null },
  { id: 'BAY-03', type: 'WASHER',  status: '10M BUFFER', statusColor: '#2A6099', cap: 'Unload Window',  detail: '06:21 REMAIN', cta: null },
  { id: 'BAY-04', type: 'ECO',     status: 'IDLE',       statusColor: '#0E8A5E', cap: '7.5 KG',         detail: '100% Ready',   cta: 'Lock Slot' },
]

export default function Hero() {
  return (
    <section className="w-full pt-20" style={{ background: '#dde8ea' }}>

  {/* REMOVED TOP LEVEL TELEMETRY; IT WAS GIVING AI  */}

      {/* Main hero */}
      <div className="w-full max-w-[1280px] mx-auto px-8 pt-16 pb-16 relative overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left */}
          <div className="lg:col-span-7 flex flex-col gap-8" style={{ animation: 'slideUp 0.7s cubic-bezier(.22,1,.36,1) both' }}>

{/* REMOVED "AUTONOMOUS CAMPUS LAUNDRY PROTOCOL" PILL; IT WAS LOOKING LIKE AI GENERATED  */}
          

            {/* Headline */}
            <div className="relative">
              <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.8rem, 6vw, 5rem)', lineHeight: 1.0, letterSpacing: '-0.04em', color: '#0b3c42' }}>
                Proper Wash.
              </h1>
              <h1 style={{ fontWeight: 800, fontSize: 'clamp(2.8rem, 6vw, 5rem)', lineHeight: 1.0, letterSpacing: '-0.04em', color: '#fd8451' }}>
                Zero Stress.
              </h1>
              {/* Trousers — bottom-right of headline, near center */}
              <div className="absolute -bottom-4 right-40 w-28 pointer-events-none" style={{ animation: 'floatY 6s ease-in-out infinite 0.5s', filter: 'drop-shadow(3px 6px 8px rgba(11,60,66,0.22))' }}>
                <img src={trousers} alt="" className="w-full h-auto object-contain" />
              </div>
            </div>

            <p style={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1.7, color: '#5a7578', maxWidth: '480px' }}>
              Solar-powered automated washing for your hostel. Book online, unlock in seconds — no light issues, no queues, no wahala.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full transition-all"
                style={{
                  background: '#fd8451',
                  boxShadow: '5px 5px 12px rgba(253,132,81,0.45), -3px -3px 8px rgba(255,255,255,0.5)',
                  fontSize: '13px', fontWeight: 700, color: 'white', textDecoration: 'none',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                Book Your 30-Min Slot
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full transition-all"
                style={{
                  background: '#dde8ea',
                  boxShadow: '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff',
                  fontSize: '13px', fontWeight: 700, color: '#0b3c42', textDecoration: 'none',
                }}
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                See How It Works
              </a>
            </div>

            {/* Metrics bar — inset tray */}
            <div
              className="relative p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4"
              style={{ background: '#dde8ea', boxShadow: 'inset 4px 4px 10px #b8c6c9, inset -4px -4px 10px #ffffff' }}
            >
              {/* Natives — bottom-left corner of metrics tray */}
              <div className="absolute -bottom-8 -left-5 w-14 pointer-events-none" style={{ animation: 'floatX 7s ease-in-out infinite 1s', filter: 'drop-shadow(3px 6px 8px rgba(11,60,66,0.18))' }}>
                <img src={natives} alt="" className="w-full h-auto object-contain" />
              </div>
              {[
                { label: 'Active Bays',    value: '18 / 20 Online',       accent: '#0b3c42' },
                { label: 'Buffer SLA',     value: '10m Guaranteed',        accent: '#0b3c42' },
                { label: 'Per Cycle',      value: '₦1,500 Flat',           accent: '#fd8451' },
              ].map((m, i) => (
                <div key={m.label} className="flex items-center gap-4">
                  {i > 0 && <div className="h-8 w-px hidden sm:block" style={{ background: '#b8c6c9' }}></div>}
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#8aa8ab', textTransform: 'uppercase', marginBottom: '2px' }}>{m.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: m.accent }}>{m.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges — raised pills with specific icons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: '100% Solar Powered',   icon: 'wb_sunny'        },
                { label: 'Guaranteed Slot Time',  icon: 'event_available' },
                { label: 'Instant Keypad Unlock', icon: 'pin'             },
              ].map(b => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff', fontSize: '11px', fontWeight: 700, color: '#5a7578' }}
                >
                  <span className="material-symbols-outlined text-[14px]" style={{ color: '#fd8451' }}>{b.icon}</span>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — raised card with inset image frame */}
          <div className="lg:col-span-5 relative flex items-center justify-center" style={{ animation: 'slideUp 0.9s cubic-bezier(.22,1,.36,1) 0.2s both' }}>
            <div
              className="relative w-full max-w-[420px] rounded-3xl p-5"
              style={{ background: '#dde8ea', boxShadow: '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff' }}
            >
              {/* Inset image frame */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: 'inset 5px 5px 12px #b8c6c9, inset -5px -5px 12px #ffffff' }}
              >
                <img
                  src={HeroImg}
                  alt="3D claymorphic laundry scene"
                  className="w-full h-auto object-cover"
                  style={{ transform: 'scale(0.97)', borderRadius: '1rem' }}
                />
              </div>

              {/* Raised badge: top right — fila logo */}
              <div
                className="absolute -top-4 -right-4 px-2 py-1 rounded-2xl flex items-center"
                style={{ background: '#dde8ea', boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff' }}
              >
                <img src={fila} alt="Fila" className="h-16 w-auto object-contain" />
              </div>

              {/* Raised badge: bottom left */}
              <div
                className="absolute -bottom-5 -left-4 px-4 py-2.5 rounded-2xl flex items-center gap-2.5"
                style={{ background: '#dde8ea', boxShadow: '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff' }}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ color: '#fd8451' }}>timer</span>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#8aa8ab', textTransform: 'uppercase' }}>Protocol</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0b3c42' }}>10-Min Buffer Enforced</div>
                </div>
              </div>

              {/* Inset pill: Solar */}
              <div
                className="absolute bottom-16 -right-5 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ background: '#0b3c42', boxShadow: '4px 4px 10px rgba(11,60,66,0.4), -2px -2px 6px rgba(255,255,255,0.3)' }}
              >
                <span className="material-symbols-outlined text-[14px]" style={{ color: '#fd8451' }}>wb_sunny</span>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' }}>Solar Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bay snapshot */}
      <div className="w-full py-16" style={{ boxShadow: 'inset 0 6px 16px #b8c6c9, inset 0 -2px 8px #ffffff' }}>
        <div className="max-w-[1280px] mx-auto px-8 flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '4px' }}>Telemetric Audit</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b3c42', letterSpacing: '-0.02em' }}>Live Hostel Laundry Node Registry</h2>
            </div>
            <div className="flex items-center gap-2">
              {[
                { color: '#0E8A5E', label: '14 Available' },
                { color: '#0b3c42', label: '4 In-Cycle' },
                { color: '#fd8451', label: '2 Buffer' },
              ].map(s => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: '#dde8ea', boxShadow: '2px 2px 6px #b8c6c9, -2px -2px 6px #ffffff', fontSize: '11px', fontWeight: 700, color: '#5a7578' }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }}></span>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bays.map(bay => (
              <div
                key={bay.id}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ background: '#dde8ea', boxShadow: '6px 6px 14px #b8c6c9, -6px -6px 14px #ffffff' }}
              >
                {/* Machine image — inset frame */}
                <div
                  className="relative overflow-hidden"
                  style={{ boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff', margin: '10px 10px 0', borderRadius: '1rem' }}
                >
                  <img src={machine} alt="" className="w-full h-28 object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #dde8ea 0%, transparent 60%)' }}></div>
                  <span
                    className="absolute top-2 right-2 px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff', fontSize: '9px', fontWeight: 700, color: bay.statusColor, textTransform: 'uppercase' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: bay.statusColor }}></span>
                    {bay.status}
                  </span>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#8aa8ab', textTransform: 'uppercase' }}>{bay.id} / {bay.type}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#5a7578' }}>{bay.cap}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0b3c42' }}>{bay.detail}</span>
                    </div>
                  </div>
                  {bay.cta && (
                    <a
                      href="#waitlist"
                      className="w-full text-center py-2 rounded-full transition-all"
                      style={{
                        background: '#dde8ea',
                        boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff',
                        fontSize: '11px', fontWeight: 700, color: '#0b3c42', textDecoration: 'none',
                      }}
                    >
                      {bay.cta}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
