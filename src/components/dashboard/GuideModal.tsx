interface GuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GuideModal({ isOpen, onClose }: GuideModalProps) {
  if (!isOpen) return null

  const steps = [
    {
      num: '01',
      title: 'Book & Receive PIN',
      desc: 'Pick your bay and slot. Once payment is made, your 4-digit PIN is displayed on screen and sent to your email/SMS.',
      icon: 'pin',
    },
    {
      num: '02',
      title: 'Wake the Keypad',
      desc: 'Arrive at your assigned bay 3 minutes early. Press the wake button (*) on the physical keypad to activate the screen.',
      icon: 'touch_app',
    },
    {
      num: '03',
      title: 'Enter PIN & Load',
      desc: 'Type your 4 digits and press (#). The electronic door solenoid clicks open. Add your clothes and detergent pod.',
      icon: 'local_laundry_service',
    },
    {
      num: '04',
      title: 'Auto Unload Buffer',
      desc: 'The solar cycle runs for 35 minutes. You receive a 10-minute safe grace window to unload your fresh laundry before the next slot.',
      icon: 'timer',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0b3c42]/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-7 flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto"
        style={{
          background: '#dde8ea',
          boxShadow: '16px 16px 36px #b0bec0, -16px -16px 36px #ffffff',
        }}
      >
        <div className="flex items-center justify-between border-b border-[#b8c6c9]/40 pb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: '#fd8451', boxShadow: '2px 2px 6px rgba(253,132,81,0.5)' }}
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0b3c42]">How to Use Kilowash</h2>
              <span className="text-[10px] text-[#5a7578] uppercase font-bold tracking-wider">Hostel Keypad & Unlocking Guide</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a7578] hover:text-[#0b3c42]"
            style={{ background: '#dde8ea', boxShadow: '3px 3px 6px #b8c6c9, -3px -3px 6px #ffffff' }}
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map(s => (
            <div
              key={s.num}
              className="p-3.5 rounded-2xl flex items-start gap-3.5"
              style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff' }}
            >
              <div
                className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-extrabold text-sm"
                style={{ background: '#0b3c42', color: '#ffffff' }}
              >
                {s.num}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0b3c42]">{s.title}</span>
                <span className="text-[11px] text-[#5a7578] leading-relaxed mt-0.5">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="p-3.5 rounded-2xl flex items-center gap-3"
          style={{ background: 'rgba(253,132,81,0.12)', border: '1px solid rgba(253,132,81,0.3)' }}
        >
          <span className="material-symbols-outlined text-[#fd8451] text-[20px] shrink-0">solar_power</span>
          <p className="text-[11px] text-[#0b3c42] leading-snug">
            <strong>100% Solar Powered:</strong> Never worry about campus grid power outages. Your wash is fully sustained by dedicated lithium battery storage.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full text-xs font-bold text-white transition-all"
          style={{ background: '#0b3c42', boxShadow: '4px 4px 10px rgba(11,60,66,0.35)' }}
        >
          Got It, Back to Bays
        </button>
      </div>
    </div>
  )
}
