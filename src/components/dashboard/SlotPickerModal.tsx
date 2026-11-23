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
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today')

  const daySlots = useMemo(() => {
    return MULTI_DAY_SLOTS.filter(s => s.day === selectedDay)
  }, [selectedDay])

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(() => {
    const idx = MULTI_DAY_SLOTS.filter(s => s.day === 'today').findIndex(s => s.isAvailable && !s.isPast)
    return idx >= 0 ? idx : 0
  })

  // Manual Time Input Mode
  const [isManualInput, setIsManualInput] = useState(false)
  const [manualTime, setManualTime] = useState('13:00')

  const [addDetergent, setAddDetergent] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Rotary mouse drag interaction refs
  const knobRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const totalSlots = daySlots.length
  const stepAngle = 270 / Math.max(1, totalSlots - 1)

  // Safe index within range
  const safeIndex = Math.min(Math.max(0, selectedSlotIndex), totalSlots - 1)
  const currentSlot = daySlots[safeIndex] || daySlots[0]

  // Angle of the rotating outer ring
  const currentRotation = -135 + safeIndex * stepAngle

  const handleSelectDay = useCallback((day: 'today' | 'tomorrow') => {
    setSelectedDay(day)
    const newSlots = MULTI_DAY_SLOTS.filter(s => s.day === day)
    const firstOpen = newSlots.findIndex(s => s.isAvailable && !s.isPast)
    setSelectedSlotIndex(firstOpen >= 0 ? firstOpen : 0)
  }, [])

  // Mouse / Touch Dragging Handler on the Outer Rotary Ring
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    handlePointerMove(e)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !knobRef.current) return

    const rect = knobRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = e.clientX - centerX
    const dy = e.clientY - centerY

    // Angle in degrees from 12 o'clock (-180 to 180)
    let angleDeg = Math.atan2(dx, -dy) * (180 / Math.PI)

    // Clamp angle to the 270-degree range (-135deg to +135deg)
    if (angleDeg < -135) angleDeg = -135
    if (angleDeg > 135) angleDeg = 135

    // Map angle to slot index
    const normalized = (angleDeg + 135) / 270
    const slotIdx = Math.round(normalized * (totalSlots - 1))
    setSelectedSlotIndex(Math.min(Math.max(0, slotIdx), totalSlots - 1))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
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
  // hour24 ranges from 7.0 (morning) to 21.5 (night)
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

  // Smooth arc for Sun & Moon
  const arcRad = Math.PI - daylightProgress * Math.PI
  const celestialX = 50 + 40 * Math.cos(arcRad)
  const celestialY = 70 - 45 * Math.sin(arcRad)

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
        {/* THE ROTARY WASHER DIAL & DAYLIGHT CELESTIAL SKY DOME */}
        {/* ============================================================== */}
        <div
          className="rounded-3xl p-4 sm:p-5 flex flex-col items-center gap-3 relative overflow-hidden transition-all duration-700"
          style={{
            background: skyBackground,
            boxShadow: 'inset 4px 4px 12px #b0bec0, inset -4px -4px 12px #ffffff',
          }}
        >
          {/* Daylight Horizon Arch & Sun/Moon Orb */}
          <div className="w-full h-20 relative flex items-center justify-center">
            {/* Dashed trajectory arc of the sun / moon */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 90">
              <path
                d="M 20 80 Q 100 10 180 80"
                fill="none"
                stroke="rgba(11,60,66,0.18)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            </svg>

            {/* Dynamic Moving Celestial Body (Sun or Moon) */}
            <div
              className="absolute w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ease-out z-10"
              style={{
                left: `${celestialX}%`,
                top: `${celestialY}%`,
                transform: 'translate(-50%, -50%)',
                background: phaseColor,
                color: '#ffffff',
                boxShadow: `0 0 16px ${phaseColor}, inset 1px 1px 3px rgba(255,255,255,0.8)`,
              }}
            >
              <span className="material-symbols-outlined text-[18px]">{phaseIcon}</span>
            </div>

            {/* Horizon indicator tags */}
            <span className="absolute bottom-1 left-2 text-[10px] font-bold text-[#8aa8ab] uppercase flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">wb_twilight</span> 7 AM
            </span>
            <span className="absolute top-1 text-[10px] font-extrabold text-[#0b3c42] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#f59e0b]">sunny</span> 12–1 PM Peak
            </span>
            <span className="absolute bottom-1 right-2 text-[10px] font-bold text-[#8aa8ab] uppercase flex items-center gap-0.5">
              9:30 PM <span className="material-symbols-outlined text-[12px]">bedtime</span>
            </span>
          </div>

          {/* Current Solar / Daylight Status Bar */}
          <div
            className="px-4 py-1 rounded-full flex items-center gap-2 text-xs font-bold text-[#0b3c42]"
            style={{
              background: '#dde8ea',
              boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
            }}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ color: phaseColor }}>
              {phaseIcon}
            </span>
            <span>{dayPhase}</span>
            <span className="text-[#8aa8ab]">•</span>
            <span className="text-[#fd8451]">{currentSlot.startTime}</span>
          </div>

          {/* ============================================================== */}
          {/* THE ROTARY KNOB: FIXED CENTER INDICATOR + ROTATING OUTER RING */}
          {/* ============================================================== */}
          <div
            ref={knobRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative flex items-center justify-center my-2 select-none touch-none cursor-grab active:cursor-grabbing"
            style={{ width: '220px', height: '220px' }}
          >
            {/* 1. ROTATING OUTER KNOB RING (Turns as you drag or step) */}
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center transition-transform duration-200 ease-out"
              style={{
                background: '#dde8ea',
                boxShadow: '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff',
                transform: `rotate(${currentRotation}deg)`,
              }}
            >
              {/* Outer grooved tactile grip teeth */}
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#b8c6c9]/60" />

              {/* 30-Minute Interval Tick Pips along the outer edge */}
              {daySlots.map((slot, i) => {
                const angle = -135 + i * stepAngle
                const isSelected = i === safeIndex

                return (
                  <div
                    key={slot.id}
                    className="absolute w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -98px)`,
                      background: isSelected
                        ? '#fd8451'
                        : slot.isPast
                        ? '#c0c8c9'
                        : !slot.isAvailable
                        ? '#0b3c42'
                        : '#ffffff',
                      boxShadow: isSelected
                        ? '0 0 10px #fd8451'
                        : '1px 1px 3px #b8c6c9',
                    }}
                  />
                )
              })}

              {/* The Orange Pointer Notch attached to the outer rotating ring */}
              <div
                className="absolute -top-3 w-3.5 h-6 rounded-full"
                style={{
                  background: '#fd8451',
                  boxShadow: '0 2px 8px rgba(253,132,81,0.7)',
                }}
              />
            </div>

            {/* 2. FIXED CENTER INDICATOR WELL (Always upright in the middle) */}
            <div
              className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center text-center p-3 pointer-events-none z-20"
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
                  currentSlot.isPast
                    ? 'bg-white/10 text-[#8aa8ab]'
                    : !currentSlot.isAvailable
                    ? 'bg-red-900/60 text-red-200'
                    : 'bg-emerald-900/60 text-emerald-300'
                }`}
              >
                {currentSlot.isPast ? 'Passed' : !currentSlot.isAvailable ? 'Booked' : 'Available'}
              </span>
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
              Drag knob or tap buttons • {safeIndex + 1}/{totalSlots}
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

        {/* Detergent Addon Checkbox */}
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
