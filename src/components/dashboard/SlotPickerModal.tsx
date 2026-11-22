import { useState } from 'react'
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

  const daySlots = MULTI_DAY_SLOTS.filter(s => s.day === selectedDay)

  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(
    daySlots.find(s => s.isAvailable) || null
  )
  const [addDetergent, setAddDetergent] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const basePrice = bay.rate
  const finalPrice = addDetergent ? basePrice + 200 : basePrice

  function handleSelectDay(day: 'today' | 'tomorrow') {
    setSelectedDay(day)
    const newSlots = MULTI_DAY_SLOTS.filter(s => s.day === day)
    setSelectedSlot(newSlots.find(s => s.isAvailable) || null)
  }

  function handlePay() {
    if (!selectedSlot) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onConfirmBooking(selectedSlot, addDetergent)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0b3c42]/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-7 flex flex-col gap-5 relative max-h-[92vh] overflow-y-auto"
        style={{
          background: '#dde8ea',
          boxShadow: '16px 16px 36px #b0bec0, -16px -16px 36px #ffffff',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#b8c6c9]/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-[#fd8451] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff' }}
              >
                <span className="material-symbols-outlined text-[13px]">local_laundry_service</span>
                <span>{bay.id}</span>
              </span>
              <span className="text-xs text-[#5a7578] font-medium">{bay.hall}</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0b3c42] mt-1">{bay.subname}</h2>
            <p className="text-xs text-[#5a7578]">{bay.capacity}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#5a7578] hover:text-[#0b3c42] transition-colors"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 1-Day Advance Booking Day Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8aa8ab] flex items-center justify-between">
            <span>Booking Window</span>
            <span className="text-[10px] text-[#fd8451] font-semibold">Reserve up to 24 hours in advance</span>
          </label>
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
              <span>Today (Immediate Slots)</span>
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
        </div>

        {/* Turnover safeguard visualizer */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-2.5"
          style={{ background: '#dde8ea', boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff' }}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0b3c42] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0b3c42]">timelapse</span>
              Slot Turnover Protection (45 Mins Total)
            </span>
            <span className="text-[10px] font-bold text-[#fd8451] uppercase">Guaranteed</span>
          </div>

          <div
            className="w-full h-8 rounded-full p-1 flex gap-1 items-center"
            style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 5px #b0bec0, inset -2px -2px 5px #ffffff' }}
          >
            <div
              className="h-full rounded-l-full flex items-center justify-center text-[10px] font-extrabold text-white px-2 tracking-wide"
              style={{ width: '78%', background: '#0b3c42' }}
            >
              <span>35m Eco Wash & Spin</span>
            </div>
            <div
              className="h-full rounded-r-full flex items-center justify-center text-[10px] font-extrabold text-white px-2 tracking-wide"
              style={{ width: '22%', background: '#fd8451' }}
            >
              <span>10m Unload</span>
            </div>
          </div>
          <p className="text-[11px] text-[#5a7578] leading-tight">
            The power relay cuts off at 35 mins; you receive a 10-minute safe buffer window to retrieve your laundry before the next booking unlocks.
          </p>
        </div>

        {/* Slot Matrix */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#8aa8ab] flex items-center justify-between">
            <span>Select Available Slot ({selectedDay === 'today' ? 'Today' : 'Tomorrow'})</span>
            <span className="text-[10px] text-[#5a7578]">
              {daySlots.filter(s => s.isAvailable).length} open slots
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {daySlots.map(slot => {
              const isSelected = selectedSlot?.id === slot.id
              const isDisabled = !slot.isAvailable || slot.isPast

              return (
                <button
                  key={slot.id}
                  disabled={isDisabled}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-xl flex flex-col text-left transition-all ${
                    isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-98'
                  }`}
                  style={{
                    background: isSelected ? '#0b3c42' : '#dde8ea',
                    color: isSelected ? '#ffffff' : '#0b3c42',
                    boxShadow: isSelected
                      ? 'inset 3px 3px 7px rgba(0,0,0,0.4), inset -2px -2px 5px rgba(255,255,255,0.1)'
                      : isDisabled
                      ? 'inset 2px 2px 4px #b8c6c9, inset -2px -2px 4px #ffffff'
                      : '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff',
                  }}
                >
                  <span className="text-[12px] font-extrabold">{slot.timeLabel}</span>
                  <span className={`text-[10px] font-semibold mt-1 uppercase flex items-center gap-1 ${
                    isSelected ? 'text-[#a2ced5]' : isDisabled ? 'text-[#8aa8ab]' : 'text-emerald-700'
                  }`}>
                    <span className="material-symbols-outlined text-[13px]">
                      {slot.isPast ? 'history' : !slot.isAvailable ? 'lock' : 'check_circle'}
                    </span>
                    <span>{slot.isPast ? 'Passed' : !slot.isAvailable ? 'Booked' : 'Open'}</span>
                  </span>
                </button>
              )
            })}
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
              <div className="text-[10px] text-[#5a7578]">Pre-loaded automatic dispensing chamber</div>
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
            disabled={!selectedSlot || isProcessing}
            onClick={handlePay}
            className="w-full py-4 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-white text-sm"
            style={{
              background: '#fd8451',
              boxShadow: '5px 5px 14px rgba(253,132,81,0.45), -3px -3px 8px rgba(255,255,255,0.5)',
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            <span className="material-symbols-outlined text-[18px]">key</span>
            <span>
              {isProcessing
                ? 'Securing Slot & Keypad PIN…'
                : `Pay ₦${finalPrice.toLocaleString()} & Generate PIN`}
            </span>
          </button>

          <p className="text-[11px] text-[#5a7578] text-center flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-700">lock</span>
            Secure instant unlock PIN delivered on screen & SMS
          </p>
        </div>
      </div>
    </div>
  )
}
