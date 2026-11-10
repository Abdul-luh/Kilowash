import { useEffect } from 'react'

export type LegalDocType = 'privacy' | 'terms' | 'refund'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  activeDoc: LegalDocType
  onSelectDoc: (doc: LegalDocType) => void
}

export default function LegalModal({ isOpen, onClose, activeDoc, onSelectDoc }: LegalModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      style={{ background: 'rgba(11, 60, 66, 0.65)', backdropFilter: 'blur(6px)' }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col overflow-hidden p-5 sm:p-8"
        style={{
          background: '#dde8ea',
          boxShadow: '16px 16px 40px rgba(7, 36, 40, 0.4), -12px -12px 30px #ffffff',
        }}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#b8c6c9]/50">
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '2px' }}>
              Kilowash Legal & Governance
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b3c42', letterSpacing: '-0.02em' }}>
              {activeDoc === 'privacy' && 'Privacy Policy'}
              {activeDoc === 'terms' && 'Terms of Use'}
              {activeDoc === 'refund' && 'No-Refund & Forfeiture Policy'}
            </h2>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0"
            style={{
              background: '#dde8ea',
              boxShadow: '3px 3px 8px #b8c6c9, -3px -3px 8px #ffffff',
              color: '#0b3c42',
            }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 py-3 overflow-x-auto">
          {[
            { id: 'refund' as const, label: 'Refund Policy' },
            { id: 'terms' as const, label: 'Terms of Use' },
            { id: 'privacy' as const, label: 'Privacy Policy' },
          ].map(tab => {
            const isActive = activeDoc === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onSelectDoc(tab.id)}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all whitespace-nowrap"
                style={{
                  background: isActive ? '#0b3c42' : '#dde8ea',
                  color: isActive ? '#ffffff' : '#5a7578',
                  boxShadow: isActive
                    ? '3px 3px 8px rgba(11,60,66,0.35), -2px -2px 6px #ffffff'
                    : 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Scrollable Policy Content — inset container */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-2xl my-2 text-[#5a7578] text-[13px] leading-relaxed flex flex-col gap-5"
          style={{
            background: '#dde8ea',
            boxShadow: 'inset 4px 4px 10px #b8c6c9, inset -4px -4px 10px #ffffff',
          }}
        >
          {activeDoc === 'refund' && (
            <>
              <div className="p-3.5 rounded-xl flex items-start gap-3" style={{ background: 'rgba(253,132,81,0.12)', border: '1px solid rgba(253,132,81,0.25)' }}>
                <span className="material-symbols-outlined text-[#fd8451] text-[20px] shrink-0 mt-0.5">warning</span>
                <div>
                  <h4 className="font-bold text-[#0b3c42] text-[13px] mb-0.5">Strict Capacity Allocation Notice</h4>
                  <p className="text-[12px] text-[#5a7578] leading-normal">
                    Kilowash operates an automated, capacity-constrained IoT network. All bookings are final and non-refundable.
                  </p>
                </div>
              </div>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">1. No-Refund Principle</h4>
                <p>
                  When you lock a 30-minute washing slot for ₦1,500, that specific machine’s power relay is dedicated exclusively to you. That time window is immediately blocked out across the campus registry, preventing any other student from reserving or using it.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">2. Slot Forfeiture & Late Arrivals</h4>
                <p>
                  If you fail to arrive within your booked slot, delay your wash, or forfeit your booking for any personal reason, <strong>no refund or credit will be granted</strong>. A customer delay directly deprives other students of laundry access during peak hostel hours.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">3. Rescheduling Equals a Repayment</h4>
                <p>
                  We do not offer free slot rescheduling. If you miss or choose to forfeit your original slot, booking a new time window requires a new payment at the standard cycle rate.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">4. System Downtime & Hardware Malfunction</h4>
                <p>
                  The only exception occurs if a Kilowash automated bay encounters an unrecoverable hardware breakdown, power grid outage, or telemetry failure directly verified by our sensor logs. In such verifiable cases, our operations team will immediately issue a replacement slot token to your account.
                </p>
              </section>
            </>
          )}

          {activeDoc === 'terms' && (
            <>
              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">1. Acceptance & Scope</h4>
                <p>
                  By joining the Kilowash waitlist or accessing our automated campus laundry stations, you agree to comply with all network protocols, automated queuing guidelines, and safety standards outlined here.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">2. Keypad PIN Security & Single-Use Rules</h4>
                <p>
                  Each booking generates a cryptographic 4-digit unlock PIN valid exclusively on your assigned machine during your reserved 30-minute window. PINs are strictly single-use and non-transferable. Tampering with IoT smart enclosures or sharing PINs is strictly prohibited and subject to permanent account revocation.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">3. 10-Minute Enforced Buffer SLA</h4>
                <p>
                  To eliminate hostel queue friction, every cycle incorporates an automated 10-minute unload buffer. You are required to promptly clear your clothes from the drum before this buffer expires so the next student’s guaranteed window starts without disruption.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">4. Machine Care & Permitted Laundry</h4>
                <p>
                  Kilowash nodes are calibrated for student clothing, beddings, and everyday garments. Washing heavy industrial materials, metal hardware, shoes, or chemical hazards that may damage drum rotation or moisture telemetry is strictly forbidden.
                </p>
              </section>
            </>
          )}

          {activeDoc === 'privacy' && (
            <>
              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">1. Information We Collect</h4>
                <p>
                  During waitlist enrollment and booking, we collect only essential information: your email address and campus/hostel affiliation. During operational use, we record booking timestamps and machine interaction telemetry.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">2. Zero Third-Party Data Monetization</h4>
                <p>
                  Kilowash strictly does not sell, rent, or trade student email addresses or personal records to advertisers, lead brokers, or third parties. Your data is used exclusively to notify you of hostel machine launches and send reservation unlock PINs.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">3. Regulatory Compliance & Storage</h4>
                <p>
                  Our data retention practices comply with the Nigeria Data Protection Act (NDPA) and NDPR standards. All customer records are stored on encrypted cloud infrastructure.
                </p>
              </section>

              <section>
                <h4 className="font-bold text-[#0b3c42] text-[14px] mb-1.5">4. Account Deletion Rights</h4>
                <p>
                  You retain the permanent right to inspect, modify, or permanently remove your email from our waitlist registry at any time by emailing privacy@kilowash.dev or contacting campus support.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="pt-3 flex items-center justify-between">
          <span style={{ fontSize: '11px', color: '#8aa8ab' }}>
            Effective: 2026 Academic Session · Kilowash IoT Network
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-bold text-[12px] transition-all"
            style={{
              background: '#fd8451',
              color: 'white',
              boxShadow: '4px 4px 10px rgba(253,132,81,0.4), -2px -2px 6px #ffffff',
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
