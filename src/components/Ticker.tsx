const items = [
  'Solar-Powered Machines', 'Book From Your Phone', '4-Digit PIN Unlock',
  '30-Min Guaranteed Slot', '10-Min Buffer Protocol', 'Zero Queue System',
  'Instant Payment Verify', 'No Light Issues', '₦1,500 Per Cycle',
]

export default function Ticker() {
  const repeated = [...items, ...items, ...items, ...items]
  return (
    <div
      className="w-full overflow-hidden py-3"
      style={{ background: '#0b3c42', boxShadow: 'inset 0 3px 10px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(255,255,255,0.05)' }}
    >
      <div className="marquee-track" style={{ animation: 'marqueeLTR 35s linear infinite' }}>
        {repeated.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-6 flex-shrink-0">
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(162,206,213,0.6)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {item}
            </span>
            <span style={{ color: '#fd8451', fontSize: '7px' }}>◆</span>
          </div>
        ))}
      </div>
    </div>
  )
}
