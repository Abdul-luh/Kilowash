import { useState, useMemo, useRef, useCallback } from 'react'
import type { Bay, BookingSlot } from '../../data/mockDashboard'
import { MULTI_DAY_SLOTS } from '../../data/mockDashboard'

interface SlotPickerModalProps {
  bay: Bay
  isOpen: boolean
  onClose: () => void
  onConfirmBooking: (slot: BookingSlot, addDetergent: boolean) => void
}

export default function SlotPickerModal({
  bay,
  isOpen,
  onClose,
  onConfirmBooking,
}: SlotPickerModalProps) {
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>(() => {
    const hasTodayUpcoming = MULTI_DAY_SLOTS.some(s => s.day === 'today' && !s.isPast)
    return hasTodayUpcoming ? 'today' : 'tomorrow'
  })

  // ONLY upcoming slots are placed on the knob - passed times are removed completely
  const daySlots = useMemo(() => {
    const upcoming = MULTI_DAY_SLOTS.filter(s => s.day === selectedDay && !s.isPast)
    if (upcoming.length === 0) {
      return MULTI_DAY_SLOTS.filter(s => s.day === 'tomorrow' && !s.isPast)
    }
    return upcoming
  }, [selectedDay])

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0)

  // Manual Time Input Mode
  const [isManualInput, setIsManualInput] = useState(false)
  const [manualTime, setManualTime] = useState('13:00')

  // Detergent state (kept in component logic for backward compatibility, UI commented out)
  const [addDetergent] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Rotary mouse drag interaction refs
  const dialRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)

  const totalSlots = daySlots.length
  const stepAngle = 270 / Math.max(1, totalSlots - 1)

  // Safe index within range
  const safeIndex = Math.min(Math.max(0, selectedSlotIndex), totalSlots - 1)
  const currentSlot = daySlots[safeIndex] || daySlots[0]

  const handleSelectDay = useCallback((day: 'today' | 'tomorrow') => {
    setSelectedDay(day)
    setSelectedSlotIndex(0)
  }, [])

  // Mouse & Touch Pointer Drag Handler (Clean geometric polar angle)
  const updateAngleFromPointer = (clientX: number, clientY: number) => {
    if (!dialRef.current) return
    const rect = dialRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const dx = clientX - cx
    const dy = clientY - cy

    // Angle in degrees: 0 at top (12 o'clock), positive clockwise, negative counter-clockwise
    let deg = Math.atan2(dx, -dy) * (180 / Math.PI)

    // Arc range: -135deg (bottom-left) to +135deg (bottom-right)
    if (deg < -135) deg = -135
    if (deg > 135) deg = 135

    const fraction = (deg + 135) / 270
    const slotIdx = Math.round(fraction * (totalSlots - 1))
    setSelectedSlotIndex(Math.min(Math.max(0, slotIdx), totalSlots - 1))
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    updateAngleFromPointer(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    updateAngleFromPointer(e.clientX, e.clientY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    try {
      ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }

  // Handle Manual Time change from <input type="time" />
  function handleManualTimeChange(val: string) {
    setManualTime(val)
    if (!val) return

    const [hStr, mStr] = val.split(':')
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    const totalMinutes = h * 60 + m

    // Find the closest 30-min slot
    let closestIdx = 0
    let minDiff = Infinity

    daySlots.forEach((slot, i) => {
      const slotMinutes = Math.floor(slot.hour24) * 60 + Math.round((slot.hour24 % 1) * 60)
      const diff = Math.abs(totalMinutes - slotMinutes)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = i
      }
    })

    setSelectedSlotIndex(closestIdx)
  }

  // Daylight state calculations
  const hour = currentSlot.hour24
  let dayPhase = 'Morning Sunrise'
  let phaseIcon = 'wb_twilight'
  let phaseColor = '#fd8451'
  let skyBackground = 'linear-gradient(135deg, rgba(253,132,81,0.18) 0%, rgba(221,232,234,0.9) 80%)'

  // Progress from 7 AM (0) to 9:30 PM (1)
  const daylightProgress = Math.min(1, Math.max(0, (hour - 7) / (21.5 - 7)))

  if (hour < 11.5) {
    dayPhase = 'Morning Sunrise'
    phaseIcon = 'wb_twilight'
    phaseColor = '#fd8451'
    skyBackground = 'linear-gradient(135deg, rgba(253,132,81,0.18) 0%, rgba(221,232,234,0.9) 80%)'
  } else if (hour <= 14.5) {
    dayPhase = 'Midday Zenith (Peak Solar)'
    phaseIcon = 'wb_sunny'
    phaseColor = '#f59e0b'
    skyBackground = 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(221,232,234,0.95) 100%)'
  } else if (hour <= 17.5) {
    dayPhase = 'Afternoon Solar'
    phaseIcon = 'light_mode'
    phaseColor = '#fd8451'
    skyBackground = 'linear-gradient(135deg, rgba(253,132,81,0.15) 0%, rgba(221,232,234,0.9) 100%)'
  } else if (hour <= 19) {
    dayPhase = 'Dusk / Sunset'
    phaseIcon = 'wb_twilight'
    phaseColor = '#ea580c'
    skyBackground = 'linear-gradient(135deg, rgba(234,88,12,0.2) 0%, rgba(11,60,66,0.15) 100%)'
  } else {
    dayPhase = 'Night Battery Buffer'
    phaseIcon = 'bedtime'
    phaseColor = '#a2ced5'
    skyBackground = 'linear-gradient(135deg, rgba(11,60,66,0.3) 0%, rgba(221,232,234,0.9) 100%)'
  }

  const basePrice = bay.rate
  const finalPrice = addDetergent ? basePrice + 200 : basePrice

  function handlePay() {
    if (!currentSlot.isAvailable || currentSlot.isPast) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onConfirmBooking(currentSlot, addDetergent)
    }, 1200)
  }

  // SVG Geometry constants for pure distortion-free rendering
  const cx = 130
  const cy = 130
  const r = 98

  // Active slot coordinates on SVG arc
  const activeAngleDeg = -135 + safeIndex * stepAngle
  const activeRad = ((activeAngleDeg - 90) * Math.PI) / 180
  const activeKnobX = cx + r * Math.cos(activeRad)
  const activeKnobY = cy + r * Math.sin(activeRad)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0b3c42]/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-7 flex flex-col gap-4 relative max-h-[94vh] overflow-y-auto"
        style={{
          background: '#dde8ea',
          boxShadow: '16px 16px 36px #b0bec0, -16px -16px 36px #ffffff',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#b8c6c9]/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-[#fd8451] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
              >
                <span className="material-symbols-outlined text-[13px]">tune</span>
                <span>Rotary Washer Knob</span>
              </span>
              <span className="text-xs text-[#5a7578] font-medium">{bay.hall}</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0b3c42] mt-1">{bay.subname} ({bay.id})</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5a7578] hover:text-[#0b3c42] transition-colors"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 1-Day Advance Booking Day Toggle */}
        <div
          className="p-1 rounded-full flex items-center"
          style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff' }}
        >
          <button
            type="button"
            onClick={() => handleSelectDay('today')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedDay === 'today' ? 'text-white' : 'text-[#5a7578] hover:text-[#0b3c42]'
            }`}
            style={
              selectedDay === 'today'
                ? { background: '#0b3c42', boxShadow: '2px 2px 6px rgba(11,60,66,0.35)' }
                : { background: 'transparent' }
            }
          >
            <span className="material-symbols-outlined text-[15px]">today</span>
            <span>Today (30-Min Cycles)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectDay('tomorrow')}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedDay === 'tomorrow' ? 'text-white' : 'text-[#5a7578] hover:text-[#0b3c42]'
            }`}
            style={
              selectedDay === 'tomorrow'
                ? { background: '#0b3c42', boxShadow: '2px 2px 6px rgba(11,60,66,0.35)' }
                : { background: 'transparent' }
            }
          >
            <span className="material-symbols-outlined text-[15px]">event_upcoming</span>
            <span>Tomorrow (1 Day Ahead)</span>
          </button>
        </div>

        {/* Manual Time Input vs Rotary Toggle Strip */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setIsManualInput(!isManualInput)}
            className="text-[11px] font-bold text-[#fd8451] hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isManualInput ? 'tune' : 'edit_calendar'}
            </span>
            <span>{isManualInput ? 'Switch to Rotary Dial' : 'Or enter custom time manually'}</span>
          </button>

          {isManualInput && (
            <div className="flex items-center gap-1.5 animate-fadeIn">
              <span className="text-[11px] font-bold text-[#0b3c42]">Set Time:</span>
              <input
                type="time"
                value={manualTime}
                onChange={e => handleManualTimeChange(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0b3c42] outline-none"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                  border: '1px solid rgba(184, 198, 201, 0.5)',
                }}
              />
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* THE ROTARY WASHER DIAL & DAYLIGHT HORIZON TRACKER */}
        {/* ============================================================== */}
        <div
          className="rounded-3xl p-4 sm:p-5 flex flex-col items-center gap-2 relative overflow-hidden transition-all duration-700"
          style={{
            background: skyBackground,
            boxShadow: 'inset 4px 4px 12px #b0bec0, inset -4px -4px 12px #ffffff',
          }}
        >
          {/* Streamlined Daylight Sky Horizon & Moving Celestial Body */}
          <div className="w-full flex flex-col items-center gap-1.5 pt-0.5 pb-1">
            <div className="w-full max-w-xs relative h-7 flex items-center justify-between px-2">
              {/* Subtle Horizon Guide Track */}
              <div
                className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 rounded-full pointer-events-none"
                style={{
                  background: 'rgba(11,60,66,0.12)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                }}
              />

              {/* Dynamic Celestial Body (Sun/Moon) smoothly gliding across the horizon */}
              <div
                className="absolute w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ease-out z-10 -translate-y-1/2 top-1/2"
                style={{
                  left: `calc(26px + ${daylightProgress * 100}% * 0.76)`,
                  background: phaseColor,
                  color: '#ffffff',
                  boxShadow: `0 0 12px ${phaseColor}, inset 1px 1px 2px rgba(255,255,255,0.8)`,
                }}
                title={dayPhase}
              >
                <span className="material-symbols-outlined text-[15px]">{phaseIcon}</span>
              </div>

              {/* Horizon Anchor Labels */}
              <span className="relative z-0 text-[10px] font-bold text-[#8aa8ab] uppercase flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">wb_twilight</span> 7 AM
              </span>

              <span className="relative z-0 text-[9px] font-extrabold text-[#5a7578] uppercase tracking-wider flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px] text-[#f59e0b]">sunny</span> 12–1 PM
              </span>

              <span className="relative z-0 text-[10px] font-bold text-[#8aa8ab] uppercase flex items-center gap-0.5">
                9:30 PM <span className="material-symbols-outlined text-[11px]">bedtime</span>
              </span>
            </div>

            {/* Clean Status Pill with Day Phase */}
            <div
              className="px-3.5 py-1 rounded-full flex items-center gap-2 text-xs font-bold text-[#0b3c42]"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff',
              }}
            >
              <span className="material-symbols-outlined text-[15px]" style={{ color: phaseColor }}>
                {phaseIcon}
              </span>
              <span>{dayPhase}</span>
              <span className="text-[#8aa8ab]">•</span>
              <span className="text-[#fd8451] font-extrabold">{currentSlot.startTime}</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SVG ROTARY DIAL: MATHEMATICALLY PERFECT GEOMETRY (ZERO DISTORTION) */}
          {/* ============================================================== */}
          <div className="relative flex items-center justify-center my-1 select-none">
            <svg
              ref={dialRef}
              width="260"
              height="260"
              viewBox="0 0 260 260"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="touch-none cursor-grab active:cursor-grabbing"
              style={{
                filter: 'drop-shadow(6px 6px 14px #b0bec0) drop-shadow(-6px -6px 14px #ffffff)',
              }}
            >
              {/* Outer Beveled Dial Track Ring */}
              <circle
                cx={cx}
                cy={cy}
                r="118"
                fill="#dde8ea"
                stroke="#b8c6c9"
                strokeWidth="1.5"
              />

              {/* Inset Guide Track Arc (270 degrees) */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(11,60,66,0.12)"
                strokeWidth="8"
                strokeDasharray="461"
                strokeDashoffset="115"
                transform={`rotate(135 ${cx} ${cy})`}
                strokeLinecap="round"
              />

              {/* Slot Pips positioned along the 270-deg arc (Only upcoming slots!) */}
              {daySlots.map((slot, i) => {
                const angleDeg = -135 + i * stepAngle
                const rad = ((angleDeg - 90) * Math.PI) / 180
                const pipX = cx + r * Math.cos(rad)
                const pipY = cy + r * Math.sin(rad)
                const isSelected = i === safeIndex

                const pipColor = isSelected
                  ? '#fd8451'
                  : !slot.isAvailable
                  ? '#0b3c42'
                  : '#ffffff'

                return (
                  <circle
                    key={slot.id}
                    cx={pipX}
                    cy={pipY}
                    r={isSelected ? 6 : 3.5}
                    fill={pipColor}
                    stroke={isSelected ? '#ffffff' : '#b8c6c9'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer transition-all duration-150"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedSlotIndex(i)
                    }}
                  />
                )
              })}

              {/* Active Outer Selector Notch (Smoothly glides along the arc) */}
              <circle
                cx={activeKnobX}
                cy={activeKnobY}
                r="13"
                fill="#fd8451"
                stroke="#ffffff"
                strokeWidth="3.5"
                style={{
                  filter: 'drop-shadow(0px 3px 8px rgba(253,132,81,0.7))',
                  transition: isDragging.current ? 'none' : 'cx 180ms ease-out, cy 180ms ease-out',
                }}
              />
              <circle
                cx={activeKnobX}
                cy={activeKnobY}
                r="4.5"
                fill="#ffffff"
                style={{
                  transition: isDragging.current ? 'none' : 'cx 180ms ease-out, cy 180ms ease-out',
                }}
              />

              {/* Directional curved arrows on track indicating rotary turn affordance */}
              <text
                x="32"
                y="190"
                fill="#8aa8ab"
                fontSize="10"
                fontWeight="800"
                fontFamily="sans-serif"
                transform="rotate(-20 32 190)"
              >
                ↻ TURN
              </text>
              <text
                x="200"
                y="190"
                fill="#8aa8ab"
                fontSize="10"
                fontWeight="800"
                fontFamily="sans-serif"
                transform="rotate(20 200 190)"
              >
                TURN ↺
              </text>
            </svg>

            {/* FIXED CENTER INDICATOR WELL (Centered perfectly over the dial) */}
            <div
              className="absolute w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-3 pointer-events-none z-20"
              style={{
                background: '#0b3c42',
                boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.15)',
                color: '#ffffff',
              }}
            >
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#a2ced5]">Selected Slot</span>
              <span className="text-base font-black leading-tight text-white tabular-nums mt-0.5">
                {currentSlot.startTime}
              </span>
              <span className="text-[10px] text-[#a2ced5] leading-none mt-0.5">30-min wash</span>
              <span
                className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-1 ${
                  !currentSlot.isAvailable
                    ? 'bg-red-900/60 text-red-200'
                    : 'bg-emerald-900/60 text-emerald-300'
                }`}
              >
                {!currentSlot.isAvailable ? 'Booked' : 'Available'}
              </span>

              {/* Hand turn micro-icon indicator inside center well */}
              <div className="flex items-center gap-1 text-[8px] text-[#fd8451] uppercase font-bold mt-1 tracking-wider">
                <span className="material-symbols-outlined text-[10px]">drag_handle</span>
                <span>DRAG KNOB</span>
              </div>
            </div>
          </div>

          {/* Stepper Controls & Slot Index */}
          <div className="flex items-center gap-3 w-full justify-between px-2 pt-1">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={() => setSelectedSlotIndex(prev => Math.max(0, prev - 1))}
              className="py-2 px-3.5 rounded-full text-xs font-bold text-[#0b3c42] flex items-center gap-1 transition-all disabled:opacity-40"
              style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>-30 Mins</span>
            </button>

            <span className="text-[11px] font-bold text-[#5a7578] text-center">
              Drag dial or tap pips • {safeIndex + 1}/{totalSlots}
            </span>

            <button
              type="button"
              disabled={safeIndex === totalSlots - 1}
              onClick={() => setSelectedSlotIndex(prev => Math.min(totalSlots - 1, prev + 1))}
              className="py-2 px-3.5 rounded-full text-xs font-bold text-[#0b3c42] flex items-center gap-1 transition-all disabled:opacity-40"
              style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
            >
              <span>+30 Mins</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Selected Slot Information Card (30-min Cycle + 10-min Buffer) */}
        <div
          className="rounded-2xl p-3.5 flex flex-col gap-2"
          style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff' }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#0b3c42] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#fd8451]">schedule</span>
              {currentSlot.timeLabel} ({selectedDay === 'today' ? 'Today' : 'Tomorrow'})
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                currentSlot.isPast
                  ? 'text-[#8aa8ab]'
                  : !currentSlot.isAvailable
                  ? 'text-red-700'
                  : 'text-emerald-700'
              }`}
              style={{ background: '#dde8ea', boxShadow: 'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff' }}
            >
              {currentSlot.isPast ? 'Slot Ended' : !currentSlot.isAvailable ? 'Taken by Another Student' : 'Open for Booking'}
            </span>
          </div>

          <div
            className="w-full h-7 rounded-full p-0.5 flex gap-1 items-center"
            style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b0bec0, inset -2px -2px 5px #ffffff' }}
          >
            <div
              className="h-full rounded-l-full flex items-center justify-center text-[10px] font-extrabold text-white px-2 tracking-wide"
              style={{ width: '75%', background: '#0b3c42' }}
            >
              <span>30m Wash</span>
            </div>
            <div
              className="h-full rounded-r-full flex items-center justify-center text-[10px] font-extrabold text-white px-2 tracking-wide"
              style={{ width: '25%', background: '#fd8451' }}
            >
              <span>10m Unload Buffer</span>
            </div>
          </div>
        </div>

        {/* Detergent Addon Checkbox - Commented out as requested */}
        {/*
        <label
          className="rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all select-none"
          style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff' }}
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={addDetergent}
              onChange={e => setAddDetergent(e.target.checked)}
              className="w-4 h-4 rounded text-[#0b3c42] accent-[#fd8451] cursor-pointer"
            />
            <div>
              <div className="text-[12px] font-bold text-[#0b3c42] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#fd8451]">soap</span>
                <span>Add Detergent Pod + Softener Kit</span>
              </div>
              <div className="text-[10px] text-[#5a7578]">Automatic chamber release inside drum</div>
            </div>
          </div>
          <span className="text-xs font-extrabold text-[#fd8451]">+₦200</span>
        </label>
        */}

        {/* Pricing Summary & Checkout Button */}
        <div className="flex flex-col gap-2.5 pt-1 border-t border-[#b8c6c9]/40">
          <div className="flex items-center justify-between text-sm font-extrabold text-[#0b3c42]">
            <span>Total Payable ({selectedDay === 'today' ? 'Today' : 'Tomorrow'})</span>
            <span className="text-lg text-[#fd8451]">₦{finalPrice.toLocaleString()}</span>
          </div>

          <button
            type="button"
            disabled={!currentSlot.isAvailable || currentSlot.isPast || isProcessing}
            onClick={handlePay}
            className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-white text-sm"
            style={{
              background: '#fd8451',
              boxShadow: '5px 5px 14px rgba(253,132,81,0.45), -3px -3px 8px rgba(255,255,255,0.5)',
              opacity: (!currentSlot.isAvailable || currentSlot.isPast || isProcessing) ? 0.45 : 1,
              cursor: (!currentSlot.isAvailable || currentSlot.isPast) ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            <span>
              {isProcessing
                ? 'Securing Slot & Keypad PIN…'
                : currentSlot.isPast
                ? 'Select an Upcoming Slot'
                : !currentSlot.isAvailable
                ? 'Slot Already Booked'
                : `Pay ₦${finalPrice.toLocaleString()} for ${currentSlot.startTime}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
