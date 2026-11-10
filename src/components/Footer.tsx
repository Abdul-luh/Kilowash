export default function Footer() {
  const links = ['How It Works', 'Pricing', 'FAQ', 'Contact']
  const legal  = ['Privacy Policy', 'Terms of Use', 'Refund Policy']

  return (
    <footer className="w-full" style={{ background: '#dde8ea', boxShadow: 'inset 0 6px 16px #b8c6c9' }}>
      <div className="max-w-[1280px] mx-auto px-8 py-16">
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
            {/* Status pill — inset */}
            <div
              className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full"
              style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff' }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 5px #10b981' }}></span>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#5a7578', textTransform: 'uppercase' }}>System Operational</span>
            </div>
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

        {/* Bottom bar — inset divider */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(184,198,201,0.5)' }}
        >
          <p style={{ fontSize: '12px', color: '#8aa8ab' }}>© 2025 Kilowash. Smart Campus Laundry IoT Network. All rights reserved.</p>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#8aa8ab', textTransform: 'uppercase' }}>
            Active Protocol: Node-FUTO-01
          </span>
        </div>
      </div>
    </footer>
  )
}
