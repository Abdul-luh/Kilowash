import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  INITIAL_BAYS,
  MOCK_HISTORY,
  calculateReminderSchedule,
  machineImg,
  type Bay,
  type BookingSlot,
  type WashHistoryItem,
} from '../data/mockDashboard'
import SlotPickerModal from '../components/dashboard/SlotPickerModal'
import GuideModal from '../components/dashboard/GuideModal'
import ComplaintModal from '../components/dashboard/ComplaintModal'

export interface ActiveBayState {
  bookingId: string
  bayId: string
  bayName: string
  location: string
  machineName: string
  pin: string
  remainingSeconds: number
  totalSeconds: number
  isRunning: boolean
  stage: 'Wash' | 'Rinse' | 'Spin' | 'Buffer / Unload'
  washType: string
  powerSource: string
}

export default function Dashboard() {
  const [bays, setBays] = useState<Bay[]>(INITIAL_BAYS)
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedBay, setSelectedBay] = useState<Bay | null>(null)
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false)
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false)
  const [complaintBayId, setComplaintBayId] = useState<string>('BAY-01')
  const [complaintBookingId, setComplaintBookingId] = useState<string>('')

  // Dynamic Active Bay Simulation State (Live Ticking Wash Cycle)
  const [activeBay, setActiveBay] = useState<ActiveBayState | null>({
    bookingId: 'BK-4108',
    bayId: 'BAY-01',
    bayName: 'Machine 01 (Female Hostel)',
    location: 'Female Hostel',
    machineName: 'Machine 01',
    pin: '5182',
    remainingSeconds: 22 * 60 + 36, // 22m 36s active countdown
    totalSeconds: 30 * 60,
    isRunning: true,
    stage: 'Rinse',
    washType: '30-Min Eco Cold Wash',
    powerSource: '100% Inverter Solar',
  })

  // Dynamic cycle stage progression based on remaining seconds
  function getCycleStage(remainingSec: number): 'Wash' | 'Rinse' | 'Spin' | 'Buffer / Unload' {
    if (remainingSec <= 0) return 'Buffer / Unload'
    if (remainingSec > 18 * 60) return 'Wash'
    if (remainingSec > 8 * 60) return 'Rinse'
    return 'Spin'
  }

  function formatTimeMMSS(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Live ticking countdown for active bay
  useEffect(() => {
    if (!activeBay || !activeBay.isRunning || activeBay.remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setActiveBay(prev => {
        if (!prev || !prev.isRunning) return prev
        const nextRemaining = Math.max(0, prev.remainingSeconds - 1)
        const nextStage = getCycleStage(nextRemaining)
        return {
          ...prev,
          remainingSeconds: nextRemaining,
          isRunning: nextRemaining > 0,
          stage: nextStage,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeBay?.isRunning, activeBay?.remainingSeconds])

  // Synchronize campus machines status with dynamic active bay
  useEffect(() => {
    if (!activeBay) return
    setBays(prev =>
      prev.map(bay => {
        if (bay.id === activeBay.bayId) {
          if (activeBay.remainingSeconds > 0) {
            const remMin = Math.ceil(activeBay.remainingSeconds / 60)
            return {
              ...bay,
              status: 'busy',
              statusLabel: `Busy (${remMin}m)`,
              remainingMinutes: remMin,
            }
          } else {
            return {
              ...bay,
              status: 'buffer',
              statusLabel: 'Buffer (Unload)',
              remainingMinutes: 0,
            }
          }
        }
        return bay
      })
    )
  }, [activeBay?.remainingSeconds, activeBay?.bayId])

  // Controls for dynamic active bay
  function togglePauseActiveCycle() {
    setActiveBay(prev => (prev ? { ...prev, isRunning: !prev.isRunning } : null))
  }

  function fastForwardActiveCycle() {
    setActiveBay(prev => {
      if (!prev) return null
      const nextRemaining = Math.max(0, prev.remainingSeconds - 120)
      return {
        ...prev,
        remainingSeconds: nextRemaining,
        isRunning: nextRemaining > 0,
        stage: getCycleStage(nextRemaining),
      }
    })
  }

  function handleCompleteAndUnload() {
    if (!activeBay) return
    const completedBayId = activeBay.bayId
    // Revert machine to available
    setBays(prev =>
      prev.map(b =>
        b.id === completedBayId
          ? {
              ...b,
              status: 'available',
              statusLabel: 'Available',
              remainingMinutes: undefined,
            }
          : b
      )
    )
    // Update history
    setHistory(prev =>
      prev.map(h => (h.id === activeBay.bookingId ? { ...h, status: 'Completed' } : h))
    )
    setActiveBay(null)
  }

  function handleStartWash(booking: WashHistoryItem) {
    const bay = bays.find(b => b.id === booking.bayId)
    setActiveBay({
      bookingId: booking.id,
      bayId: booking.bayId,
      bayName: booking.bayName,
      location: bay ? bay.name : 'Campus Hostel',
      machineName: bay ? bay.subname : 'Machine',
      pin: booking.pin,
      remainingSeconds: 30 * 60,
      totalSeconds: 30 * 60,
      isRunning: true,
      stage: 'Wash',
      washType: '30-Min Eco Cold Wash',
      powerSource: '100% Inverter Solar',
    })
    setHistory(prev =>
      prev.map(h => (h.id === booking.id ? { ...h, status: 'Active' } : h))
    )
    setActiveTab('bays')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Current active navigation tab: 'bays' | 'history' | 'guide'
  const [activeTab, setActiveTab] = useState<'bays' | 'history' | 'guide'>('bays')

  // History filter: 'all' | 'booked' | 'completed'
  const [historyFilter, setHistoryFilter] = useState<'all' | 'booked' | 'completed'>('all')

  // Booking success confirmation banner
  const [bookingToast, setBookingToast] = useState<{
    pin: string
    bayName: string
    time: string
    reminderTime: string
  } | null>(null)

  // Wash history & booked sessions
  const [history, setHistory] = useState<WashHistoryItem[]>(MOCK_HISTORY)

  // Copy feedback state & keypad guide toggle
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null)
  const [expandedPinHelp, setExpandedPinHelp] = useState(false)

  function handleCopyPin(pinToCopy: string, bookingId?: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pinToCopy)
    }
    if (bookingId) {
      setCopiedPinId(bookingId)
      setTimeout(() => setCopiedPinId(null), 2000)
    }
  }

  function handleOpenSlotPicker(bay: Bay) {
    setSelectedBay(bay)
    setIsSlotModalOpen(true)
  }

  function handleConfirmBooking(slot: BookingSlot, addDetergent: boolean) {
    if (!selectedBay) return

    const randomPin = String(Math.floor(1000 + Math.random() * 9000))
    const newBookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`
    const schedule = calculateReminderSchedule(slot.timeLabel)

    // Prepend to booked sessions in history (does not go to active bays)
    const newBooking: WashHistoryItem = {
      id: newBookingId,
      bayId: selectedBay.id,
      bayName: `${selectedBay.subname} (${selectedBay.name})`,
      date: slot.day === 'today' ? 'Today, Just Now' : slot.dayLabel,
      time: slot.timeLabel,
      pin: randomPin,
      amount: addDetergent ? selectedBay.rate + 200 : selectedBay.rate,
      status: 'Booked',
      reminderSchedule: schedule,
      reminderNotice: `Automated reminders at 30m (${schedule.reminder30}), 15m (${schedule.reminder15}), and 10m (${schedule.reminder10})`,
      reminderTime: schedule.reminder30,
    }

    setHistory(prev => [newBooking, ...prev])
    setIsSlotModalOpen(false)

    // Navigate to booked sessions in history to immediately view PIN and session
    setActiveTab('history')
    setHistoryFilter('all')
    setBookingToast({
      pin: randomPin,
      bayName: `${selectedBay.subname} (${selectedBay.name})`,
      time: slot.timeLabel,
      reminderTime: schedule.reminder30,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get current user's active/upcoming booking
  const currentBooking = history.find(h => h.status === 'Booked' || h.status === 'Active')
  const currentReminderSchedule = currentBooking
    ? currentBooking.reminderSchedule || calculateReminderSchedule(currentBooking.time)
    : null

  const LOCATION_OPTIONS = [
    { id: 'all', label: 'All Campus Spots', count: bays.length },
    { id: 'Female Hostel', label: 'Female Hostel', count: bays.filter(b => b.name === 'Female Hostel').length },
    { id: 'Front-Middle Block', label: 'Front-Middle', count: bays.filter(b => b.name === 'Front-Middle Block').length },
    { id: 'PDS Male Hostel', label: 'PDS Male', count: bays.filter(b => b.name === 'PDS Male Hostel').length },
    { id: 'PDS Female Hostel', label: 'PDS Female', count: bays.filter(b => b.name === 'PDS Female Hostel').length },
  ]

  const filteredBays =
    selectedLocation === 'all'
      ? bays
      : bays.filter(bay => bay.name.toLowerCase() === selectedLocation.toLowerCase())

  const filteredHistory = history.filter(item => {
    if (historyFilter === 'booked') return item.status === 'Booked' || item.status === 'Active'
    if (historyFilter === 'completed') return item.status === 'Completed'
    return true
  })

  const upcomingBookingsCount = history.filter(
    h => h.status === 'Booked' || h.status === 'Active'
  ).length

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
            <span>4 Campus Spots • 8 Machines</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Solar Telemetry Indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0b3c42]"
            style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[15px] text-[#fd8451]">solar_power</span>
            <span>94% Solar</span>
          </div>

          {/* Quick Guide Trigger */}
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0b3c42] hover:text-[#fd8451] transition-colors"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[15px]">help</span>
            <span>How to Unlock</span>
          </button>

          {/* Quick Complaint / Comment Trigger */}
          <button
            onClick={() => {
              setComplaintBookingId('')
              setComplaintBayId('BAY-01')
              setIsComplaintModalOpen(true)
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#0b3c42] hover:text-[#fd8451] transition-colors"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
            title="Lodge complaint or feedback"
          >
            <span className="material-symbols-outlined text-[15px] text-[#fd8451]">campaign</span>
            <span>Feedback / Issue</span>
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
        {/* VIEW 1: BAYS OVERVIEW & DYNAMIC ACTIVE BAY */}
        {/* ============================================================== */}
        {activeTab === 'bays' && (
          <>
            {/* Dynamic Active Bay Hero Card (Live Wash Cycle Simulation) */}
            {activeBay ? (
              <section
                className="relative rounded-3xl p-5 sm:p-6 flex flex-col gap-4 overflow-hidden animate-fadeIn"
                style={{
                  background: '#dde8ea',
                  boxShadow: '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff',
                }}
              >
                {/* Top status strip */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-[#0b3c42]"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      {activeBay.isRunning && activeBay.remainingSeconds > 0 && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          activeBay.remainingSeconds <= 0
                            ? 'bg-purple-500'
                            : activeBay.isRunning
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      ></span>
                    </span>
                    <span>Dynamic Active Bay • {activeBay.bayId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        activeBay.stage === 'Wash'
                          ? 'text-[#fd8451]'
                          : activeBay.stage === 'Rinse'
                          ? 'text-sky-700'
                          : activeBay.stage === 'Spin'
                          ? 'text-emerald-700'
                          : 'text-purple-700'
                      }`}
                      style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {activeBay.stage === 'Wash'
                          ? 'local_laundry_service'
                          : activeBay.stage === 'Rinse'
                          ? 'water_drop'
                          : activeBay.stage === 'Spin'
                          ? 'cyclone'
                          : 'door_open'}
                      </span>
                      <span>Stage: {activeBay.stage}</span>
                    </span>

                    <span
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-[#5a7578]"
                      style={{ background: '#dde8ea', boxShadow: 'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff' }}
                    >
                      <span className="material-symbols-outlined text-[12px] text-[#fd8451]">solar_power</span>
                      <span>Solar Inverter</span>
                    </span>
                  </div>
                </div>

                {/* Machine Graphic & Dynamic Circular Countdown Ring */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* SVG Circular Progress Ring */}
                    <div
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: '#dde8ea',
                        boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
                      }}
                    >
                      <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#c8d7d9" strokeWidth="6" />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke={
                            activeBay.remainingSeconds <= 0
                              ? '#9333ea'
                              : activeBay.stage === 'Wash'
                              ? '#fd8451'
                              : activeBay.stage === 'Rinse'
                              ? '#0284c7'
                              : '#10b981'
                          }
                          strokeWidth="6"
                          strokeDasharray={264}
                          strokeDashoffset={
                            activeBay.totalSeconds > 0
                              ? 264 * (1 - activeBay.remainingSeconds / activeBay.totalSeconds)
                              : 0
                          }
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      <img
                        src={machineImg}
                        alt={activeBay.bayName}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain relative z-10 drop-shadow-[0_4px_8px_rgba(11,60,66,0.18)]"
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aa8ab]">
                        Active In-Use Machine
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-[#0b3c42] tracking-tight">
                        {activeBay.bayName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-[#5a7578] flex-wrap">
                        <span className="text-[#0b3c42] font-bold">{activeBay.location}</span>
                        <span>•</span>
                        <span>{activeBay.washType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Big Live Ticking Clock */}
                  <div
                    className="w-full sm:w-auto px-4 py-2.5 rounded-2xl flex flex-row sm:flex-col items-center justify-between sm:justify-center text-right shrink-0"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                    }}
                  >
                    <div className="flex flex-col text-left sm:text-right">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#8aa8ab]">
                        {activeBay.remainingSeconds <= 0
                          ? 'Cycle Complete'
                          : activeBay.isRunning
                          ? 'Remaining (Live Ticking)'
                          : 'Cycle Paused'}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b3c42] tabular-nums">
                        {formatTimeMMSS(activeBay.remainingSeconds)}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-[#5a7578] sm:mt-0.5">
                      of {formatTimeMMSS(activeBay.totalSeconds)}
                    </span>
                  </div>
                </div>

                {/* Stage Progression Stepper */}
                <div
                  className="p-3 rounded-2xl flex flex-col gap-2"
                  style={{
                    background: '#dde8ea',
                    boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                  }}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#8aa8ab] uppercase tracking-wider px-1">
                    <span>Cycle Progress Steps</span>
                    <span className="text-[#0b3c42] font-extrabold">{activeBay.stage} Phase</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {/* Step 1: Wash */}
                    <div
                      className={`p-2 rounded-xl text-center flex flex-col items-center transition-all ${
                        activeBay.stage === 'Wash'
                          ? 'bg-[#fd8451] text-white shadow-md'
                          : activeBay.remainingSeconds <= 18 * 60
                          ? 'text-emerald-800 font-bold'
                          : 'text-[#8aa8ab]'
                      }`}
                      style={
                        activeBay.stage !== 'Wash'
                          ? { background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff' }
                          : undefined
                      }
                    >
                      <span className="text-[9px] uppercase font-bold">1. Wash</span>
                      <span className="text-[10px] mt-0.5 font-extrabold">12 mins</span>
                    </div>

                    {/* Step 2: Rinse */}
                    <div
                      className={`p-2 rounded-xl text-center flex flex-col items-center transition-all ${
                        activeBay.stage === 'Rinse'
                          ? 'bg-sky-600 text-white shadow-md'
                          : activeBay.remainingSeconds <= 8 * 60
                          ? 'text-emerald-800 font-bold'
                          : 'text-[#8aa8ab]'
                      }`}
                      style={
                        activeBay.stage !== 'Rinse'
                          ? { background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff' }
                          : undefined
                      }
                    >
                      <span className="text-[9px] uppercase font-bold">2. Rinse</span>
                      <span className="text-[10px] mt-0.5 font-extrabold">10 mins</span>
                    </div>

                    {/* Step 3: Spin */}
                    <div
                      className={`p-2 rounded-xl text-center flex flex-col items-center transition-all ${
                        activeBay.stage === 'Spin'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : activeBay.remainingSeconds <= 0
                          ? 'text-emerald-800 font-bold'
                          : 'text-[#8aa8ab]'
                      }`}
                      style={
                        activeBay.stage !== 'Spin'
                          ? { background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff' }
                          : undefined
                      }
                    >
                      <span className="text-[9px] uppercase font-bold">3. Spin</span>
                      <span className="text-[10px] mt-0.5 font-extrabold">8 mins</span>
                    </div>

                    {/* Step 4: Buffer / Unload */}
                    <div
                      className={`p-2 rounded-xl text-center flex flex-col items-center transition-all ${
                        activeBay.stage === 'Buffer / Unload'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-[#8aa8ab]'
                      }`}
                      style={
                        activeBay.stage !== 'Buffer / Unload'
                          ? { background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff' }
                          : undefined
                      }
                    >
                      <span className="text-[9px] uppercase font-bold">4. Unload</span>
                      <span className="text-[10px] mt-0.5 font-extrabold">10m buffer</span>
                    </div>
                  </div>
                </div>

                {/* Keypad PIN Display & Copy Button */}
                <div
                  className="w-full rounded-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  style={{
                    background: '#0b3c42',
                    boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#fd8451] text-[22px]">pin</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#a2ced5]">
                        {activeBay.bayId} Keypad Unlock PIN
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black tracking-widest text-white tabular-nums">
                          {activeBay.pin}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#fd8451] text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">key</span>
                          Single Use
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyPin(activeBay.pin, activeBay.bookingId)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 text-white"
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {copiedPinId === activeBay.bookingId ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedPinId === activeBay.bookingId ? 'PIN Copied!' : 'Copy PIN'}</span>
                    </button>

                    <button
                      onClick={() => setExpandedPinHelp(!expandedPinHelp)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all flex items-center justify-center"
                      title="Keypad unlock instructions"
                    >
                      <span className="material-symbols-outlined text-[18px]">help_outline</span>
                    </button>
                  </div>
                </div>

                {expandedPinHelp && (
                  <div
                    className="p-3 rounded-xl text-xs text-[#0b3c42] flex items-start gap-2 animate-fadeIn"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#fd8451] shrink-0 mt-0.5">info</span>
                    <span>
                      Type this 4-digit code on {activeBay.bayId}'s door keypad: press <strong>*</strong>, type <strong>{activeBay.pin}</strong>, then confirm with <strong>#</strong>.
                    </span>
                  </div>
                )}

                {/* Interactive Dynamic Bay Controls Bar */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  {activeBay.remainingSeconds > 0 ? (
                    <>
                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <button
                          type="button"
                          onClick={togglePauseActiveCycle}
                          className="px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all text-[#0b3c42] active:scale-95"
                          style={{
                            background: '#dde8ea',
                            boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff',
                          }}
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#fd8451]">
                            {activeBay.isRunning ? 'pause' : 'play_arrow'}
                          </span>
                          <span>{activeBay.isRunning ? 'Pause Cycle' : 'Resume'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={fastForwardActiveCycle}
                          className="px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all text-[#5a7578] hover:text-[#0b3c42] active:scale-95"
                          style={{
                            background: '#dde8ea',
                            boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff',
                          }}
                          title="Advance cycle by 2 minutes for testing"
                        >
                          <span className="material-symbols-outlined text-[15px]">fast_forward</span>
                          <span>-2m Sim</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCompleteAndUnload}
                        className="px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 text-rose-700 hover:text-rose-800 transition-all active:scale-95 ml-auto"
                        style={{
                          background: '#dde8ea',
                          boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff',
                        }}
                      >
                        <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                        <span>Complete & Free Bay</span>
                      </button>
                    </>
                  ) : (
                    /* Cycle Complete / 10m Buffer Window State */
                    <button
                      type="button"
                      onClick={handleCompleteAndUnload}
                      className="w-full py-3 px-4 rounded-full text-xs font-extrabold text-white flex items-center justify-center gap-2 transition-all active:scale-98 animate-bounce"
                      style={{
                        background: '#0b3c42',
                        boxShadow: '4px 4px 14px rgba(11,60,66,0.4), -2px -2px 6px #ffffff',
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#fd8451]">door_open</span>
                      <span>Cycle Finished • Open Door & Retrieve Laundry (10-Min Buffer)</span>
                    </button>
                  )}
                </div>
              </section>
            ) : currentBooking ? (
              /* User's Upcoming Reserved Booking (No active wash running yet) */
              <section
                className="relative rounded-3xl p-5 sm:p-6 flex flex-col gap-4 overflow-hidden animate-fadeIn"
                style={{
                  background: '#dde8ea',
                  boxShadow: '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff',
                }}
              >
                {/* Top status strip */}
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-[#0b3c42]"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#fd8451]">event_available</span>
                    <span>Your Current Booking • {currentBooking.id}</span>
                  </div>

                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-emerald-800"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[13px] text-emerald-700">check_circle</span>
                    <span>Confirmed & Ready</span>
                  </span>
                </div>

                {/* Machine & Timing Details */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2.5 flex items-center justify-center shrink-0"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                    }}
                  >
                    <img
                      src={machineImg}
                      alt={currentBooking.bayName}
                      className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_4px_8px_rgba(11,60,66,0.18)]"
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8aa8ab]">
                      Reserved Washing Spot
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#0b3c42] tracking-tight">
                      {currentBooking.bayName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold text-[#5a7578] flex-wrap">
                      <span className="text-[#fd8451] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {currentBooking.date}
                      </span>
                      <span>•</span>
                      <span className="text-[#0b3c42] font-bold">{currentBooking.time}</span>
                    </div>
                  </div>
                </div>

                {/* Keypad PIN Display & Copy Button */}
                <div
                  className="w-full rounded-2xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  style={{
                    background: '#0b3c42',
                    boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 6px rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#fd8451] text-[22px]">pin</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#a2ced5]">
                        {currentBooking.bayId} Door Unlock PIN
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-black tracking-widest text-white tabular-nums">
                          {currentBooking.pin}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[#fd8451] text-[9px] uppercase font-bold tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px]">key</span>
                          Single Use
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyPin(currentBooking.pin, currentBooking.id)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 text-white"
                      style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {copiedPinId === currentBooking.id ? 'check' : 'content_copy'}
                      </span>
                      <span>{copiedPinId === currentBooking.id ? 'PIN Copied!' : 'Copy PIN'}</span>
                    </button>

                    <button
                      onClick={() => setExpandedPinHelp(!expandedPinHelp)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all flex items-center justify-center"
                      title="Keypad unlock instructions"
                    >
                      <span className="material-symbols-outlined text-[18px]">help_outline</span>
                    </button>
                  </div>
                </div>

                {expandedPinHelp && (
                  <div
                    className="p-3 rounded-xl text-xs text-[#0b3c42] flex items-start gap-2 animate-fadeIn"
                    style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#fd8451] shrink-0 mt-0.5">info</span>
                    <span>
                      Type this 4-digit code on {currentBooking.bayId}'s door keypad: press <strong>*</strong>, type <strong>{currentBooking.pin}</strong>, then confirm with <strong>#</strong>.
                    </span>
                  </div>
                )}

                {/* 30, 15, and 10 Minute Timers Reminder Strip */}
                {currentReminderSchedule && (
                  <div
                    className="p-3.5 rounded-2xl flex flex-col gap-2"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#fd8451]">alarm</span>
                        Automated Pre-Wash Reminders
                      </span>
                      <span className="text-[10px] font-bold text-[#5a7578]">SMS & WhatsApp</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div
                        className="py-1.5 px-2 rounded-xl text-center flex flex-col items-center"
                        style={{ background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff' }}
                      >
                        <span className="text-[9px] uppercase font-bold text-[#8aa8ab]">30 Mins Before</span>
                        <span className="text-xs font-black text-[#0b3c42] mt-0.5">{currentReminderSchedule.reminder30}</span>
                      </div>

                      <div
                        className="py-1.5 px-2 rounded-xl text-center flex flex-col items-center"
                        style={{ background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff' }}
                      >
                        <span className="text-[9px] uppercase font-bold text-[#8aa8ab]">15 Mins Before</span>
                        <span className="text-xs font-black text-[#fd8451] mt-0.5">{currentReminderSchedule.reminder15}</span>
                      </div>

                      <div
                        className="py-1.5 px-2 rounded-xl text-center flex flex-col items-center"
                        style={{ background: '#dde8ea', boxShadow: '2px 2px 5px #b8c6c9, -2px -2px 5px #ffffff' }}
                      >
                        <span className="text-[9px] uppercase font-bold text-[#8aa8ab]">10 Mins Before</span>
                        <span className="text-xs font-black text-[#0b3c42] mt-0.5">{currentReminderSchedule.reminder10}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action to Start Wash Directly */}
                <button
                  type="button"
                  onClick={() => handleStartWash(currentBooking)}
                  className="w-full py-3.5 px-4 rounded-full flex items-center justify-center gap-2 font-extrabold text-white text-xs transition-all active:scale-98"
                  style={{
                    background: '#fd8451',
                    boxShadow: '4px 4px 14px rgba(253,132,81,0.45), -2px -2px 6px rgba(255,255,255,0.6)',
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  <span>Punch Keypad PIN & Start Dynamic Wash Cycle</span>
                </button>
              </section>
            ) : (
              /* Calm Idle Banner */
              <section
                className="rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 animate-fadeIn"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#fd8451] shrink-0"
                    style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
                  >
                    <span className="material-symbols-outlined text-[22px]">calendar_add_on</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-[#0b3c42]">All Campus Machines Idle & Ready</span>
                    <span className="text-xs text-[#5a7578] mt-0.5">
                      Select any available machine below to reserve your wash window and receive your unlock PIN.
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Bays Header & Location Filter */}
            <div className="flex flex-col gap-3 px-1 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-[#0b3c42]">Campus Washing Spots</h2>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-[#fd8451] uppercase flex items-center gap-1"
                      style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff' }}
                    >
                      <span className="material-symbols-outlined text-[12px] text-[#fd8451]">apartment</span>
                      4 Locations • 8 Machines
                    </span>
                  </div>
                  <p className="text-xs text-[#5a7578] mt-0.5">2 machines per spot • Solar-powered smart wash nodes</p>
                </div>

                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#0b3c42] self-start sm:self-auto"
                  style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff' }}
                >
                  <span className="material-symbols-outlined text-[15px] text-emerald-700">check_circle</span>
                  <span>{bays.filter(b => b.status === 'available').length} Available / {bays.filter(b => b.status === 'busy').length} Busy</span>
                </div>
              </div>

              {/* Location Filter Pills */}
              <div
                className="p-1 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                }}
              >
                {LOCATION_OPTIONS.map(opt => {
                  const isSelected = selectedLocation === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedLocation(opt.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        isSelected ? 'bg-[#0b3c42] text-white shadow' : 'text-[#5a7578] hover:text-[#0b3c42]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#b8c6c9]/40 text-[#0b3c42]'
                        }`}
                      >
                        {opt.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bay Cards Grid with Clear Icons (No raw dots/indicators) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBays.map(bay => {
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
                    {/* Top machine title and badge with Icons */}
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
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          isAvailable ? 'text-emerald-800' : 'text-[#fd8451]'
                        }`}
                        style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isAvailable ? 'check_circle' : 'timelapse'}
                        </span>
                        <span>{bay.statusLabel}</span>
                      </span>
                    </div>

                    {/* Metrics Strip with Icons */}
                    <div
                      className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl"
                      style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] font-bold uppercase text-[#8aa8ab] flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">timer</span>
                          Cycle
                        </span>
                        <span className="text-xs font-extrabold text-[#0b3c42]">{bay.cycleDurationMinutes} Mins</span>
                      </div>
                      <div className="flex flex-col items-center text-center border-x border-[#b8c6c9]/50">
                        <span className="text-[9px] font-bold uppercase text-[#8aa8ab] flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">payments</span>
                          Rate
                        </span>
                        <span className="text-xs font-extrabold text-[#fd8451]">₦{bay.rate.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-center text-center">
                        <span className="text-[9px] font-bold uppercase text-[#8aa8ab] flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px]">water_drop</span>
                          Temp
                        </span>
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
                        <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                        <span>Book {bay.id} (Schedule Time)</span>
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
                        <span className="material-symbols-outlined text-[18px] text-[#5a7578]">event_upcoming</span>
                        <span>View Schedule & Book Ahead</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Zero Blackout Banner with Icons */}
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
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <p className="text-xs text-[#0b3c42] leading-relaxed">
                <strong>Zero Blackout Guarantee:</strong> Each machine is backed by an autonomous 48V campus lithium bank. Campus grid failures never interrupt your spin cycle.
              </p>
            </section>
          </>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: BOOKED SESSIONS & WASH HISTORY */}
        {/* ============================================================== */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Booking Confirmed Toast */}
            {bookingToast && (
              <div
                className="rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fadeIn"
                style={{
                  background: '#0b3c42',
                  color: 'white',
                  boxShadow: '6px 6px 16px rgba(11,60,66,0.35)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#fd8451] shrink-0">
                    <span className="material-symbols-outlined text-[22px]">check_circle</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-white">Booking Confirmed & PIN Generated!</span>
                    <span className="text-[#a2ced5] text-xs">
                      {bookingToast.bayName} • {bookingToast.time}
                    </span>
                    <span className="text-[11px] text-[#fd8451] font-bold mt-0.5">
                      🔔 Automated SMS & WhatsApp reminders scheduled at 30m, 15m & 10m before unlock
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopyPin(bookingToast.pin)}
                    className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Copy PIN ({bookingToast.pin})</span>
                  </button>
                  <button
                    onClick={() => setBookingToast(null)}
                    className="p-1 rounded-full text-white/70 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-xl font-extrabold text-[#0b3c42]">Booked Sessions & Wash History</h2>
                <p className="text-xs text-[#5a7578]">Upcoming reserved wash windows, door unlock PINs & receipts</p>
              </div>

              {/* Filter Tabs */}
              <div
                className="p-1 rounded-2xl flex items-center gap-1 self-start sm:self-auto"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                }}
              >
                {[
                  { id: 'all', label: 'All', count: history.length },
                  { id: 'booked', label: 'Upcoming', count: upcomingBookingsCount },
                  { id: 'completed', label: 'Completed', count: history.filter(h => h.status === 'Completed').length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setHistoryFilter(tab.id as 'all' | 'booked' | 'completed')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      historyFilter === tab.id
                        ? 'bg-[#0b3c42] text-white shadow'
                        : 'text-[#5a7578] hover:text-[#0b3c42]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        historyFilter === tab.id ? 'bg-white/20 text-white' : 'bg-[#b8c6c9]/40 text-[#0b3c42]'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prominent Complaint & Comment Card */}
            <div
              className="rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#fd8451] shrink-0"
                  style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
                >
                  <span className="material-symbols-outlined text-[22px]">support_agent</span>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0b3c42]">
                    Have an issue or want to leave a comment?
                  </h3>
                  <p className="text-[11px] text-[#5a7578] mt-0.5 leading-snug">
                    Report previous user clothes trapped inside, machine errors, or share your laundry suggestions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setComplaintBookingId('')
                  setComplaintBayId('BAY-01')
                  setIsComplaintModalOpen(true)
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95"
                style={{
                  background: '#0b3c42',
                  boxShadow: '3px 3px 8px rgba(11,60,66,0.35), -2px -2px 6px #ffffff',
                }}
              >
                <span className="material-symbols-outlined text-[16px] text-[#fd8451]">campaign</span>
                <span>Lodge Complaint or Comment</span>
              </button>
            </div>

            {/* Wash History & Booked Cards */}
            <div className="flex flex-col gap-3">
              {filteredHistory.length === 0 ? (
                <div
                  className="p-8 rounded-2xl text-center text-xs font-semibold text-[#5a7578]"
                  style={{
                    background: '#dde8ea',
                    boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                  }}
                >
                  No sessions found in this category.
                </div>
              ) : (
                filteredHistory.map(item => {
                  const isUpcoming = item.status === 'Booked' || item.status === 'Active'

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all"
                      style={{
                        background: '#dde8ea',
                        boxShadow: '5px 5px 14px #b8c6c9, -5px -5px 14px #ffffff',
                      }}
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0"
                            style={{
                              background: isUpcoming ? '#fd8451' : '#0b3c42',
                              color: 'white',
                              boxShadow: '3px 3px 7px rgba(11,60,66,0.3)',
                            }}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isUpcoming ? 'key' : 'receipt_long'}
                            </span>
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0b3c42]">{item.bayName} ({item.bayId})</span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                                  isUpcoming ? 'text-emerald-800' : 'text-[#5a7578]'
                                }`}
                                style={{ background: '#dde8ea', boxShadow: 'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff' }}
                              >
                                <span className="material-symbols-outlined text-[11px]">
                                  {isUpcoming ? 'event_available' : 'check'}
                                </span>
                                <span>{isUpcoming ? 'Booked (Upcoming)' : item.status}</span>
                              </span>
                            </div>
                            <span className="text-xs text-[#5a7578] mt-0.5">{item.date} • {item.time}</span>
                            <span className="text-[10px] text-[#8aa8ab] font-bold mt-0.5">Ref: {item.id} • ₦{item.amount.toLocaleString()}</span>
                          </div>
                        </div>

                        {isUpcoming ? (
                          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#b8c6c9]/40">
                            <div className="flex flex-col text-left sm:text-right mr-1">
                              <span className="text-[10px] text-[#8aa8ab] uppercase font-bold">Keypad Unlock PIN</span>
                              <span className="text-xl font-black tracking-widest text-[#0b3c42]">{item.pin}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyPin(item.pin, item.id)}
                                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all text-[#0b3c42] flex items-center gap-1"
                                style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
                                title="Copy PIN"
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  {copiedPinId === item.id ? 'check' : 'content_copy'}
                                </span>
                                <span>{copiedPinId === item.id ? 'Copied' : 'Copy PIN'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setComplaintBookingId(item.id)
                                  setComplaintBayId(item.bayId)
                                  setIsComplaintModalOpen(true)
                                }}
                                className="px-2.5 py-1.5 rounded-full text-xs font-bold transition-all text-[#5a7578] hover:text-[#0b3c42] flex items-center gap-1"
                                style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff' }}
                                title="Report issue or comment on this wash"
                              >
                                <span className="material-symbols-outlined text-[14px] text-[#fd8451]">report_problem</span>
                                <span className="hidden sm:inline">Feedback</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Past or completed wash: PIN is used/expired and no longer needed */
                          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#b8c6c9]/40">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#8aa8ab] uppercase tracking-wider flex items-center gap-1"
                                style={{ background: '#dde8ea', boxShadow: 'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff' }}
                              >
                                <span className="material-symbols-outlined text-[13px] text-emerald-700">lock</span>
                                <span>PIN Expired / Used</span>
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                setComplaintBookingId(item.id)
                                setComplaintBayId(item.bayId)
                                setIsComplaintModalOpen(true)
                              }}
                              className="px-2.5 py-1.5 rounded-full text-xs font-bold transition-all text-[#5a7578] hover:text-[#0b3c42] flex items-center gap-1"
                              style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff' }}
                              title="Report issue or comment on this wash"
                            >
                              <span className="material-symbols-outlined text-[14px] text-[#fd8451]">report_problem</span>
                              <span>Issue / Comment</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 30, 15 & 10 Minute Timers Reminder Notice for Upcoming Sessions */}
                      {isUpcoming && (
                        <div
                          className="p-3 rounded-2xl flex flex-col gap-2 mt-1"
                          style={{
                            background: '#dde8ea',
                            boxShadow: 'inset 1.5px 1.5px 4px #b8c6c9, inset -1.5px -1.5px 4px #ffffff',
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-[#fd8451]">alarm</span>
                              Pre-Wash Reminder Schedule (30m • 15m • 10m)
                            </span>
                            <span className="text-[10px] text-[#5a7578] font-bold">SMS & WhatsApp Alerts</span>
                          </div>

                          {(() => {
                            const sched = item.reminderSchedule || calculateReminderSchedule(item.time)
                            return (
                              <div className="grid grid-cols-3 gap-2">
                                <div
                                  className="py-1 px-1.5 rounded-xl text-center flex flex-col items-center"
                                  style={{ background: '#dde8ea', boxShadow: '2px 2px 4px #b8c6c9, -2px -2px 4px #ffffff' }}
                                >
                                  <span className="text-[8.5px] uppercase font-bold text-[#8aa8ab]">30m Before</span>
                                  <span className="text-xs font-black text-[#0b3c42]">{sched.reminder30}</span>
                                </div>
                                <div
                                  className="py-1 px-1.5 rounded-xl text-center flex flex-col items-center"
                                  style={{ background: '#dde8ea', boxShadow: '2px 2px 4px #b8c6c9, -2px -2px 4px #ffffff' }}
                                >
                                  <span className="text-[8.5px] uppercase font-bold text-[#8aa8ab]">15m Before</span>
                                  <span className="text-xs font-black text-[#fd8451]">{sched.reminder15}</span>
                                </div>
                                <div
                                  className="py-1 px-1.5 rounded-xl text-center flex flex-col items-center"
                                  style={{ background: '#dde8ea', boxShadow: '2px 2px 4px #b8c6c9, -2px -2px 4px #ffffff' }}
                                >
                                  <span className="text-[8.5px] uppercase font-bold text-[#8aa8ab]">10m Before</span>
                                  <span className="text-xs font-black text-[#0b3c42]">{sched.reminder10}</span>
                                </div>
                              </div>
                            )
                          })()}

                          {/* Quick Action to Trigger Dynamic Wash from History */}
                          <button
                            type="button"
                            onClick={() => handleStartWash(item)}
                            className="w-full py-2.5 px-3 rounded-full flex items-center justify-center gap-2 font-bold text-white text-xs transition-all active:scale-98 mt-1"
                            style={{
                              background: '#fd8451',
                              boxShadow: '3px 3px 8px rgba(253,132,81,0.4), -1px -1px 4px rgba(255,255,255,0.5)',
                            }}
                          >
                            <span className="material-symbols-outlined text-[16px]">play_circle</span>
                            <span>Punch Keypad PIN & Start Wash in Active Bay</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
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

            {/* Quick 4 Steps with Icons */}
            <div
              className="rounded-3xl p-5 flex flex-col gap-4"
              style={{ background: '#dde8ea', boxShadow: '6px 6px 16px #b0bec0, -6px -6px 16px #ffffff' }}
            >
              {[
                { n: '01', icon: 'key', title: 'Book Bay & Receive PIN', text: 'Choose your preferred 30-min window (today or tomorrow) and pay ₦1,500. Your 4-digit PIN is displayed immediately.' },
                { n: '02', icon: 'touch_app', title: 'Wake the Machine', text: 'Press the star (*) button on the physical door keypad to wake up the solar controller.' },
                { n: '03', icon: 'lock_open', title: 'Unlock with PIN', text: 'Enter your 4 digits and press (#). The electronic door lock clicks open immediately.' },
                { n: '04', icon: 'timer', title: '10-Min Buffer Turnover', text: 'After the 35-min wash finishes, you have a 10-minute grace window to retrieve your laundry.' },
              ].map(st => (
                <div key={st.n} className="flex items-start gap-3.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs text-white shrink-0"
                    style={{ background: '#0b3c42' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">{st.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0b3c42]">{st.title}</h4>
                    <p className="text-xs text-[#5a7578] mt-0.5 leading-relaxed">{st.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Log an Issue & Comment Card */}
            <div
              className="rounded-3xl p-5 flex flex-col gap-3.5"
              style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff' }}
            >
              <h3 className="text-sm font-extrabold text-[#0b3c42] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fd8451] text-[18px]">report_problem</span>
                Report Machine, Blocked Laundry, or Comment
              </h3>
              <p className="text-xs text-[#5a7578] leading-relaxed">
                If a previous user left their laundry inside, if a machine stopped mid-cycle, or if you want to suggest improvements, alert campus operations immediately:
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setComplaintBookingId('')
                    setComplaintBayId('BAY-01')
                    setIsComplaintModalOpen(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs font-bold text-white transition-all active:scale-95"
                  style={{ background: '#fd8451', boxShadow: '4px 4px 10px rgba(253,132,81,0.45)' }}
                >
                  <span className="material-symbols-outlined text-[16px]">campaign</span>
                  <span>Lodge Complaint / Give Comment</span>
                </button>

                <a
                  href="mailto:founders@kilowash.ng?subject=Hostel%20Bay%20Support%20Issue"
                  className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full text-xs font-bold text-[#0b3c42] transition-all"
                  style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  <span>Email Founders</span>
                </a>
              </div>
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
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 px-3 rounded-full flex items-center justify-center gap-1.5 text-xs font-extrabold transition-all relative ${
              activeTab === 'history' ? 'text-white' : 'text-[#5a7578] hover:text-[#0b3c42]'
            }`}
            style={
              activeTab === 'history'
                ? { background: '#0b3c42', boxShadow: '3px 3px 8px rgba(11,60,66,0.4)' }
                : { background: 'transparent' }
            }
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            <span>Booked & History</span>
            {upcomingBookingsCount > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ml-0.5"
                style={{
                  background: activeTab === 'history' ? '#fd8451' : '#0b3c42',
                  color: 'white',
                }}
              >
                {upcomingBookingsCount}
              </span>
            )}
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

      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        initialBayId={complaintBayId}
        initialBookingId={complaintBookingId}
      />
    </div>
  )
}
