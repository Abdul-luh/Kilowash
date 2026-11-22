import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  INITIAL_BAYS,
  MOCK_HISTORY,
  machineImg,
  type Bay,
  type BookingSlot,
  type ActiveCycle,
  type WashHistoryItem,
} from '../data/mockDashboard'
import SlotPickerModal from '../components/dashboard/SlotPickerModal'
import GuideModal from '../components/dashboard/GuideModal'

export default function Dashboard() {
  const [bays] = useState<Bay[]>(INITIAL_BAYS)
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false)

  // Current active navigation tab: 'bays' | 'pins' | 'guide'
  const [activeTab, setActiveTab] = useState<'bays' | 'pins' | 'guide'>('bays')

  // Active running wash simulation
  const [activeCycle, setActiveCycle] = useState<ActiveCycle | null>({
    bookingId: 'BK-9482',
    bayId: 'BAY-01',
    bayName: 'Bay Node 01',
    pin: '7394',
    remainingSeconds: 22 * 60 + 36, // 22 mins 36 secs
    totalSeconds: 35 * 60,
    stage: 'Rinse',
    washType: '35-Min Cold Inverter Wash',
    powerSource: '100% Inverter Solar',
  })

  // Wash history
  const [history, setHistory] = useState<WashHistoryItem[]>(MOCK_HISTORY)

  // Copy feedback state
  const [copiedPin, setCopiedPin] = useState(false)
  const [showPinHelp, setShowPinHelp] = useState(false)

  // Active countdown timer effect
  useEffect(() => {
    if (!activeCycle || activeCycle.remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setActiveCycle(prev => {
        if (!prev) return null
        if (prev.remainingSeconds <= 1) {
          return {
            ...prev,
            remainingSeconds: 0,
            stage: 'Buffer / Unload',
          }
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCycle])

  function formatTime(totalSec: number) {
    const mins = Math.floor(totalSec / 60)
    const secs = totalSec % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  function handleCopyPin(pinToCopy: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pinToCopy)
    }
    setCopiedPin(true)
    setTimeout(() => setCopiedPin(false), 2000)
  }

  function handleOpenSlotPicker(bay: Bay) {
    setSelectedBay(bay)
    setIsSlotModalOpen(true)
  }

  function handleConfirmBooking(slot: BookingSlot, addDetergent: boolean) {
    if (!selectedBay) return

    const randomPin = String(Math.floor(1000 + Math.random() * 9000))
    const newBookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`

    // Set new active cycle
    setActiveCycle({
      bookingId: newBookingId,
      bayId: selectedBay.id,
      bayName: selectedBay.name,
      pin: randomPin,
      remainingSeconds: 35 * 60,
      totalSeconds: 35 * 60,
      stage: 'Wash',
      washType: `35-Min Eco Cold Wash${addDetergent ? ' (+ Pod Kit)' : ''}`,
      powerSource: '100% Inverter Solar',
    })

    // Prepend to history
    setHistory(prev => [
      {
        id: newBookingId,
        bayId: selectedBay.id,
        bayName: selectedBay.subname,
        date: 'Today, Just Now',
        time: slot.timeLabel,
        pin: randomPin,
        amount: addDetergent ? selectedBay.rate + 200 : selectedBay.rate,
        status: 'Active',
      },
      ...prev,
    ])

    setIsSlotModalOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate circular SVG progress offset
  const circumference = 264
  const progressRatio = activeCycle
    ? activeCycle.remainingSeconds / activeCycle.totalSeconds
    : 0
  const strokeDashoffset = circumference * (1 - progressRatio)

  return (
    <div
      className="min-h-screen w-full flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#fd8451] selection:text-white"
      style={{ background: '#dde8ea', color: '#0b3c42' }}
    >
      {/* Top Header */}
      <header
        className="fixed top-0 inset-x-0 z-40 backdrop-blur-xl h-20 flex items-center justify-between px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full"
        style={{
          background: 'rgba(221, 232, 234, 0.9)',
          boxShadow: '0 4px 16px rgba(184, 198, 201, 0.4), 0 -1px 0 #ffffff',
        }}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 text-inherit no-underline">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: '#dde8ea', boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff' }}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                style={{ background: '#fd8451', boxShadow: '2px 2px 6px rgba(253,132,81,0.5)' }}
              >
                <span className="material-symbols-outlined text-[16px]">local_laundry_service</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-lg tracking-tight text-[#0b3c42]">kilowash</span>
              <span className="text-[9px] font-bold tracking-widest text-[#8aa8ab] uppercase">Hostel IoT Bays</span>
            </div>
          </Link>

          <span className="hidden sm:inline-block w-px h-6 bg-[#b8c6c9]" />

          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#0b3c42]"
            style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[14px] text-[#fd8451]">location_on</span>
            <span>LASU Epe Hostel Corridor</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Solar Telemetry Indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0b3c42]"
            style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[15px] text-[#fd8451] animate-pulse">bolt</span>
            <span>94% Solar</span>
          </div>

          {/* Quick Guide Trigger */}
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0b3c42] hover:text-[#fd8451] transition-colors"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[15px]">help</span>
            <span>How to Unlock</span>
          </button>

          {/* User Avatar */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs"
            style={{
              background: '#0b3c42',
              boxShadow: '3px 3px 8px rgba(11,60,66,0.35), -2px -2px 6px #ffffff',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-28 flex flex-col gap-6">

        {/* ============================================================== */}
        {/* VIEW 1: BAYS OVERVIEW & ACTIVE CYCLE */}
        {/* ============================================================== */}
        {activeTab === 'bays' && (
          <>
            {/* Active Wash & Keypad PIN Hero Card */}
            {activeCycle && (
              <section
                className="relative w-full rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col gap-4 animate-fadeIn"
                style={{
                  background: '#dde8ea',
                  boxShadow: '8px 8px 22px #b0bec0, -8px -8px 22px #ffffff',
                }}
              >
                {/* Decorative ambient glow */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#fd8451]/15 blur-2xl pointer-events-none" />

                {/* Top tags */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-[#0b3c42]"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#fd8451] animate-ping" />
                    <span>Active Cycle • {activeCycle.bayId}</span>
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#5a7578]"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#fd8451]">solar_power</span>
                    <span className="text-[#0b3c42]">{activeCycle.powerSource}</span>
                  </div>
                </div>

                {/* Center Visual & Countdown */}
                <div className="flex items-center gap-4 sm:gap-6 pt-1">
                  {/* Recessed well with washer image and SVG progress ring */}
                  <div
                    className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-2 flex items-center justify-center"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
                    }}
                  >
                    <svg className="absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                      <circle className="stroke-[#b8c6c9]/40 fill-none" cx="50" cy="50" r="42" strokeWidth="5" />
                      <circle
                        className="fill-none transition-all duration-1000 stroke-[#fd8451]"
                        cx="50" cy="50" r="42"
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <img
                      src={machineImg}
                      alt="Kilowash 3D Washer"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_8px_12px_rgba(11,60,66,0.2)] animate-pulse"
                    />
                  </div>

                  {/* Telemetry info */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#8aa8ab]">
                      Remaining Wash Time
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#0b3c42] tracking-tight tabular-nums">
                        {formatTime(activeCycle.remainingSeconds)}
                      </span>
                      <span className="text-xs text-[#5a7578] font-bold">mins</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#5a7578]">
                      <span className="truncate text-[#0b3c42] font-semibold">{activeCycle.washType}</span>
                      <span>•</span>
                      <span className="text-[#fd8451] font-bold">{activeCycle.stage} Stage</span>
                    </div>
                  </div>
                </div>

                {/* Keypad PIN Security Well */}
                <div
                  className="w-full rounded-2xl p-4 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  style={{
                    background: '#0b3c42',
                    boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#fd8451] text-[22px]">pin</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#a2ced5]">
                        {activeCycle.bayId} Keypad Unlock PIN
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-black tracking-widest text-white tabular-nums">
                          {activeCycle.pin}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#fd8451] text-[10px] uppercase font-bold tracking-wider">
                          Single Use
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyPin(activeCycle.pin)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 text-white"
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {copiedPin ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedPin ? 'PIN Copied!' : 'Copy PIN'}</span>
                    </button>

                    <button
                      onClick={() => setShowPinHelp(!showPinHelp)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all flex items-center justify-center"
                      title="How to punch PIN"
                    >
                      <span className="material-symbols-outlined text-[18px]">help_outline</span>
                    </button>
                  </div>
                </div>

                {showPinHelp && (
                  <div
                    className="p-3 rounded-xl text-xs text-[#0b3c42] flex items-start gap-2 animate-fadeIn"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#fd8451] shrink-0 mt-0.5">info</span>
                    <span>
                      Type this 4-digit code on {activeCycle.bayId}'s keypad by pressing <strong>*</strong>, typing <strong>{activeCycle.pin}</strong>, and confirming with <strong>#</strong>.
                    </span>
                  </div>
                )}
              </section>
            )}

            {/* Bays Header */}
            <div className="flex items-center justify-between gap-2 px-1 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0b3c42]">Campus Washing Bays</h2>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#0b3c42] uppercase"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff' }}
                  >
                    Hostel Bay A
                  </span>
                </div>
                <p className="text-xs text-[#5a7578] mt-0.5">Hostel Block C & D Corridor</p>
              </div>

              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#0b3c42]"
                style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>1 Idle / 1 Busy</span>
              </div>
            </div>

            {/* Bay Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bays.map(bay => {
                const isAvailable = bay.status === 'available'

                return (
                  <div
                    key={bay.id}
                    className="rounded-3xl p-5 flex flex-col justify-between gap-4 transition-all"
                    style={{
                      background: '#dde8ea',
                      boxShadow: '6px 6px 16px #b0bec0, -6px -6px 16px #ffffff',
                    }}
                  >
                    {/* Top machine title and badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl p-2 flex items-center justify-center shrink-0"
                          style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                        >
                          <img src={machineImg} alt={bay.name} className="w-10 h-10 object-contain" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-[#8aa8ab] uppercase tracking-wider">{bay.name}</span>
                          <span className="text-base font-extrabold text-[#0b3c42]">{bay.subname}</span>
                          <span className="text-xs text-[#5a7578]">{bay.capacity}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          isAvailable ? 'text-emerald-800' : 'text-[#fd8451]'
                        }`}
                        style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                      >
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-600 animate-pulse' : 'bg-[#fd8451]'}`} />
                        <span>{bay.statusLabel}</span>
                      </span>
                    </div>

                    {/* Metrics Strip */}
                    <div
                      className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl"
                      style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] font-bold uppercase text-[#8aa8ab]">Cycle</span>
                        <span className="text-xs font-extrabold text-[#0b3c42]">{bay.cycleDurationMinutes} Mins</span>
                      </div>
                      <div className="flex flex-col items-center text-center border-x border-[#b8c6c9]/50">
                        <span className="text-[9px] font-bold uppercase text-[#8aa8ab]">Rate</span>
                        <span className="text-xs font-extrabold text-[#fd8451]">₦{bay.rate.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] font-bold uppercase text-[#8aa8ab]">Temp</span>
                        <span className="text-xs font-extrabold text-[#0b3c42]">{bay.waterTemp}</span>
                      </div>
                    </div>

                    {/* Button */}
                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => handleOpenSlotPicker(bay)}
                        className="w-full py-3.5 px-4 rounded-full flex items-center justify-center gap-2 font-bold text-white text-xs transition-all active:scale-98"
                        style={{
                          background: '#fd8451',
                          boxShadow: '4px 4px 12px rgba(253,132,81,0.45), -2px -2px 6px rgba(255,255,255,0.5)',
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        <span>Book {bay.id} (₦{bay.rate.toLocaleString()})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSlotPicker(bay)}
                        className="w-full py-3.5 px-4 rounded-full flex items-center justify-center gap-2 font-bold text-[#0b3c42] text-xs transition-all"
                        style={{
                          background: '#dde8ea',
                          boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                        }}
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#5a7578]">schedule</span>
                        <span>View Next Available Slots</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Zero Blackout Banner */}
            <section
              className="rounded-3xl p-4 sm:p-5 flex items-center gap-3.5"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
              }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#fd8451] shrink-0"
                style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
              >
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <p className="text-xs text-[#0b3c42] leading-relaxed">
                <strong>Zero Blackout Guarantee:</strong> Each machine is wired directly to an autonomous 48V campus lithium bank. Campus grid failures do not interrupt your spin cycle.
              </p>
            </section>
          </>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: MY PINS & BOOKING HISTORY */}
        {/* ============================================================== */}
        {activeTab === 'pins' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-extrabold text-[#0b3c42]">My Keypad PINs & History</h2>
                <p className="text-xs text-[#5a7578]">Active unlock codes and past wash records</p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-[#0b3c42]"
                style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
              >
                {history.length} Total Bookings
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {history.map(item => (
                <div
                  key={item.id}
                  className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  style={{
                    background: '#dde8ea',
                    boxShadow: '5px 5px 14px #b8c6c9, -5px -5px 14px #ffffff',
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm"
                      style={{
                        background: item.status === 'Active' ? '#fd8451' : '#0b3c42',
                        color: 'white',
                        boxShadow: '3px 3px 7px rgba(11,60,66,0.3)',
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.status === 'Active' ? 'bolt' : 'receipt_long'}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0b3c42]">{item.bayName} ({item.bayId})</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.status === 'Active' ? 'text-[#fd8451]' : 'text-emerald-700'
                          }`}
                          style={{ background: '#dde8ea', boxShadow: 'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff' }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <span className="text-xs text-[#5a7578] mt-0.5">{item.date} • {item.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#b8c6c9]/40">
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[10px] text-[#8aa8ab] uppercase font-bold">Keypad PIN</span>
                      <span className="text-lg font-black tracking-widest text-[#0b3c42]">{item.pin}</span>
                    </div>

                    <button
                      onClick={() => handleCopyPin(item.pin)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all text-[#0b3c42] flex items-center gap-1"
                      style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
                    >
                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: HOW-TO & SUPPORT */}
        {/* ============================================================== */}
        {activeTab === 'guide' && (
          <div className="flex flex-col gap-5 animate-fadeIn">
            <div className="px-1">
              <h2 className="text-xl font-extrabold text-[#0b3c42]">How to Use & Hostel Support</h2>
              <p className="text-xs text-[#5a7578]">Quick 4-step walk-through and instant campus issue logging</p>
            </div>

            {/* Quick 4 Steps */}
            <div
              className="rounded-3xl p-5 flex flex-col gap-4"
              style={{ background: '#dde8ea', boxShadow: '6px 6px 16px #b8c6c9, -6px -6px 16px #ffffff' }}
            >
              {[
                { n: '01', title: 'Book Bay & Receive PIN', text: 'Choose your preferred 30-min window and pay ₦1,500. Your 4-digit PIN is displayed immediately.' },
                { n: '02', title: 'Wake the Machine', text: 'Press the star (*) button on the physical door keypad to wake up the solar controller.' },
                { n: '03', title: 'Unlock with PIN', text: 'Enter your 4 digits and press (#). The electronic door lock clicks open immediately.' },
                { n: '04', title: '10-Min Buffer Turnover', text: 'After the 35-min wash finishes, you have a 10-minute grace window to retrieve your laundry.' },
              ].map(st => (
                <div key={st.n} className="flex items-start gap-3.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0"
                    style={{ background: '#0b3c42' }}
                  >
                    {st.n}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0b3c42]">{st.title}</h4>
                    <p className="text-xs text-[#5a7578] mt-0.5 leading-relaxed">{st.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Log an Issue Card */}
            <div
              className="rounded-3xl p-5 flex flex-col gap-3.5"
              style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff' }}
            >
              <h3 className="text-sm font-extrabold text-[#0b3c42] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fd8451] text-[18px]">report_problem</span>
                Report Machine or Blocked Laundry
              </h3>
              <p className="text-xs text-[#5a7578]">
                If a previous user left their laundry inside or if you encounter any hardware issue, alert campus operations immediately:
              </p>
              <a
                href="mailto:founders@kilowash.ng?subject=Hostel%20Bay%20Support%20Issue"
                className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs font-bold text-white transition-all self-start"
                style={{ background: '#0b3c42', boxShadow: '4px 4px 10px rgba(11,60,66,0.35)' }}
              >
                <span className="material-symbols-outlined text-[16px]">mail</span>
                <span>Email Campus Operations (founders@kilowash.ng)</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 backdrop-blur-xl h-20 flex items-center justify-center px-4"
        style={{
          background: 'rgba(221, 232, 234, 0.92)',
          boxShadow: '0 -4px 16px rgba(184, 198, 201, 0.4)',
        }}
      >
        <div
          className="max-w-md w-full p-1.5 rounded-full flex items-center justify-between gap-1"
          style={{
            background: '#dde8ea',
            boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff',
          }}
        >
          <button
            onClick={() => setActiveTab('bays')}
            className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-2 text-xs font-extrabold transition-all ${
              activeTab === 'bays' ? 'text-white' : 'text-[#5a7578] hover:text-[#0b3c42]'
            }`}
            style={
              activeTab === 'bays'
                ? { background: '#0b3c42', boxShadow: '3px 3px 8px rgba(11,60,66,0.4)' }
                : { background: 'transparent' }
            }
          >
            <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
            <span>Bays</span>
          </button>

          <button
            onClick={() => setActiveTab('pins')}
            className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-2 text-xs font-extrabold transition-all ${
              activeTab === 'pins' ? 'text-white' : 'text-[#5a7578] hover:text-[#0b3c42]'
            }`}
            style={
              activeTab === 'pins'
                ? { background: '#0b3c42', boxShadow: '3px 3px 8px rgba(11,60,66,0.4)' }
                : { background: 'transparent' }
            }
          >
            <span className="material-symbols-outlined text-[18px]">pin</span>
            <span>My PINs</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-2 text-xs font-extrabold transition-all ${
              activeTab === 'guide' ? 'text-white' : 'text-[#5a7578] hover:text-[#0b3c42]'
            }`}
            style={
              activeTab === 'guide'
                ? { background: '#0b3c42', boxShadow: '3px 3px 8px rgba(11,60,66,0.4)' }
                : { background: 'transparent' }
            }
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            <span>Guide</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      {selectedBay && (
        <SlotPickerModal
          bay={selectedBay}
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  )
}
