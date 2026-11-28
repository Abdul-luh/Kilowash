import { useState, useRef, useEffect, useMemo } from 'react'
import { NIGERIAN_INSTITUTIONS } from '../data/institutions'
import {
  INITIAL_VERIFIED_COUNT,
  REFERRAL_GOAL,
  TARGET_SIGNUPS,
  getWaitlistStats,
  submitWaitlistSignup,
} from '../lib/waitlistApi'

const STORAGE_KEY = 'kilowash_waitlist_v4'

interface SavedWaitlistState {
  email: string
  school: string
  referralCode: string
  lastKnownCount: number
  myReferrals: number
}

function formatPct(value: number): string {
  const rounded = Number(value.toFixed(1))
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [customSchool, setCustomSchool] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const [liveCount, setLiveCount] = useState<number>(INITIAL_VERIFIED_COUNT)
  const [myReferrals, setMyReferrals] = useState<number>(0)
  const [alreadyRegistered, setAlreadyRegistered] = useState<boolean>(false)
  const [savedUser, setSavedUser] = useState<SavedWaitlistState | null>(null)
  const [referredBy, setReferredBy] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [animatedPct, setAnimatedPct] = useState<number>(0)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')?.trim().toLowerCase() || null
    if (ref && /^[a-z0-9]{4,16}$/.test(ref)) {
      setReferredBy(ref)
    }

    let restoredUser: SavedWaitlistState | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedWaitlistState
        if (parsed?.email && parsed?.referralCode) {
          restoredUser = parsed
          setSavedUser(parsed)
          setLiveCount(Math.max(INITIAL_VERIFIED_COUNT, parsed.lastKnownCount || 0))
          setMyReferrals(parsed.myReferrals || 0)
          setStatus('done')
        }
      }
    } catch {
      // Ignore storage errors
    }

    getWaitlistStats(restoredUser?.referralCode)
      .then(stats => {
        if (!stats) return
        setLiveCount(stats.count)
        if (restoredUser) {
          setMyReferrals(stats.myReferrals)
          const updated: SavedWaitlistState = {
            ...restoredUser,
            referralCode: stats.referralCode || restoredUser.referralCode,
            lastKnownCount: stats.count,
            myReferrals: stats.myReferrals,
          }
          setSavedUser(updated)
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          } catch {
            // Ignore storage errors
          }
        }
      })
      .catch(() => {})
  }, [])

  const launchPercentage = Math.min(100, (liveCount / TARGET_SIGNUPS) * 100)
  const rewardUnlocked = myReferrals >= REFERRAL_GOAL

  useEffect(() => {
    if (status !== 'done') {
      setAnimatedPct(0)
      return
    }

    let rafId: number
    const start = performance.now()
    const duration = 700

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedPct(launchPercentage * eased)
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [status, launchPercentage])

  const filteredInstitutions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return NIGERIAN_INSTITUTIONS.slice(0, 40)
    return NIGERIAN_INSTITUTIONS.filter(inst => inst.toLowerCase().includes(q))
  }, [searchQuery])

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

  function persistSuccess(
    cleanEmail: string,
    finalSchool: string,
    totalCount: number,
    referralCode: string,
    referralCount: number,
    wasAlreadyRegistered = false
  ) {
    const entry: SavedWaitlistState = {
      email: cleanEmail,
      school: finalSchool,
      referralCode,
      lastKnownCount: totalCount,
      myReferrals: referralCount,
    }

    setLiveCount(totalCount)
    setMyReferrals(referralCount)
    setAlreadyRegistered(wasAlreadyRegistered)
    setSavedUser(entry)
    setStatus('done')

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
    } catch {
      // Ignore storage errors
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalSchool =
      selectedSchool === 'Other'
        ? customSchool.trim()
        : selectedSchool || searchQuery.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !finalSchool) return
    setStatus('loading')

    try {
      const result = await submitWaitlistSignup({
        email: cleanEmail,
        school: finalSchool,
        referredBy,
        fallbackCurrentCount: liveCount,
      })
      persistSuccess(
        cleanEmail,
        finalSchool,
        result.count,
        result.referralCode,
        result.myReferrals,
        Boolean(result.alreadyRegistered)
      )
    } catch {
      setStatus('error')
    }
  }

  const shareOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://kilowash.ng'
  const referralUrl = savedUser
    ? `${shareOrigin}/?ref=${savedUser.referralCode}#waitlist`
    : `${shareOrigin}/#waitlist`

  const campusLabel = savedUser?.school || 'campus'
  const pctLabel = formatPct(launchPercentage)
  const shareMessage = `I just joined the Kilowash waitlist to bring solar-powered 30-min laundry machines to ${campusLabel}. We're at ${pctLabel}% (${liveCount.toLocaleString()}/1,000) of the signups needed to launch — join with my link: ${referralUrl}`

  function handleCopyLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  function handleWhatsAppShare() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <section
      id="waitlist"
      className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-8"
      style={{
        background: '#dde8ea',
        boxShadow: 'inset 0 6px 16px #b8c6c9, inset 0 -6px 16px #ffffff',
      }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Outer raised container */}
        <div
          className="rounded-3xl p-5 sm:p-8 md:p-12 lg:p-14 relative overflow-hidden"
          style={{
            background: '#dde8ea',
            boxShadow: '12px 12px 28px #b0bec0, -12px -12px 28px #ffffff',
          }}
        >
          {/* Decorative inset circle top-right */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: '#dde8ea',
              boxShadow: 'inset 8px 8px 20px #b8c6c9, inset -8px -8px 20px #ffffff',
              opacity: 0.5,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left copy */}
            <div className="flex flex-col gap-6">
              <div
                className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: '#fd8451',
                  textTransform: 'uppercase',
                }}
              >
                <span className="material-symbols-outlined text-[14px]">sensors</span>
                Launching Soon
              </div>

              <h2
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.03em',
                  color: '#0b3c42',
                }}
              >
                Be first in line when we go live at your campus.
              </h2>

              <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#5a7578' }}>
                Drop your email and campus. We will notify you the moment Kilowash machines go
                live at your hostel — and you will get priority slot access for the first week.
              </p>

              {/* Stats — inset trays in responsive 3-column grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
                {[
                  { num: 'All', label: 'Campuses eligible' },
                  { num: '₦1,500', label: 'Per 30-min cycle' },
                  { num: '0', label: 'Queues. Ever.' },
                ].map(s => (
                  <div
                    key={s.label}
                    className="flex flex-col px-2.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl min-w-0"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                        letterSpacing: '-0.03em',
                        color: '#fd8451',
                        lineHeight: 1.1,
                      }}
                    >
                      {s.num}
                    </span>
                    <span className="text-[10px] sm:text-[11px] leading-tight mt-1 text-[#8aa8ab] break-words">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel — inset */}
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 5px 5px 14px #b8c6c9, inset -5px -5px 14px #ffffff',
              }}
            >
              {status === 'done' ? (
                <div
                  className="text-center py-4 sm:py-5 flex flex-col items-center gap-5"
                  style={{ animation: 'slideUp 0.45s cubic-bezier(.22,1,.36,1) both' }}
                >
                  {/* Verified Icon + Heading */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: '#dde8ea',
                        boxShadow: '5px 5px 12px #b8c6c9, -5px -5px 12px #ffffff',
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[28px]"
                        style={{ color: '#fd8451' }}
                      >
                        verified
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#0b3c42' }}>
                        {alreadyRegistered ? "You're already on the list." : 'You are in.'}
                      </h3>
                      <p
                        className="max-w-sm mx-auto mt-1.5"
                        style={{ fontSize: '13px', color: '#5a7578', lineHeight: 1.65 }}
                      >
                        We launch at{' '}
                        <strong style={{ color: '#0b3c42' }}>1,000 signups</strong>. Invite{' '}
                        <strong style={{ color: '#0b3c42' }}>3 friends</strong> with your link
                        to unlock <strong style={{ color: '#0b3c42' }}>1 free wash</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Launch Meter + Compact 3-Step Referral Row */}
                  <div className="w-full max-w-sm flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between px-1">
                        <span
                          className="tabular-nums"
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            color: '#0b3c42',
                            letterSpacing: '-0.03em',
                            lineHeight: 1,
                          }}
                        >
                          {formatPct(animatedPct)}%{' '}
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#5a7578',
                              letterSpacing: '0',
                            }}
                          >
                            to launch
                          </span>
                        </span>
                        <span
                          className="tabular-nums"
                          style={{ fontSize: '12px', fontWeight: 700, color: '#8aa8ab' }}
                        >
                          {liveCount.toLocaleString()} / {TARGET_SIGNUPS.toLocaleString()}
                        </span>
                      </div>

                      <div
                        className="w-full h-3.5 rounded-full p-0.5 overflow-hidden"
                        style={{
                          background: '#dde8ea',
                          boxShadow: 'inset 3px 3px 6px #b8c6c9, inset -3px -3px 6px #ffffff',
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${liveCount > 0 ? Math.max(2.5, animatedPct) : 0}%`,
                            background: '#fd8451',
                          }}
                        />
                      </div>
                    </div>

                    {/* Minimal 1-Line Referral Progress Indicator */}
                    <div
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                      style={{
                        background: '#dde8ea',
                        boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map(idx => {
                            const filled = idx < myReferrals
                            return (
                              <span
                                key={idx}
                                className="w-2 h-2 rounded-full transition-colors"
                                style={{
                                  background: filled
                                    ? rewardUnlocked
                                      ? '#0E8A5E'
                                      : '#fd8451'
                                    : '#b8c6c9',
                                }}
                              />
                            )
                          })}
                        </div>
                        <span
                          className="tabular-nums"
                          style={{ fontSize: '12px', fontWeight: 700, color: '#0b3c42' }}
                        >
                          {Math.min(myReferrals, REFERRAL_GOAL)} / {REFERRAL_GOAL} friends joined
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: rewardUnlocked ? '#0E8A5E' : '#fd8451',
                        }}
                      >
                        {rewardUnlocked ? 'Free wash unlocked!' : '1 free wash'}
                      </span>
                    </div>
                  </div>

                  {/* Two Clean Share Pills */}
                  <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="flex-1 py-3.5 px-5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        background: '#fd8451',
                        boxShadow:
                          '5px 5px 12px rgba(253,132,81,0.42), -3px -3px 8px rgba(255,255,255,0.55)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      <span className="material-symbols-outlined text-[17px]">share</span>
                      <span>Share on WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="sm:w-auto py-3.5 px-5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        background: '#dde8ea',
                        boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#0b3c42',
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[17px]"
                        style={{ color: copiedLink ? '#0E8A5E' : '#fd8451' }}
                      >
                        {copiedLink ? 'check' : 'link'}
                      </span>
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  {import.meta.env.DEV && (
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="text-[11px] font-medium text-[#8aa8ab] hover:text-[#0b3c42] transition-colors"
                    >
                      Back to form
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {status === 'error' && (
                    <div
                      className="px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(253,132,81,0.12)',
                        fontSize: '12px',
                        color: '#fd8451',
                        fontWeight: 600,
                      }}
                    >
                      Something went wrong. Please try again.
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: '#fd8451',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                      }}
                    >
                      {referredBy ? 'Invited by a Friend · Early Access' : 'Early Access Waitlist'}
                    </div>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: '#0b3c42',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Join Kilowash Campus Network
                    </h3>
                  </div>

                  {/* Email input — inset */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#8aa8ab',
                      }}
                    >
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <span
                        className="material-symbols-outlined absolute left-3 text-[18px]"
                        style={{ color: '#8aa8ab' }}
                      >
                        alternate_email
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                        style={{
                          background: '#dde8ea',
                          boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                          fontSize: '13px',
                          color: '#0b3c42',
                          border: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Searchable Institution Field */}
                  <div className="flex flex-col gap-1.5" ref={dropdownRef}>
                    <div className="flex items-center justify-between">
                      <label
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: '#8aa8ab',
                        }}
                      >
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
                        <span
                          className="material-symbols-outlined absolute left-3 text-[18px]"
                          style={{ color: '#8aa8ab' }}
                        >
                          school
                        </span>
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
                            boxShadow:
                              'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
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
                          {searchQuery.trim() &&
                            !filteredInstitutions.some(
                              i => i.toLowerCase() === searchQuery.trim().toLowerCase()
                            ) && (
                              <button
                                type="button"
                                onClick={() => handleSelectSchool(searchQuery.trim())}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-between transition-colors"
                                style={{
                                  background: 'rgba(253, 132, 81, 0.12)',
                                  color: '#fd8451',
                                }}
                              >
                                <span>Use &quot;{searchQuery.trim()}&quot;</span>
                                <span className="material-symbols-outlined text-[16px]">
                                  add
                                </span>
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
                                background:
                                  selectedSchool === inst
                                    ? 'rgba(253, 132, 81, 0.1)'
                                    : 'transparent',
                              }}
                              onMouseEnter={e =>
                                (e.currentTarget.style.background = 'rgba(11, 60, 66, 0.06)')
                              }
                              onMouseLeave={e =>
                                (e.currentTarget.style.background =
                                  selectedSchool === inst
                                    ? 'rgba(253, 132, 81, 0.1)'
                                    : 'transparent')
                              }
                            >
                              <span className="truncate">{inst}</span>
                              {selectedSchool === inst && (
                                <span className="material-symbols-outlined text-[16px]">
                                  check
                                </span>
                              )}
                            </button>
                          ))}

                          {filteredInstitutions.length === 0 && (
                            <div className="px-3 py-2 text-[12px] text-[#8aa8ab] text-center">
                              No matching campus found.
                            </div>
                          )}

                          <div className="pt-1 border-t border-[#b8c6c9]/30 mt-1">
                            <button
                              type="button"
                              onClick={handleSelectOther}
                              className="w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium text-[#5a7578] hover:text-[#0b3c42] flex items-center gap-2"
                              onMouseEnter={e =>
                                (e.currentTarget.style.background = 'rgba(11, 60, 66, 0.06)')
                              }
                              onMouseLeave={e =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              <span className="material-symbols-outlined text-[16px] text-[#8aa8ab]">
                                edit
                              </span>
                              <span>Other / My school isn&apos;t listed</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedSchool === 'Other' && (
                    <div className="flex flex-col gap-1.5 animate-fadeIn">
                      <label
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: '#fd8451',
                        }}
                      >
                        Enter Your School Name
                      </label>
                      <div className="relative flex items-center">
                        <span
                          className="material-symbols-outlined absolute left-3 text-[18px]"
                          style={{ color: '#fd8451' }}
                        >
                          edit_note
                        </span>
                        <input
                          type="text"
                          required
                          value={customSchool}
                          onChange={e => setCustomSchool(e.target.value)}
                          placeholder="e.g. Anchor University, Lagos"
                          className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: '#dde8ea',
                            boxShadow:
                              'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
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
                    style={{
                      background: '#fd8451',
                      boxShadow:
                        '5px 5px 12px rgba(253,132,81,0.45), -3px -3px 8px rgba(255,255,255,0.5)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'white',
                      border: 'none',
                      cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                      opacity: status === 'loading' ? 0.7 : 1,
                    }}
                  >
                    <span>
                      {status === 'loading' ? 'Submitting…' : 'Secure My Early Access'}
                    </span>
                    {status !== 'loading' && (
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    )}
                  </button>

                  <p style={{ fontSize: '11px', color: '#8aa8ab', textAlign: 'center' }}>
                    No spam. Just a single notification when your campus goes live.
                  </p>

                  {import.meta.env.DEV && (
                    <button
                      type="button"
                      onClick={() =>
                        persistSuccess(
                          'lagbaj@gmail.com',
                          'Lagos State University (LASU)',
                          liveCount,
                          'lagbaj130',
                          1
                        )
                      }
                      className="self-center text-[10px] font-medium text-[#8aa8ab] hover:text-[#fd8451] transition-colors -mt-2"
                    >
                      Preview post-signup ({liveCount} / 1,000)
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
