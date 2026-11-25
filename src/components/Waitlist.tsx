import { useState, useRef, useEffect, useMemo } from 'react'
import { NIGERIAN_INSTITUTIONS } from '../data/institutions'

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string

const TARGET_SIGNUPS = 1000
const BASE_SIGNUPS = 199 // Next signup hits 200 / 1,000 (20.0%)
const STORAGE_KEY = 'kilowash_waitlist_v1'

interface SavedWaitlistState {
  email: string
  school: string
  referralCode: string
  signupNumber: number
}

function generateReferralCode(emailStr: string): string {
  const prefix =
    emailStr
      .split('@')[0]
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .slice(0, 8) || 'student'
  let hash = 0
  for (let i = 0; i < emailStr.length; i++) {
    hash = (hash * 31 + emailStr.charCodeAt(i)) % 900
  }
  const digits = String((Math.abs(hash) % 900) + 100)
  return `${prefix}${digits}`
}

export default function Waitlist() {
  const [email, setEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [customSchool, setCustomSchool] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  // Launch meter & referral states
  const [extraSignups, setExtraSignups] = useState<number>(0)
  const [savedUser, setSavedUser] = useState<SavedWaitlistState | null>(null)
  const [referredBy, setReferredBy] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [animatedPct, setAnimatedPct] = useState<number>(0)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Hydrate referral param & any existing signup from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferredBy(ref)
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SavedWaitlistState & { extraCount?: number }
        if (parsed?.email && parsed?.referralCode) {
          setSavedUser(parsed)
          setExtraSignups(parsed.extraCount ?? 1)
          setStatus('done')
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  const currentSignups = BASE_SIGNUPS + extraSignups
  const launchPercentage = Math.min(100, Number(((currentSignups / TARGET_SIGNUPS) * 100).toFixed(1)))
  const remainingSignups = Math.max(0, TARGET_SIGNUPS - currentSignups)

  // Smoothly animate gauge when entering 'done' state
  useEffect(() => {
    if (status !== 'done') {
      setAnimatedPct(0)
      return
    }

    let rafId: number
    const start = performance.now()
    const duration = 850
    const target = launchPercentage

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / duration)
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedPct(Number((target * eased).toFixed(1)))
      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [status, launchPercentage])

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

  function completeSignup(cleanEmail: string, finalSchool: string) {
    const nextExtra = extraSignups + 1
    const signupNumber = BASE_SIGNUPS + nextExtra
    const referralCode = generateReferralCode(cleanEmail)
    const entry: SavedWaitlistState = {
      email: cleanEmail,
      school: finalSchool,
      referralCode,
      signupNumber,
    }

    setExtraSignups(nextExtra)
    setSavedUser(entry)
    setStatus('done')

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...entry, extraCount: nextExtra }))
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
    const cleanEmail = email.trim()

    if (!cleanEmail || !finalSchool) return
    setStatus('loading')

    const generatedCode = generateReferralCode(cleanEmail)

    // Fallback gracefully in local preview if no Web3Forms key is configured
    if (!WEB3FORMS_KEY) {
      await new Promise(resolve => setTimeout(resolve, 450))
      completeSignup(cleanEmail, finalSchool)
      return
    }

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          email: cleanEmail,
          school: finalSchool,
          referral_code: generatedCode,
          ...(referredBy ? { referred_by: referredBy } : {}),
        }),
      })
      if (res.ok) {
        completeSignup(cleanEmail, finalSchool)
      } else {
        setStatus('error')
      }
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
  const shareMessage = `No more hostel laundry stress — I just joined the Kilowash waitlist to bring solar-powered 30-min washes to ${campusLabel}! We're at ${launchPercentage}% of the ${TARGET_SIGNUPS.toLocaleString()} signups needed for them to launch. Add your name so we hit 100% faster: ${referralUrl}`

  function handleCopyLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2200)
    }
  }

  function handleWhatsAppShare() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleXShare() {
    const tweet = `Just joined the @kilowash waitlist to bring solar-powered 30-min laundry bays to ${campusLabel}! ⚡\n\nWe're at ${launchPercentage}% (${currentSignups}/${TARGET_SIGNUPS.toLocaleString()}) of the signups needed to launch. Help us hit 100%:`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(referralUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handleNativeShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Kilowash Campus Launch Waitlist',
          text: `We're at ${launchPercentage}% of the ${TARGET_SIGNUPS.toLocaleString()} signups needed to bring Kilowash solar laundry bays to ${campusLabel}. Join here:`,
          url: referralUrl,
        })
        return
      } catch {
        // User cancelled or share failed; fall back to copy
      }
    }
    handleCopyLink()
  }

  function handleResetForm() {
    setEmail('')
    setSearchQuery('')
    setSelectedSchool('')
    setCustomSchool('')
    setStatus('idle')
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
                Launching at {TARGET_SIGNUPS.toLocaleString()} Signups
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
                Drop your email and campus. Once we hit{' '}
                <strong style={{ color: '#0b3c42' }}>1,000 student signups</strong>, we deploy
                the first solar washing bays — and everyone on the waitlist gets priority slot
                access for launch week.
              </p>

              {/* Compact Pre-Signup Launch Progress Bar */}
              <div
                className="rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 4px 4px 10px #b8c6c9, inset -4px -4px 10px #ffffff',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        background: '#fd8451',
                        boxShadow: '0 0 8px rgba(253,132,81,0.7)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#0b3c42',
                      }}
                    >
                      Launch Likelihood
                    </span>
                  </div>
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#fd8451',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {launchPercentage.toFixed(1)}%
                  </span>
                </div>

                {/* Recessed progress bar */}
                <div
                  className="w-full h-3 rounded-full overflow-hidden p-0.5"
                  style={{
                    background: '#dde8ea',
                    boxShadow: 'inset 2px 2px 5px #b0bec0, inset -2px -2px 5px #ffffff',
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(4, launchPercentage)}%`,
                      background: 'linear-gradient(90deg, #0b3c42 0%, #fd8451 100%)',
                      boxShadow: '0 1px 4px rgba(253,132,81,0.45)',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-[#5a7578]">
                  <span>
                    <strong className="text-[#0b3c42] tabular-nums">
                      {currentSignups.toLocaleString()}
                    </strong>{' '}
                    / {TARGET_SIGNUPS.toLocaleString()} students joined
                  </span>
                  <span className="text-[#8aa8ab] tabular-nums">
                    {remainingSignups.toLocaleString()} left to launch
                  </span>
                </div>
              </div>

              {/* Stats — inset trays in responsive 3-column grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
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

            {/* Right form / Post-signup launch & share card — inset panel */}
            <div
              className="rounded-2xl p-5 sm:p-8"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 5px 5px 14px #b8c6c9, inset -5px -5px 14px #ffffff',
              }}
            >
              {status === 'done' ? (
                <div
                  className="flex flex-col gap-5"
                  style={{ animation: 'slideUp 0.45s cubic-bezier(.22,1,.36,1) both' }}
                >
                  {/* Top confirmation row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          background: '#dde8ea',
                          boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff',
                        }}
                      >
                        <span
                          className="material-symbols-outlined text-[26px]"
                          style={{ color: '#fd8451' }}
                        >
                          verified
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            style={{
                              fontWeight: 800,
                              fontSize: '1.2rem',
                              color: '#0b3c42',
                              letterSpacing: '-0.02em',
                            }}
                          >
                            You&apos;re in!
                          </h3>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider tabular-nums"
                            style={{
                              background: 'rgba(253, 132, 81, 0.14)',
                              color: '#fd8451',
                            }}
                          >
                            Spot #{savedUser?.signupNumber ?? currentSignups}
                          </span>
                        </div>
                        {savedUser?.school && (
                          <p className="text-xs font-semibold text-[#5a7578] truncate mt-0.5">
                            {savedUser.school}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hero Launch Likelihood Meter Card */}
                  <div
                    className="rounded-2xl p-4 sm:p-5 text-white flex flex-col gap-3.5"
                    style={{
                      background: '#0b3c42',
                      boxShadow:
                        'inset 3px 3px 8px rgba(0,0,0,0.45), inset -2px -2px 6px rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8aa8ab] block">
                          How Likely We Launch Now
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white tabular-nums">
                            {animatedPct.toFixed(1)}%
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold tracking-wide">
                            +0.1% from you
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8aa8ab] block">
                          Goal Target
                        </span>
                        <span className="text-sm font-extrabold text-[#fd8451] tabular-nums">
                          {currentSignups.toLocaleString()} / {TARGET_SIGNUPS.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar with Milestone Ticks */}
                    <div className="flex flex-col gap-1.5">
                      <div
                        className="w-full h-3.5 rounded-full overflow-hidden p-0.5 relative"
                        style={{
                          background: 'rgba(0, 0, 0, 0.35)',
                          boxShadow: 'inset 1px 2px 4px rgba(0,0,0,0.5)',
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(4, animatedPct)}%`,
                            background: 'linear-gradient(90deg, #fd8451 0%, #ffb599 100%)',
                            boxShadow: '0 0 10px rgba(253, 132, 81, 0.65)',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-[#8aa8ab] tabular-nums px-0.5">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span className="text-[#fd8451]">100% Launch</span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-[#cde0e3]">
                      We actually install the machines once we hit{' '}
                      <strong className="text-white">
                        {TARGET_SIGNUPS.toLocaleString()} signups
                      </strong>{' '}
                      ({remainingSignups.toLocaleString()} left). Share this with your hostel
                      mates so we go live faster!
                    </p>
                  </div>

                  {/* Personal Referral Link Copy Box */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#5a7578',
                        }}
                      >
                        Your Invite Link
                      </span>
                      <span className="text-[10px] font-bold text-[#fd8451]">
                        Each friend = +0.1% closer
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between gap-2 pl-3.5 pr-1.5 py-1.5 rounded-xl"
                      style={{
                        background: '#dde8ea',
                        boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                      }}
                    >
                      <span className="text-xs font-semibold text-[#0b3c42] truncate select-all min-w-0">
                        {referralUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                        style={{
                          background: copiedLink ? '#0b3c42' : '#dde8ea',
                          color: copiedLink ? '#ffffff' : '#0b3c42',
                          boxShadow: copiedLink
                            ? '2px 2px 6px rgba(11,60,66,0.35)'
                            : '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff',
                        }}
                      >
                        <span className="material-symbols-outlined text-[15px]">
                          {copiedLink ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Share Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleWhatsAppShare}
                      className="w-full py-3.5 px-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{
                        background: '#fd8451',
                        boxShadow:
                          '4px 4px 12px rgba(253,132,81,0.45), -2px -2px 6px rgba(255,255,255,0.55)',
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#ffffff',
                      }}
                    >
                      <span className="material-symbols-outlined text-[17px]">forum</span>
                      <span>Share on WhatsApp</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={handleXShare}
                        className="py-3.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        style={{
                          background: '#dde8ea',
                          boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff',
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#0b3c42',
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#0b3c42]">
                          tag
                        </span>
                        <span>Post on X</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="py-3.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        style={{
                          background: '#dde8ea',
                          boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff',
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#0b3c42',
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#fd8451]">
                          ios_share
                        </span>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Bonus Referral Perk Strip */}
                  <div
                    className="px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[18px] shrink-0"
                      style={{ color: '#fd8451' }}
                    >
                      redeem
                    </span>
                    <span className="text-[11px] font-semibold text-[#5a7578] leading-snug">
                      Invite <strong className="text-[#0b3c42]">3 hostel mates</strong> with
                      your link and get <strong className="text-[#0b3c42]">1 free wash</strong>{' '}
                      when your campus goes live.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="self-center text-[11px] font-semibold text-[#8aa8ab] hover:text-[#0b3c42] transition-colors"
                  >
                    Register another student email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {referredBy && (
                    <div
                      className="px-3.5 py-2.5 rounded-xl flex items-center gap-2"
                      style={{
                        background: 'rgba(253, 132, 81, 0.12)',
                        fontSize: '11px',
                        color: '#0b3c42',
                        fontWeight: 700,
                      }}
                    >
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ color: '#fd8451' }}
                      >
                        group_add
                      </span>
                      <span>
                        Invited by <strong>@{referredBy}</strong> — sign up to boost campus
                        launch progress!
                      </span>
                    </div>
                  )}

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
                      Early Access Waitlist
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
                          {/* Option to type custom if query doesn't match */}
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

                          {/* Explicit "Other / My School is not listed" option */}
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

                  {/* Fallback custom input when 'Other' is explicitly selected */}
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

                  <div className="flex flex-col items-center gap-1.5">
                    <p style={{ fontSize: '11px', color: '#8aa8ab', textAlign: 'center' }}>
                      No spam. Just a single notification when we hit 1,000 signups &amp; go live.
                    </p>
                    {savedUser ? (
                      <button
                        type="button"
                        onClick={() => setStatus('done')}
                        className="text-[11px] font-bold text-[#fd8451] hover:underline"
                      >
                        View your referral link &amp; launch progress →
                      </button>
                    ) : (
                      import.meta.env.DEV && (
                        <button
                          type="button"
                          onClick={() =>
                            completeSignup(
                              email.trim() || 'student@campus.edu.ng',
                              selectedSchool === 'Other'
                                ? customSchool.trim() || 'Lagos State University (LASU)'
                                : selectedSchool || searchQuery.trim() || 'Lagos State University (LASU)'
                            )
                          }
                          className="text-[10px] font-semibold text-[#8aa8ab] hover:text-[#fd8451] transition-colors"
                        >
                          [Dev Preview: See post-signup launch meter]
                        </button>
                      )
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
