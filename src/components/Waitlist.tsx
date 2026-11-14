import { useState, useRef, useEffect, useMemo } from 'react'
import { NIGERIAN_INSTITUTIONS } from '../data/institutions'

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [customSchool, setCustomSchool] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter institutions based on input search query
  const filteredInstitutions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return NIGERIAN_INSTITUTIONS.slice(0, 40)
    return NIGERIAN_INSTITUTIONS.filter(inst => inst.toLowerCase().includes(q))
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelectSchool(schoolName: string) {
    setSelectedSchool(schoolName)
    setSearchQuery(schoolName)
    setCustomSchool('')
    setIsOpen(false)
  }

  function handleSelectOther() {
    setSelectedSchool('Other')
    setSearchQuery('Other')
    setIsOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalSchool = selectedSchool === 'Other' 
      ? customSchool.trim() 
      : (selectedSchool || searchQuery.trim())

    if (!email || !finalSchool) return
    setStatus('loading')
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, email, school: finalSchool }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="waitlist" className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-8" style={{ background: '#dde8ea', boxShadow: 'inset 0 6px 16px #b8c6c9, inset 0 -6px 16px #ffffff' }}>
      <div className="max-w-[1280px] mx-auto">

        {/* Outer raised container */}
        <div
          className="rounded-3xl p-5 sm:p-8 md:p-12 lg:p-14 relative overflow-hidden"
          style={{ background: '#dde8ea', boxShadow: '12px 12px 28px #b0bec0, -12px -12px 28px #ffffff' }}
        >
          {/* Decorative inset circle top-right */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: '#dde8ea', boxShadow: 'inset 8px 8px 20px #b8c6c9, inset -8px -8px 20px #ffffff', opacity: 0.5 }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">

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
                Drop your email and campus. We will notify you the moment Kilowash machines go live at your hostel — and you will get priority slot access for the first week.
              </p>

              {/* Stats — inset trays in responsive 3-column grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
                {[
                  { num: 'All',    label: 'Campuses eligible' },
                  { num: '₦1,500', label: 'Per 30-min cycle' },
                  { num: '0',      label: 'Queues. Ever.' },
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex flex-col px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl min-w-0"
                    style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff' }}
                  >
                    <span style={{ fontWeight: 800, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', letterSpacing: '-0.03em', color: '#fd8451', lineHeight: 1.1 }}>{s.num}</span>
                    <span className="text-[10px] sm:text-[11px] leading-tight mt-1 text-[#8aa8ab] break-words">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form — inset panel */}
            <div
              className="rounded-2xl p-5 sm:p-8"
              style={{ background: '#dde8ea', boxShadow: 'inset 5px 5px 14px #b8c6c9, inset -5px -5px 14px #ffffff' }}
            >
              {status === 'done' ? (
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
                  {status === 'error' && (
                    <div className="px-4 py-3 rounded-xl" style={{ background: 'rgba(253,132,81,0.12)', fontSize: '12px', color: '#fd8451', fontWeight: 600 }}>
                      Something went wrong. Please try again.
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '4px' }}>Early Access Waitlist</div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0b3c42', letterSpacing: '-0.02em' }}>Join Kilowash Campus Network</h3>
                  </div>

                  {/* Email input — inset */}
                  <div className="flex flex-col gap-1.5">
                    <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>Email Address</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: '#8aa8ab' }}>alternate_email</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                        style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff', fontSize: '13px', color: '#0b3c42', border: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Searchable Institution Field */}
                  <div className="flex flex-col gap-1.5" ref={dropdownRef}>
                    <div className="flex items-center justify-between">
                      <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#8aa8ab' }}>
                        Your Campus / Institution
                      </label>
                      {selectedSchool && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchool('')
                            setSearchQuery('')
                            setCustomSchool('')
                          }}
                          className="text-[10px] text-[#fd8451] hover:underline font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: '#8aa8ab' }}>school</span>
                        <input
                          type="text"
                          required
                          value={searchQuery}
                          onChange={e => {
                            setSearchQuery(e.target.value)
                            setSelectedSchool('')
                            setIsOpen(true)
                          }}
                          onFocus={() => setIsOpen(true)}
                          placeholder="Type or search any Nigerian institution…"
                          className="w-full pl-10 pr-9 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: '#dde8ea',
                            boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                            fontSize: '13px',
                            color: '#0b3c42',
                            border: 'none',
                          }}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setIsOpen(!isOpen)}
                          className="material-symbols-outlined absolute right-3 text-[18px] text-[#8aa8ab] hover:text-[#0b3c42] cursor-pointer"
                        >
                          {isOpen ? 'expand_less' : 'expand_more'}
                        </button>
                      </div>

                      {/* Dropdown Options */}
                      {isOpen && (
                        <div
                          className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl p-2 flex flex-col gap-1"
                          style={{
                            background: '#dde8ea',
                            boxShadow: '8px 8px 20px #b0bec0, -8px -8px 20px #ffffff',
                            border: '1px solid rgba(184, 198, 201, 0.4)',
                          }}
                        >
                          {/* Option to type custom if query doesn't match */}
                          {searchQuery.trim() && !filteredInstitutions.some(i => i.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                            <button
                              type="button"
                              onClick={() => handleSelectSchool(searchQuery.trim())}
                              className="w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-between transition-colors"
                              style={{ background: 'rgba(253, 132, 81, 0.12)', color: '#fd8451' }}
                            >
                              <span>Use "{searchQuery.trim()}"</span>
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          )}

                          {filteredInstitutions.map(inst => (
                            <button
                              key={inst}
                              type="button"
                              onClick={() => handleSelectSchool(inst)}
                              className="w-full text-left px-3 py-2 rounded-xl text-[12px] transition-colors flex items-center justify-between"
                              style={{
                                color: selectedSchool === inst ? '#fd8451' : '#0b3c42',
                                fontWeight: selectedSchool === inst ? 700 : 500,
                                background: selectedSchool === inst ? 'rgba(253, 132, 81, 0.1)' : 'transparent',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11, 60, 66, 0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.background = selectedSchool === inst ? 'rgba(253, 132, 81, 0.1)' : 'transparent')}
                            >
                              <span className="truncate">{inst}</span>
                              {selectedSchool === inst && (
                                <span className="material-symbols-outlined text-[16px]">check</span>
                              )}
                            </button>
                          ))}

                          {filteredInstitutions.length === 0 && (
                            <div className="px-3 py-2 text-[12px] text-[#8aa8ab] text-center">
                              No matching campus found.
                            </div>
                          )}

                          {/* Explicit "Other / My School is not listed" option */}
                          <div className="pt-1 border-t border-[#b8c6c9]/30 mt-1">
                            <button
                              type="button"
                              onClick={handleSelectOther}
                              className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium text-[#5a7578] hover:text-[#0b3c42] flex items-center gap-2"
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(11, 60, 66, 0.06)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <span className="material-symbols-outlined text-[16px] text-[#8aa8ab]">edit</span>
                              <span>Other / My school isn't listed</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fallback custom input when 'Other' is explicitly selected */}
                  {selectedSchool === 'Other' && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fd8451' }}>
                        Enter Your School Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: '#fd8451' }}>edit_note</span>
                        <input
                          type="text"
                          required
                          value={customSchool}
                          onChange={e => setCustomSchool(e.target.value)}
                          placeholder="e.g. Anchor University, Lagos"
                          className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: '#dde8ea',
                            boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                            fontSize: '13px',
                            color: '#0b3c42',
                            border: '1px solid rgba(253, 132, 81, 0.3)',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit — raised tang */}
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 rounded-full flex items-center justify-center gap-2 transition-all group"
                    style={{ background: '#fd8451', boxShadow: '5px 5px 12px rgba(253,132,81,0.45), -3px -3px 8px rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, color: 'white', border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}
                  >
                    <span>{status === 'loading' ? 'Submitting…' : 'Secure My Early Access'}</span>
                    {status !== 'loading' && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
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
