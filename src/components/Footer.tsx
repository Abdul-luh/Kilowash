export default function Footer() {
  const links = ['How It Works', 'Pricing', 'FAQ', 'Contact']
  const legal  = ['Privacy Policy', 'Terms of Use', 'Refund Policy']

  return (
    <footer className="w-full relative overflow-hidden" style={{ background: '#dde8ea', boxShadow: 'inset 0 6px 16px #b8c6c9' }}>

      {/* Neumorphic inset depth shapes */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>

        {/* Inset circle — top right (mirrors Waitlist) */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: '#dde8ea', boxShadow: 'inset 8px 8px 20px #b8c6c9, inset -8px -8px 20px #ffffff', opacity: 0.5 }} />

        {/* Inset circle — bottom left, large */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full"
          style={{ background: '#dde8ea', boxShadow: 'inset 10px 10px 24px #b0bec0, inset -10px -10px 24px #ffffff', opacity: 0.4 }} />

        {/* Inset triangle — top left */}
        <svg width="180" height="160" viewBox="0 0 180 160" className="absolute -top-4 left-32 opacity-40">
          <polygon points="90,8 174,152 6,152"
            fill="#dde8ea"
            style={{ filter: 'url(#neo-inset)' }}/>
          <defs>
            <filter id="neo-inset" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="5" dy="5" stdDeviation="6" floodColor="#b0bec0" floodOpacity="0.8"/>
              <feDropShadow dx="-4" dy="-4" stdDeviation="5" floodColor="#ffffff" floodOpacity="0.9"/>
            </filter>
          </defs>
        </svg>

        {/* Inset blob — mid right */}
        <svg width="200" height="200" viewBox="0 0 200 200" className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-35">
          <path d="M100 20 C138 14 172 44 178 82 C186 124 162 166 124 178 C86 190 44 170 26 134 C8 98 18 52 52 32 C66 24 82 22 100 20Z"
            fill="#dde8ea"
            style={{ filter: 'url(#neo-blob)' }}/>
          <defs>
            <filter id="neo-blob" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="6" dy="6" stdDeviation="7" floodColor="#b0bec0" floodOpacity="0.8"/>
              <feDropShadow dx="-5" dy="-5" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.9"/>
            </filter>
          </defs>
        </svg>

        {/* Inset small circle — bottom center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full"
          style={{ background: '#dde8ea', boxShadow: 'inset 5px 5px 12px #b8c6c9, inset -5px -5px 12px #ffffff', opacity: 0.45 }} />

        {/* Inset squircle — top center */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-40"
          style={{ background: '#dde8ea', borderRadius: '40%', boxShadow: 'inset 7px 7px 16px #b0bec0, inset -7px -7px 16px #ffffff', opacity: 0.35 }} />

      </div>

      <div className="max-w-[1280px] mx-auto px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: '#dde8ea', boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff' }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: '#fd8451', boxShadow: '2px 2px 6px rgba(253,132,81,0.5)' }}
                >
                  <span className="material-symbols-outlined text-white text-[16px]">local_laundry_service</span>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: '#0b3c42' }}>kilowash</span>
                <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: '#8aa8ab', textTransform: 'uppercase' }}>IoT Laundry Network</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#8aa8ab', maxWidth: '280px' }}>
              Solar-powered automated campus laundry. Book online, unlock in seconds, no light issues.
            </p>
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full transition-all"
              style={{ background: '#fd8451', boxShadow: '4px 4px 10px rgba(253,132,81,0.4), -2px -2px 6px rgba(255,255,255,0.5)', textDecoration: 'none' }}
            >
              <span className="material-symbols-outlined text-white text-[15px]">sensors</span>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: 'white', textTransform: 'uppercase' }}>Join the Waitlist</span>
            </a>
          </div>

          {/* Platform links */}
          <div className="flex flex-col gap-3">
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8aa8ab', marginBottom: '4px' }}>Platform</div>
            {links.map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, '')}`}
                className="transition-all"
                style={{ fontSize: '13px', fontWeight: 500, color: '#5a7578', textDecoration: 'none' }}
              >
                {l}
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-3">
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8aa8ab', marginBottom: '4px' }}>Legal</div>
            {legal.map(l => (
              <a
                key={l}
                href="#"
                className="transition-all"
                style={{ fontSize: '13px', fontWeight: 500, color: '#5a7578', textDecoration: 'none' }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(184,198,201,0.5)' }}
        >
          <p style={{ fontSize: '12px', color: '#8aa8ab' }}>© 2025 Kilowash. Smart Campus Laundry IoT Network. All rights reserved.</p>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#8aa8ab', textTransform: 'uppercase' }}>
            Active Protocol: Node-LASU-01
          </span>
        </div>
      </div>
    </footer>
  )
}
