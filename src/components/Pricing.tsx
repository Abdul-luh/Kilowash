const plans = [
  {
    label: 'Standard Wash', tag: 'POPULAR',   price: '₦1,500', cycle: '30-min cycle', featured: false,
    features: ['30-min high-efficiency wash', 'Up to 7.5 KG load', '+10 Min Automated Buffer', 'Instant PIN on payment', '100% Solar Powered'],
  },
  {
    label: 'Heavy / Bulky',  tag: 'EXTENDED',  price: '₦1,800', cycle: '45-min cycle', featured: true,
    features: ['45-min dual-agitation wash', 'Up to 11.0 KG max drum', '+10 Min Automated Buffer', 'Extended rinse for duvets', '100% Solar Powered'],
  },
  {
    label: 'Delicate Express', tag: 'LOW IMPACT', price: '₦1,500', cycle: '30-min cycle', featured: false,
    features: ['30-min soft drum pulse', 'Up to 6.0 KG load', '+10 Min Automated Buffer', 'Low-spin for athletic wear', '100% Solar Powered'],
  },
]

const comparison = [
  { method: 'Manual Bucket Wash', time: '2+ hours',  cost: 'Free + backache',   best: false },
  { method: 'Local Dry Cleaner',  time: '2–3 days',  cost: '₦3,000–₦8,000',    best: false },
  { method: 'Kilowash',           time: '30 minutes', cost: '₦1,500 flat',      best: true  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="w-full py-20 px-8" style={{ background: '#dde8ea', boxShadow: 'inset 0 6px 16px #b8c6c9, inset 0 -6px 16px #ffffff' }}>
      <div className="max-w-[1280px] mx-auto">

        <div className="text-center mb-14">
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#fd8451', textTransform: 'uppercase', marginBottom: '8px' }}>Transparent Pricing</div>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#0b3c42' }}>One flat rate. No surprises.</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-12">
          {plans.map(p => (
            <div
              key={p.label}
              className="flex flex-col p-7 rounded-2xl"
              style={{
                background: p.featured ? '#0b3c42' : '#dde8ea',
                boxShadow: p.featured
                  ? 'inset 4px 4px 12px rgba(0,0,0,0.3), inset -2px -2px 8px rgba(255,255,255,0.05)'
                  : '8px 8px 18px #b8c6c9, -8px -8px 18px #ffffff',
                marginTop: p.featured ? '-8px' : '0',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.featured ? 'rgba(162,206,213,0.5)' : '#8aa8ab' }}>{p.label}</span>
                <span
                  className="px-3 py-1 rounded-full"
                  style={{
                    background: p.featured ? 'rgba(253,132,81,0.2)' : '#dde8ea',
                    boxShadow: p.featured ? 'none' : 'inset 2px 2px 5px #b8c6c9, inset -2px -2px 5px #ffffff',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: p.featured ? '#fd8451' : '#5a7578',
                  }}
                >
                  {p.tag}
                </span>
              </div>

              <div className="mb-6">
                <span style={{ fontWeight: 800, fontSize: '2.8rem', letterSpacing: '-0.04em', color: p.featured ? 'white' : '#0b3c42' }}>{p.price}</span>
                <span style={{ fontSize: '13px', color: p.featured ? 'rgba(162,206,213,0.5)' : '#8aa8ab', marginLeft: '6px' }}>/ {p.cycle}</span>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: p.featured ? 'rgba(253,132,81,0.2)' : '#dde8ea',
                        boxShadow: p.featured ? 'none' : 'inset 1px 1px 4px #b8c6c9, inset -1px -1px 4px #ffffff',
                      }}
                    >
                      <span className="material-symbols-outlined text-[12px]" style={{ color: p.featured ? '#fd8451' : '#0b3c42' }}>check</span>
                    </div>
                    <span style={{ fontSize: '13px', color: p.featured ? 'rgba(255,255,255,0.65)' : '#5a7578' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#waitlist"
                className="w-full text-center py-3 rounded-full transition-all"
                style={{
                  background: p.featured ? '#fd8451' : '#dde8ea',
                  boxShadow: p.featured
                    ? '4px 4px 10px rgba(253,132,81,0.45), -2px -2px 6px rgba(255,255,255,0.3)'
                    : 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                  fontSize: '13px', fontWeight: 700, color: p.featured ? 'white' : '#0b3c42', textDecoration: 'none', display: 'block',
                }}
              >
                Book This Slot
              </a>
            </div>
          ))}
        </div>

        {/* Comparison — raised card */}
        <div
          className="p-8 rounded-2xl"
          style={{ background: '#dde8ea', boxShadow: '8px 8px 18px #b8c6c9, -8px -8px 18px #ffffff' }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8aa8ab', marginBottom: '20px' }}>
            Why Kilowash vs. the alternatives
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  {['Method', 'Time', 'Cost', ''].map(h => (
                    <th key={h} className="text-left pb-2 px-4" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8aa8ab' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map(row => (
                  <tr key={row.method}>
                    {[row.method, row.time, row.cost].map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-4 py-3"
                        style={{
                          background: row.best ? 'rgba(11,60,66,0.06)' : 'transparent',
                          borderRadius: ci === 0 ? '0.75rem 0 0 0.75rem' : 'none',
                          fontSize: '13px', fontWeight: ci === 0 ? 700 : 400,
                          color: row.best ? '#0b3c42' : '#8aa8ab',
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right" style={{ background: row.best ? 'rgba(11,60,66,0.06)' : 'transparent', borderRadius: '0 0.75rem 0.75rem 0' }}>
                      {row.best
                        ? <span className="px-3 py-1 rounded-full" style={{ background: '#0b3c42', boxShadow: '2px 2px 6px rgba(11,60,66,0.4)', fontSize: '10px', fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>Best</span>
                        : <span style={{ color: '#b8c6c9' }}>✕</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
