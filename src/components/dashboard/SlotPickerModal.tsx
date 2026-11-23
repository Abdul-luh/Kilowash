import { useState, useMemo } from 'react'
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

  const [addDetergent, setAddDetergent] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  // Ensure index is within current day's range
  const safeIndex = Math.min(Math.max(0, selectedSlotIndex), daySlots.length - 1)
  const currentSlot = daySlots[safeIndex] || daySlots[0]

  const basePrice = bay.rate
  const finalPrice = addDetergent ? basePrice + 200 : basePrice

  function handleSelectDay(day: 'today' | 'tomorrow') {
    setSelectedDay(day)
    const newSlots = MULTI_DAY_SLOTS.filter(s => s.day === day)
    const firstOpen = newSlots.findIndex(s => s.isAvailable && !s.isPast)
    setSelectedSlotIndex(firstOpen >= 0 ? firstOpen : 0)
  }

  // Rotary rotation angle: spread slots along a 270-degree arc (-135deg to +135deg)
  const totalSlots = daySlots.length
  const stepAngle = 270 / Math.max(1, totalSlots - 1)
  const currentAngle = -135 + safeIndex * stepAngle

  function rotatePrev() {
    if (safeIndex > 0) {
      setSelectedSlotIndex(safeIndex - 1)
    }
  }

  function rotateNext() {
    if (safeIndex < totalSlots - 1) {
      setSelectedSlotIndex(safeIndex + 1)
    }
  }

  // Daylight state calculations
  // hour24 goes from 8 (morning) to 20 (night)
  const hour = currentSlot.hour24
  let dayPhase = 'Morning Sun'
  let phaseIcon = 'wb_sunny'
  let phaseColor = '#fd8451'
  let skyBackground = 'linear-gradient(135deg, #f6f0dd 0%, #dde8ea 100%)' // gentle sunrise glow

  // Sun / Moon arc progress (0 = far left / morning, 0.5 = zenith / 12-1pm, 1.0 = evening / night)
  const daylightProgress = (hour - 8) / (20 - 8) // 0 to 1

  if (hour < 11) {
    dayPhase = 'Morning Sunrise'
    phaseIcon = 'wb_twilight'
    phaseColor = '#fd8451'
    skyBackground = 'linear-gradient(135deg, rgba(253,132,81,0.18) 0%, rgba(221,232,234,0.9) 80%)'
  } else if (hour <= 14) {
    dayPhase = 'Midday Zenith (Peak Solar)'
    phaseIcon = 'wb_sunny'
    phaseColor = '#f59e0b'
    skyBackground = 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(221,232,234,0.95) 100%)'
  } else if (hour <= 17) {
    dayPhase = 'Afternoon Sun'
    phaseIcon = 'light_mode'
    phaseColor = '#fd8451'
    skyBackground = 'linear-gradient(135deg, rgba(253,132,81,0.15) 0%, rgba(221,232,234,0.9) 100%)'
  } else if (hour <= 18) {
    dayPhase = 'Sunset / Dusk'
    phaseIcon = 'wb_twilight'
    phaseColor = '#ea580c'
    skyBackground = 'linear-gradient(135deg, rgba(234,88,12,0.2) 0%, rgba(11,60,66,0.15) 100%)'
  } else {
    dayPhase = 'Night Battery Buffer'
    phaseIcon = 'bedtime'
    phaseColor = '#a2ced5'
    skyBackground = 'linear-gradient(135deg, rgba(11,60,66,0.3) 0%, rgba(221,232,234,0.9) 100%)'
  }

  // Calculate sun/moon position along a circular arc in the sky dome
  // Angle from Math.PI (left) to 0 (right)
  const arcRad = Math.PI - daylightProgress * Math.PI
  const celestialX = 50 + 40 * Math.cos(arcRad) // 10% to 90%
  const celestialY = 70 - 45 * Math.sin(arcRad) // rises high in middle

  function handlePay() {
    if (!currentSlot.isAvailable || currentSlot.isPast) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onConfirmBooking(currentSlot, addDetergent)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0b3c42]/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-7 flex flex-col gap-5 relative max-h-[94vh] overflow-y-auto"
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
                <span>Rotary Timer</span>
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
            <span>Today's Slots</span>
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
            <span>Tomorrow (Advance)</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* THE ROTARY DIAL WITH CELESTIAL DAYLIGHT PROGRESS DOME */}
        {/* ============================================================== */}
        <div
          className="rounded-3xl p-5 flex flex-col items-center gap-4 relative overflow-hidden transition-all duration-700"
          style={{
            background: skyBackground,
            boxShadow: 'inset 4px 4px 12px #b0bec0, inset -4px -4px 12px #ffffff',
          }}
        >
          {/* Daylight Horizon Arch & Sun/Moon Orb */}
          <div className="w-full h-24 relative flex items-center justify-center">
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
              className="absolute w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-out z-10"
              style={{
                left: `${celestialX}%`,
                top: `${celestialY}%`,
                transform: 'translate(-50%, -50%)',
                background: phaseColor,
                color: '#ffffff',
                boxShadow: `0 0 16px ${phaseColor}, inset 1px 1px 3px rgba(255,255,255,0.8)`,
              }}
            >
              <span className="material-symbols-outlined text-[20px]">{phaseIcon}</span>
            </div>

            {/* Horizon indicator tags */}
            <span className="absolute bottom-1 left-3 text-[10px] font-bold text-[#8aa8ab] uppercase flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">wb_twilight</span> 8 AM
            </span>
            <span className="absolute top-1 text-[10px] font-extrabold text-[#0b3c42] uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#f59e0b]">sunny</span> 12–1 PM Peak
            </span>
            <span className="absolute bottom-1 right-3 text-[10px] font-bold text-[#8aa8ab] uppercase flex items-center gap-0.5">
              8 PM <span className="material-symbols-outlined text-[12px]">bedtime</span>
            </span>
          </div>

          {/* Current Solar / Daylight Status Bar */}
          <div
            className="px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-[#0b3c42]"
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

          {/* The Physical Rotary Knob */}
          <div className="relative flex items-center justify-center my-2 select-none">
            {/* Outer tactile beveled well */}
            <div
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full p-3 flex items-center justify-center relative"
              style={{
                background: '#dde8ea',
                boxShadow: '10px 10px 24px #b0bec0, -10px -10px 24px #ffffff',
              }}
            >
              {/* Outer tick marks representing slots */}
              {daySlots.map((slot, i) => {
                const angle = -135 + i * stepAngle
                const isCurrent = i === safeIndex
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotIndex(i)}
                    className="absolute w-2.5 h-2.5 rounded-full transition-all"
                    style={{
                      transform: `rotate(${angle}deg) translate(0, -96px) rotate(${-angle}deg)`,
                      background: isCurrent
                        ? '#fd8451'
                        : slot.isPast
                        ? '#c0c8c9'
                        : !slot.isAvailable
                        ? '#0b3c42'
                        : '#ffffff',
                      boxShadow: isCurrent
                        ? '0 0 8px #fd8451'
                        : '1px 1px 3px #b8c6c9',
                    }}
                    title={`${slot.timeLabel} (${slot.isPast ? 'Passed' : !slot.isAvailable ? 'Booked' : 'Open'})`}
                  />
                )
              })}

              {/* Rotary Knob Core Body */}
              <div
                className="w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center relative cursor-grab active:cursor-grabbing transition-transform duration-300 ease-out"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 5px 5px 12px #b0bec0, inset -5px -5px 12px #ffffff',
                  transform: `rotate(${currentAngle}deg)`,
                }}
              >
                {/* Pointer Needle pointing to active slot */}
                <div
                  className="absolute -top-3 w-3 h-6 rounded-full"
                  style={{
                    background: '#fd8451',
                    boxShadow: '0 2px 6px rgba(253,132,81,0.6)',
                  }}
                />

                {/* Gripping ridges around knob */}
                <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed border-[#b8c6c9]/50">
                  <span className="material-symbols-outlined text-[28px] text-[#0b3c42]/40">
                    rotate_right
                  </span>
                </div>
              </div>

              {/* Center Counter Display (Counter-rotated so text stays upright) */}
              <div
                className="absolute w-28 h-28 rounded-full flex flex-col items-center justify-center text-center p-2 pointer-events-none"
                style={{
                  background: '#0b3c42',
                  boxShadow: '4px 4px 10px rgba(0,0,0,0.35), inset 1px 1px 2px rgba(255,255,255,0.2)',
                  color: '#ffffff',
                }}
              >
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#a2ced5]">Selected</span>
                <span className="text-sm font-black leading-tight text-white tabular-nums">
                  {currentSlot.startTime}
                </span>
                <span className="text-[9px] font-bold text-[#fd8451] uppercase mt-0.5">
                  {currentSlot.isPast ? 'Passed' : !currentSlot.isAvailable ? 'Booked' : 'Available'}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Buttons for precise clicking */}
          <div className="flex items-center gap-3 w-full justify-between px-4">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={rotatePrev}
              className="py-2 px-4 rounded-full text-xs font-bold text-[#0b3c42] flex items-center gap-1 transition-all disabled:opacity-40"
              style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              <span>Earlier</span>
            </button>

            <span className="text-xs font-bold text-[#5a7578]">
              Slot {safeIndex + 1} of {totalSlots}
            </span>

            <button
              type="button"
              disabled={safeIndex === totalSlots - 1}
              onClick={rotateNext}
              className="py-2 px-4 rounded-full text-xs font-bold text-[#0b3c42] flex items-center gap-1 transition-all disabled:opacity-40"
              style={{ background: '#dde8ea', boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff' }}
            >
              <span>Later</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Selected Slot Information Card */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-2"
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
            className="w-full h-7 rounded-full p-0.5 flex gap-1 items-center mt-1"
            style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b0bec0, inset -2px -2px 5px #ffffff' }}
          >
            <div
              className="h-full rounded-l-full flex items-center justify-center text-[10px] font-extrabold text-white px-2 tracking-wide"
              style={{ width: '78%', background: '#0b3c42' }}
            >
              <span>35m Wash</span>
            </div>
            <div
              className="h-full rounded-r-full flex items-center justify-center text-[10px] font-extrabold text-white px-2 tracking-wide"
              style={{ width: '22%', background: '#fd8451' }}
            >
              <span>10m Buffer</span>
            </div>
          </div>
        </div>

        {/* Detergent Addon Checkbox */}
        <label
          className="rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all select-none"
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
        <div className="flex flex-col gap-3 pt-2 border-t border-[#b8c6c9]/40">
          <div className="flex items-center justify-between text-sm font-extrabold text-[#0b3c42]">
            <span>
              Total Payable ({selectedDay === 'today' ? 'Today' : 'Tomorrow'})
            </span>
            <span className="text-lg text-[#fd8451]">₦{finalPrice.toLocaleString()}</span>
          </div>

          <button
            type="button"
            disabled={!currentSlot.isAvailable || currentSlot.isPast || isProcessing}
            onClick={handlePay}
            className="w-full py-4 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-white text-sm"
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

          <p className="text-[11px] text-[#5a7578] text-center flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-700">lock</span>
            Instant 4-digit keypad PIN generated upon payment
          </p>
        </div>
      </div>
    </div>
  )
}
