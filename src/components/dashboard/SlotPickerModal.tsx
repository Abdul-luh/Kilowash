import { useState, useMemo } from 'react'
import type { Bay, BookingSlot } from '../../data/mockDashboard'
import { generate24HourSlotsForDate } from '../../data/mockDashboard'

interface SlotPickerModalProps {
  bay: Bay
  isOpen: boolean
  onClose: () => void
  onConfirmBooking: (slot: BookingSlot, addDetergent: boolean) => void
}

type TimePeriodFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'night'

export default function SlotPickerModal({
  bay,
  isOpen,
  onClose,
  onConfirmBooking,
}: SlotPickerModalProps) {
  // Selected date state (defaults to Today)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  // Selected slot within the chosen day
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)

  // Period filter for quick filtering (All 48 slots, or by time of day)
  const [periodFilter, setPeriodFilter] = useState<TimePeriodFilter>('all')

  // Booking processing state
  const [isProcessing, setIsProcessing] = useState(false)

  // Helper to test if a date is today
  const isDateToday = useMemo(() => {
    const now = new Date()
    return (
      selectedDate.getFullYear() === now.getFullYear() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getDate() === now.getDate()
    )
  }, [selectedDate])

  // Generate 24-hour slots (48 total) for the selected date
  const daySlots = useMemo(() => {
    return generate24HourSlotsForDate(selectedDate)
  }, [selectedDate])

  // Auto-select the first available slot when date changes (if no valid selection)
  useMemo(() => {
    if (!selectedSlot || selectedSlot.dateStr !== selectedDate.toISOString().split('T')[0]) {
      const firstAvailable = daySlots.find(s => s.isAvailable)
      setSelectedSlot(firstAvailable || null)
    }
  }, [daySlots, selectedDate, selectedSlot])

  // Filter slots by time period
  const filteredSlots = useMemo(() => {
    if (periodFilter === 'all') return daySlots
    if (periodFilter === 'morning') return daySlots.filter(s => s.hour24 >= 6 && s.hour24 < 12)
    if (periodFilter === 'afternoon') return daySlots.filter(s => s.hour24 >= 12 && s.hour24 < 17)
    if (periodFilter === 'evening') return daySlots.filter(s => s.hour24 >= 17 && s.hour24 < 21)
    if (periodFilter === 'night') return daySlots.filter(s => s.hour24 >= 21 || s.hour24 < 6)
    return daySlots
  }, [daySlots, periodFilter])

  // Slot counts for summary
  const availableCount = useMemo(() => daySlots.filter(s => s.isAvailable).length, [daySlots])
  const bookedCount = useMemo(() => daySlots.filter(s => s.isBooked).length, [daySlots])
  const passedCount = useMemo(() => daySlots.filter(s => s.isPast).length, [daySlots])

  // Multi-day date horizontal list (Generate 14 days starting from today or current date window)
  const upcomingDays = useMemo(() => {
    const list = []
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      list.push(d)
    }
    return list
  }, [])

  // Handlers for Next Day and Previous Day
  function handleNextDay() {
    setSelectedDate(prev => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + 1)
      return next
    })
  }

  function handlePrevDay() {
    if (isDateToday) return
    setSelectedDate(prev => {
      const prevDay = new Date(prev)
      prevDay.setDate(prev.getDate() - 1)
      return prevDay
    })
  }

  function handleSelectDate(date: Date) {
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    setSelectedDate(target)
  }

  function handleSelectSlot(slot: BookingSlot) {
    if (!slot.isAvailable) return
    setSelectedSlot(slot)
  }

  function handleConfirm() {
    if (!selectedSlot || !selectedSlot.isAvailable) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onConfirmBooking(selectedSlot, false)
    }, 1000)
  }

  if (!isOpen) return null

  // Date formatted strings
  const formattedSelectedDate = selectedDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0b3c42]/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-3xl p-4 sm:p-7 flex flex-col gap-4 relative max-h-[92vh] overflow-y-auto"
        style={{
          background: '#dde8ea',
          boxShadow: '16px 16px 36px #b0bec0, -16px -16px 36px #ffffff',
        }}
      >
        {/* ============================================================== */}
        {/* MODAL HEADER */}
        {/* ============================================================== */}
        <div className="flex items-start justify-between gap-3 border-b border-[#b8c6c9]/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-[#fd8451] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
              >
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                <span>24-Hour Schedule Calendar</span>
              </span>
              <span className="text-xs text-[#5a7578] font-semibold">{bay.hall}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b3c42] mt-1">
              {bay.subname} ({bay.id})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5a7578] hover:text-[#0b3c42] transition-colors shrink-0"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
            aria-label="Close scheduler"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* CALENDAR DATE NAVIGATION & MULTI-DAY STRIP */}
        {/* ============================================================== */}
        <div
          className="rounded-3xl p-3.5 sm:p-4 flex flex-col gap-3"
          style={{
            background: '#dde8ea',
            boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
          }}
        >
          {/* Month / Date Banner with Next Day Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab]">
                Select Booking Date
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-[#0b3c42] leading-tight">
                {formattedSelectedDate}
                {isDateToday && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-[#0b3c42] text-white text-[10px] font-bold uppercase tracking-wider">
                    Today
                  </span>
                )}
              </h3>
            </div>

            {/* Next / Previous Day Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isDateToday}
                onClick={handlePrevDay}
                className={`py-1.5 px-3 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                  isDateToday
                    ? 'opacity-35 cursor-not-allowed text-[#8aa8ab]'
                    : 'text-[#0b3c42] hover:text-[#fd8451] active:scale-95'
                }`}
                style={{
                  background: '#dde8ea',
                  boxShadow: isDateToday
                    ? 'none'
                    : '3px 3px 6px #b8c6c9, -3px -3px 6px #ffffff',
                }}
                title="Previous Day"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span className="hidden sm:inline">Prev Day</span>
              </button>

              <button
                type="button"
                onClick={handleNextDay}
                className="py-1.5 px-3.5 rounded-full text-xs font-bold text-white flex items-center gap-1 transition-all active:scale-95"
                style={{
                  background: '#0b3c42',
                  boxShadow: '3px 3px 8px rgba(11,60,66,0.35), -2px -2px 6px #ffffff',
                }}
                title="Next Day"
              >
                <span>Next Day</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Horizontal Interactive Date Picker Strip (Next day and the next day...) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
            {upcomingDays.map((d, idx) => {
              const isSelected =
                d.getDate() === selectedDate.getDate() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getFullYear() === selectedDate.getFullYear()

              const isDayToday = idx === 0
              const dayName = isDayToday
                ? 'Today'
                : d.toLocaleDateString('en-GB', { weekday: 'short' })
              const dayNum = d.getDate()
              const monthName = d.toLocaleDateString('en-GB', { month: 'short' })

              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => handleSelectDate(d)}
                  className={`py-2 px-3.5 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[62px] transition-all cursor-pointer ${
                    isSelected ? 'text-white' : 'text-[#0b3c42] hover:text-[#fd8451]'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: '#fd8451',
                          boxShadow:
                            '4px 4px 10px rgba(253,132,81,0.45), -2px -2px 6px rgba(255,255,255,0.6)',
                        }
                      : {
                          background: '#dde8ea',
                          boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff',
                        }
                  }
                >
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider ${
                      isSelected ? 'text-white/90' : 'text-[#8aa8ab]'
                    }`}
                  >
                    {dayName}
                  </span>
                  <span className="text-base font-black leading-tight mt-0.5">
                    {dayNum}
                  </span>
                  <span
                    className={`text-[9px] font-bold ${
                      isSelected ? 'text-white/80' : 'text-[#5a7578]'
                    }`}
                  >
                    {monthName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TIME PERIOD QUICK JUMP TABS & METRICS */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-1">
          {/* Quick Filter Periods */}
          <div
            className="p-1 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar"
            style={{
              background: '#dde8ea',
              boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
            }}
          >
            {[
              { id: 'all', label: 'All 24h (48)', icon: 'schedule' },
              { id: 'morning', label: 'Morning (6A–12P)', icon: 'wb_twilight' },
              { id: 'afternoon', label: 'Afternoon (12P–5P)', icon: 'sunny' },
              { id: 'evening', label: 'Evening (5P–9P)', icon: 'wb_sunny' },
              { id: 'night', label: 'Night (9P–6A)', icon: 'bedtime' },
            ].map(tab => {
              const active = periodFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPeriodFilter(tab.id as TimePeriodFilter)}
                  className={`py-1.5 px-2.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 shrink-0 transition-all ${
                    active ? 'text-white' : 'text-[#5a7578] hover:text-[#0b3c42]'
                  }`}
                  style={
                    active
                      ? {
                          background: '#0b3c42',
                          boxShadow: '2px 2px 6px rgba(11,60,66,0.3)',
                        }
                      : {}
                  }
                >
                  <span className="material-symbols-outlined text-[13px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Slot Availability Legend */}
          <div className="flex items-center gap-3 text-[11px] font-bold text-[#5a7578] px-1 self-end sm:self-auto">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>{availableCount} Open</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
              <span>{bookedCount} Booked</span>
            </span>
            {passedCount > 0 && (
              <span className="flex items-center gap-1 text-[#8aa8ab]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b8c6c9] inline-block" />
                <span>{passedCount} Passed</span>
              </span>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 24-HOUR 30-MIN SLOTS GRID (CALENDLY STYLE WITH CHECKBOXES) */}
        {/* ============================================================== */}
        <div
          className="rounded-3xl p-3 sm:p-4 max-h-[380px] overflow-y-auto flex flex-col gap-2"
          style={{
            background: '#dde8ea',
            boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredSlots.map(slot => {
              const isSelected = selectedSlot?.id === slot.id
              const isPast = slot.isPast
              const isBooked = slot.isBooked
              const isAvailable = slot.isAvailable

              // Determine daylight / power state for slot
              const isPeakSolar = slot.hour24 >= 11 && slot.hour24 <= 15
              const isNight = slot.hour24 >= 20 || slot.hour24 < 6

              return (
                <div
                  key={slot.id}
                  onClick={() => isAvailable && handleSelectSlot(slot)}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-2.5 transition-all select-none ${
                    isPast
                      ? 'opacity-40 cursor-not-allowed'
                      : isBooked
                      ? 'opacity-65 cursor-not-allowed'
                      : isSelected
                      ? 'cursor-pointer text-white ring-2 ring-[#fd8451]'
                      : 'cursor-pointer text-[#0b3c42] hover:scale-[1.01]'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: '#0b3c42',
                          boxShadow: '4px 4px 12px rgba(11,60,66,0.35), -2px -2px 6px #ffffff',
                        }
                      : isPast || isBooked
                      ? {
                          background: '#d4e0e2',
                          boxShadow: 'inset 2px 2px 5px #bcc9cc, inset -2px -2px 5px #ffffff',
                        }
                      : {
                          background: '#dde8ea',
                          boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff',
                        }
                  }
                >
                  {/* Left: Checkbox Icon & Time Range */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Checkbox indicator */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#fd8451] text-white shadow-sm'
                          : isPast || isBooked
                          ? 'bg-transparent text-[#8aa8ab]'
                          : 'bg-[#dde8ea] text-[#8aa8ab]'
                      }`}
                      style={
                        !isSelected
                          ? {
                              boxShadow:
                                'inset 1px 1px 3px #b8c6c9, inset -1px -1px 3px #ffffff',
                            }
                          : {}
                      }
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSelected
                          ? 'check'
                          : isPast
                          ? 'lock_clock'
                          : isBooked
                          ? 'block'
                          : 'schedule'}
                      </span>
                    </div>

                    {/* Time Text */}
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs font-black tracking-tight leading-tight tabular-nums ${
                          isSelected ? 'text-white' : 'text-[#0b3c42]'
                        }`}
                      >
                        {slot.startTime}
                      </span>
                      <span
                        className={`text-[10px] leading-tight truncate ${
                          isSelected ? 'text-[#a2ced5]' : 'text-[#5a7578]'
                        }`}
                      >
                        until {slot.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Right: Status Pill or Solar Tag */}
                  <div className="flex flex-col items-end shrink-0">
                    {isPast ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#b8c6c9]/40 text-[#5a7578]">
                        Passed
                      </span>
                    ) : isBooked ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/15 text-amber-800">
                        Booked
                      </span>
                    ) : isSelected ? (
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase bg-[#fd8451] text-white flex items-center gap-1">
                        <span>Selected</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        {isPeakSolar && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase text-[#fd8451] flex items-center gap-0.5"
                            style={{
                              background: '#dde8ea',
                              boxShadow:
                                'inset 1px 1px 2px #b8c6c9, inset -1px -1px 2px #ffffff',
                            }}
                            title="Peak Solar Window"
                          >
                            <span className="material-symbols-outlined text-[11px]">sunny</span>
                            <span>Peak</span>
                          </span>
                        )}
                        {isNight && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase text-[#5a7578] flex items-center gap-0.5"
                            style={{
                              background: '#dde8ea',
                              boxShadow:
                                'inset 1px 1px 2px #b8c6c9, inset -1px -1px 2px #ffffff',
                            }}
                            title="100% Inverter Buffer"
                          >
                            <span className="material-symbols-outlined text-[11px]">bedtime</span>
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-[#fd8451]">
                          ₦{bay.rate.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredSlots.length === 0 && (
            <div className="py-8 flex flex-col items-center justify-center text-center text-xs text-[#5a7578] gap-2">
              <span className="material-symbols-outlined text-[28px] text-[#8aa8ab]">
                event_busy
              </span>
              <span>No slots in this time window. Try selecting "All 24h" above.</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SELECTED SLOT SUMMARY & CONFIRM CHECKOUT BAR */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-3 pt-1 border-t border-[#b8c6c9]/40">
          {selectedSlot ? (
            <div
              className="p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{
                    background: '#fd8451',
                    boxShadow: '2px 2px 6px rgba(253,132,81,0.4)',
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab]">
                    Selected Booking Window
                  </span>
                  <div className="text-xs sm:text-sm font-extrabold text-[#0b3c42] flex items-center gap-1.5 flex-wrap">
                    <span>{selectedSlot.dayLabel}</span>
                    <span>•</span>
                    <span className="text-[#fd8451]">{selectedSlot.timeLabel}</span>
                  </div>
                  <span className="text-[10px] text-[#5a7578] mt-0.5">
                    30-Min Inverter Wash + 10-Min Grace Unload Buffer
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#b8c6c9]/30">
                <span className="text-[10px] uppercase font-bold text-[#8aa8ab]">
                  Rate
                </span>
                <span className="text-base font-black text-[#fd8451]">
                  ₦{bay.rate.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="p-3 rounded-xl text-center text-xs font-semibold text-[#5a7578]"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
              }}
            >
              Please pick any available 30-minute time slot from the schedule above.
            </div>
          )}

          {/* Checkout CTA */}
          <button
            type="button"
            disabled={!selectedSlot || !selectedSlot.isAvailable || isProcessing}
            onClick={handleConfirm}
            className={`w-full py-3.5 px-4 rounded-full flex items-center justify-center gap-2 font-bold text-white text-sm transition-all active:scale-98 ${
              !selectedSlot || !selectedSlot.isAvailable || isProcessing
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            style={{
              background: '#fd8451',
              boxShadow:
                '5px 5px 14px rgba(253,132,81,0.45), -3px -3px 8px rgba(255,255,255,0.5)',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            <span>
              {isProcessing
                ? 'Reserving Slot & Generating Keypad PIN…'
                : selectedSlot
                ? `Confirm & Pay ₦${bay.rate.toLocaleString()} for ${selectedSlot.startTime}`
                : 'Select an Available Slot to Continue'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
