import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { label: 'How It Works', href: '#how' },
    { label: 'Pricing',      href: '#pricing' },
    { label: 'FAQ',          href: '#faq' },
    { label: 'Contact',      href: '#contact' },
  ]

  return (
    <header className="fixed top-0 left-0 w-full z-50" style={{ background: '#dde8ea' }}>
      <div
        className="w-full max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 rounded-br-3xl"
        style={{ boxShadow: '0 4px 16px #b8c6c9, 0 -1px 0 #ffffff' }}
      >
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: '#dde8ea', boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff' }}
          >
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center"
              style={{ background: '#fd8451', boxShadow: '2px 2px 6px rgba(253,132,81,0.5), -1px -1px 4px rgba(255,255,255,0.4)' }}
            >
              <span className="material-symbols-outlined text-white text-[15px] sm:text-[16px]">local_laundry_service</span>
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: '#0b3c42' }}>kilowash</span>
            <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em', color: '#5a7578', textTransform: 'uppercase' }} className="hidden sm:block">Automated Laundry Network</span>
          </div>
        </a>

        {/* Desktop nav — inset pill */}
        <nav
          className="hidden xl:flex items-center gap-1 px-2 py-2 rounded-full"
          style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff' }}
        >
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-1.5 rounded-full transition-all"
              style={{
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.01em', color: '#5a7578',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#0b3c42'
                el.style.background = '#dde8ea'
                el.style.boxShadow = '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#5a7578'
                el.style.background = 'transparent'
                el.style.boxShadow = 'none'
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sign in — inset */}
          <a
            href="#waitlist"
            className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full transition-all"
            style={{
              background: '#dde8ea',
              boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.01em', color: '#5a7578',
              textDecoration: 'none',
            }}
          >
            Sign In
          </a>

          {/* CTA — raised tang */}
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 rounded-full transition-all"
            style={{
              background: '#fd8451',
              boxShadow: '4px 4px 10px rgba(253,132,81,0.45), -2px -2px 8px rgba(255,255,255,0.5)',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.01em', color: 'white',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="material-symbols-outlined text-[14px]">calendar_clock</span>
            <span className="hidden sm:inline">Get Early Access</span>
            <span className="hidden min-[400px]:inline sm:hidden">Early Access</span>
            <span className="min-[400px]:hidden">Access</span>
          </a>

          {/* Mobile burger — raised */}
          <button
            className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex flex-col items-center justify-center gap-1.5 shrink-0"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span className="block w-4 h-0.5 rounded-full transition-all duration-300" style={{ background: '#0b3c42', transform: open ? 'rotate(45deg) translateY(6px)' : 'none' }} />
            <span className="block w-4 h-0.5 rounded-full transition-all duration-300" style={{ background: '#0b3c42', opacity: open ? 0 : 1 }} />
            <span className="block w-4 h-0.5 rounded-full transition-all duration-300" style={{ background: '#0b3c42', transform: open ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile menu — inset panel */}
      {open && (
        <div
          className="xl:hidden mx-3 sm:mx-6 mb-3 p-4 flex flex-col gap-1 rounded-2xl"
          style={{ background: '#dde8ea', boxShadow: 'inset 4px 4px 10px #b8c6c9, inset -4px -4px 10px #ffffff' }}
        >
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl transition-all"
              style={{ fontSize: '13px', fontWeight: 600, color: '#5a7578', textDecoration: 'none' }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#waitlist"
            onClick={() => setOpen(false)}
            className="mt-2 px-4 py-2.5 rounded-full text-center"
            style={{
              background: '#fd8451',
              boxShadow: '3px 3px 8px rgba(253,132,81,0.4), -2px -2px 6px rgba(255,255,255,0.5)',
              fontSize: '13px', fontWeight: 700, color: 'white', textDecoration: 'none',
            }}
          >
            Get Early Access
          </a>
        </div>
      )}
    </header>
  )
}
