import { useState } from 'react'

interface ComplaintModalProps {
  isOpen: boolean
  onClose: () => void
  initialBayId?: string
  initialBookingId?: string
}

type FeedbackType = 'complaint' | 'comment'

const COMPLAINT_CATEGORIES = [
  { id: 'blocked_clothes', label: 'Clothes Left in Drum', icon: 'dry_cleaning' },
  { id: 'door_stuck', label: 'Door Locked / PIN Error', icon: 'lock_reset' },
  { id: 'machine_fault', label: 'Machine Stopped / Fault', icon: 'report_problem' },
  { id: 'payment_pin', label: 'Payment Deducted / No PIN', icon: 'receipt_long' },
  { id: 'water_drain', label: 'Water Supply / Drainage', icon: 'water_drop' },
  { id: 'other', label: 'Other Issue', icon: 'help_outline' },
]

const COMMENT_CATEGORIES = [
  { id: 'general_suggestion', label: 'General Suggestion', icon: 'lightbulb' },
  { id: 'wash_quality', label: 'Wash Quality & Pods', icon: 'cleaning_services' },
  { id: 'service_timing', label: 'Timings & Availability', icon: 'schedule' },
  { id: 'website_app', label: 'App / Website Experience', icon: 'devices' },
]

export default function ComplaintModal({
  isOpen,
  onClose,
  initialBayId = 'BAY-01',
  initialBookingId,
}: ComplaintModalProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('complaint')
  const [category, setCategory] = useState<string>(
    feedbackType === 'complaint' ? 'blocked_clothes' : 'general_suggestion'
  )
  const [bayId, setBayId] = useState<string>(initialBayId)
  const [bookingRef, setBookingRef] = useState<string>(initialBookingId || '')
  const [message, setMessage] = useState<string>('')
  const [contactInfo, setContactInfo] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string
    type: FeedbackType
    category: string
    bay: string
  } | null>(null)

  if (!isOpen) return null

  function handleTypeSwitch(type: FeedbackType) {
    setFeedbackType(type)
    setCategory(type === 'complaint' ? 'blocked_clothes' : 'general_suggestion')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    setTimeout(() => {
      const generatedId = `KW-${feedbackType === 'complaint' ? 'CMP' : 'FBK'}-${Math.floor(
        1000 + Math.random() * 9000
      )}`
      setSubmittedTicket({
        id: generatedId,
        type: feedbackType,
        category,
        bay: bayId,
      })
      setIsSubmitting(false)
    }, 600)
  }

  function handleResetAndClose() {
    setSubmittedTicket(null)
    setMessage('')
    setBookingRef('')
    setContactInfo('')
    onClose()
  }

  const activeCategories =
    feedbackType === 'complaint' ? COMPLAINT_CATEGORIES : COMMENT_CATEGORIES

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0b3c42]/45 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-7 flex flex-col gap-5 relative max-h-[92vh] overflow-y-auto"
        style={{
          background: '#dde8ea',
          boxShadow: '16px 16px 36px #b0bec0, -16px -16px 36px #ffffff',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#b8c6c9]/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
              style={{
                background: feedbackType === 'complaint' ? '#fd8451' : '#0b3c42',
                boxShadow: '2px 2px 6px rgba(11,60,66,0.3)',
              }}
            >
              <span className="material-symbols-outlined text-[20px]">
                {feedbackType === 'complaint' ? 'campaign' : 'sms'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0b3c42] leading-tight">
                {feedbackType === 'complaint' ? 'Lodge a Complaint' : 'Give a Comment / Feedback'}
              </h2>
              <span className="text-[10px] text-[#5a7578] uppercase font-bold tracking-wider">
                Hostel Corridor Support & Operations
              </span>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a7578] hover:text-[#0b3c42] transition-colors"
            style={{
              background: '#dde8ea',
              boxShadow: '3px 3px 6px #b8c6c9, -3px -3px 6px #ffffff',
            }}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Success Confirmation View */}
        {submittedTicket ? (
          <div className="flex flex-col items-center text-center gap-4 py-4 animate-fadeIn">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-emerald-700 shrink-0"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 3px 3px 8px #b8c6c9, inset -3px -3px 8px #ffffff',
              }}
            >
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#0b3c42] text-white">
                Ticket {submittedTicket.id}
              </span>
              <h3 className="text-xl font-extrabold text-[#0b3c42] mt-3">
                {submittedTicket.type === 'complaint'
                  ? 'Complaint Registered!'
                  : 'Comment Received!'}
              </h3>
              <p className="text-xs text-[#5a7578] max-w-sm mx-auto mt-1 leading-relaxed">
                {submittedTicket.type === 'complaint'
                  ? 'The hostel facilities caretaker and laundry operations team have been alerted. For blocked clothes or emergency machine issues, response time is under 10 minutes.'
                  : 'Thank you for your valuable feedback! Every student suggestion helps us improve the Kilowash campus laundry experience.'}
              </p>
            </div>

            {/* Ticket Info Card */}
            <div
              className="w-full rounded-2xl p-4 flex flex-col gap-2 text-left text-xs"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[#8aa8ab] font-bold uppercase text-[10px]">Reference</span>
                <span className="font-extrabold text-[#0b3c42]">{submittedTicket.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8aa8ab] font-bold uppercase text-[10px]">Location</span>
                <span className="font-extrabold text-[#0b3c42]">
                  {submittedTicket.bay === 'BAY-01'
                    ? 'Female Hostel (Machine 01)'
                    : submittedTicket.bay === 'BAY-02'
                    ? 'Front-Middle Block (Machine 02)'
                    : submittedTicket.bay === 'BAY-03'
                    ? 'PDS Male Hostel (Machine 03)'
                    : submittedTicket.bay === 'BAY-04'
                    ? 'PDS Female Hostel (Machine 04)'
                    : 'Campus Hostel Area'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8aa8ab] font-bold uppercase text-[10px]">Status</span>
                <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                  Dispatched to On-duty Staff
                </span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-full py-3.5 px-4 rounded-full font-bold text-white text-xs transition-all active:scale-98 mt-2"
              style={{
                background: '#0b3c42',
                boxShadow: '4px 4px 12px rgba(11,60,66,0.35), -2px -2px 6px rgba(255,255,255,0.5)',
              }}
            >
              Done & Return to Wash History
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Top Mode Pill Selector: Complaint vs Comment */}
            <div
              className="p-1.5 rounded-2xl flex items-center gap-1.5"
              style={{
                background: '#dde8ea',
                boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
              }}
            >
              <button
                type="button"
                onClick={() => handleTypeSwitch('complaint')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  feedbackType === 'complaint'
                    ? 'text-white'
                    : 'text-[#5a7578] hover:text-[#0b3c42]'
                }`}
                style={
                  feedbackType === 'complaint'
                    ? {
                        background: '#fd8451',
                        boxShadow: '2px 2px 8px rgba(253,132,81,0.45)',
                      }
                    : {}
                }
              >
                <span className="material-symbols-outlined text-[16px]">report_problem</span>
                <span>Lodge Complaint</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSwitch('comment')}
                className={`flex-1 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  feedbackType === 'comment'
                    ? 'text-white'
                    : 'text-[#5a7578] hover:text-[#0b3c42]'
                }`}
                style={
                  feedbackType === 'comment'
                    ? {
                        background: '#0b3c42',
                        boxShadow: '2px 2px 8px rgba(11,60,66,0.35)',
                      }
                    : {}
                }
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Give Comment / Feedback</span>
              </button>
            </div>

            {/* Category Grid */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">category</span>
                {feedbackType === 'complaint' ? 'Issue Category' : 'Feedback Category'}
              </label>

              <div className="grid grid-cols-2 gap-2">
                {activeCategories.map(cat => {
                  const isSelected = category === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-2xl flex items-center gap-2 text-left text-xs font-bold transition-all ${
                        isSelected ? 'text-[#0b3c42]' : 'text-[#5a7578]'
                      }`}
                      style={
                        isSelected
                          ? {
                              background: '#dde8ea',
                              boxShadow:
                                'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                              border: '1.5px solid #fd8451',
                            }
                          : {
                              background: '#dde8ea',
                              boxShadow: '3px 3px 7px #b8c6c9, -3px -3px 7px #ffffff',
                            }
                      }
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 ${
                          isSelected ? 'text-[#fd8451]' : 'text-[#8aa8ab]'
                        }`}
                      >
                        {cat.icon}
                      </span>
                      <span className="truncate leading-tight text-[11px] sm:text-xs">
                        {cat.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Affected Machine / Bay */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">local_laundry_service</span>
                Washing Bay Node
              </label>

              <div
                className="p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-1.5"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                }}
              >
                {[
                  { id: 'BAY-01', label: 'Female Hostel (01)' },
                  { id: 'BAY-02', label: 'Female Hostel (02)' },
                  { id: 'BAY-03', label: 'Front-Middle (03)' },
                  { id: 'BAY-04', label: 'Front-Middle (04)' },
                  { id: 'BAY-05', label: 'PDS Male (05)' },
                  { id: 'BAY-06', label: 'PDS Male (06)' },
                  { id: 'BAY-07', label: 'PDS Female (07)' },
                  { id: 'BAY-08', label: 'PDS Female (08)' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBayId(item.id)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center truncate ${
                      bayId === item.id
                        ? 'bg-[#0b3c42] text-white shadow'
                        : 'text-[#5a7578] hover:text-[#0b3c42]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Reference (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">receipt</span>
                  Booking Reference (Optional)
                </span>
                <span className="text-[9px] text-[#5a7578]">e.g. BK-9482</span>
              </label>
              <input
                type="text"
                value={bookingRef}
                onChange={e => setBookingRef(e.target.value.toUpperCase())}
                placeholder="BK-XXXX"
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#0b3c42] placeholder-[#8aa8ab] outline-none"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                }}
              />
            </div>

            {/* Description Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">edit_note</span>
                  {feedbackType === 'complaint'
                    ? 'Complaint Details'
                    : 'Your Comment / Suggestion'}
                </span>
                <span className="text-[9px] text-[#5a7578]">
                  {message.length} chars
                </span>
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={
                  feedbackType === 'complaint'
                    ? 'Describe what happened (e.g. Previous user has not removed clothes from Bay 01 after 20 minutes...)'
                    : 'Share your experience, feature ideas, or feedback on detergent pods and wash cycles...'
                }
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-medium text-[#0b3c42] placeholder-[#8aa8ab] outline-none resize-none leading-relaxed"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                }}
              />
            </div>

            {/* Contact / Room Info */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#8aa8ab] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">home</span>
                  Hostel Room / Phone (Optional)
                </span>
                <span className="text-[9px] text-[#5a7578]">For instant warden update</span>
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
                placeholder="e.g. Block C, Room 204 or 08012345678"
                className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#0b3c42] placeholder-[#8aa8ab] outline-none"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className={`w-full py-3.5 px-4 rounded-full flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-98 text-white ${
                !message.trim() ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              style={{
                background: feedbackType === 'complaint' ? '#fd8451' : '#0b3c42',
                boxShadow:
                  feedbackType === 'complaint'
                    ? '4px 4px 12px rgba(253,132,81,0.45), -2px -2px 6px rgba(255,255,255,0.5)'
                    : '4px 4px 12px rgba(11,60,66,0.35), -2px -2px 6px rgba(255,255,255,0.5)',
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSubmitting ? 'sync' : 'send'}
              </span>
              <span>
                {isSubmitting
                  ? 'Transmitting...'
                  : feedbackType === 'complaint'
                  ? 'Submit Complaint'
                  : 'Submit Comment'}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
