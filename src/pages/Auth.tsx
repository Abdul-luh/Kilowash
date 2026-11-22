import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [campus, setCampus] = useState('Lagos State University (LASU) - Epe')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#fd8451] selection:text-white"
      style={{ background: '#dde8ea', color: '#0b3c42' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative"
        style={{
          background: '#dde8ea',
          boxShadow: '16px 16px 36px #b0bec0, -16px -16px 36px #ffffff',
        }}
      >
        {/* Brand header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="flex items-center gap-2.5 text-inherit no-underline">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: '#dde8ea', boxShadow: '4px 4px 10px #b8c6c9, -4px -4px 10px #ffffff' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background: '#fd8451', boxShadow: '2px 2px 6px rgba(253,132,81,0.5)' }}
              >
                <span className="material-symbols-outlined text-[18px]">local_laundry_service</span>
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0b3c42]">
            {mode === 'signin' ? 'Welcome Back' : 'Create Student Account'}
          </h1>
          <p className="text-xs text-[#5a7578]">
            {mode === 'signin'
              ? 'Access your booked bays and keypad unlock codes'
              : 'Join the campus smart solar laundry network'}
          </p>
        </div>

        {/* Tab switch */}
        <div
          className="p-1 rounded-full flex items-center"
          style={{ background: '#dde8ea', boxShadow: 'inset 2px 2px 6px #b8c6c9, inset -2px -2px 6px #ffffff' }}
        >
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              mode === 'signin' ? 'text-white' : 'text-[#5a7578]'
            }`}
            style={mode === 'signin' ? { background: '#0b3c42', boxShadow: '2px 2px 6px rgba(11,60,66,0.4)' } : {}}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
              mode === 'signup' ? 'text-white' : 'text-[#5a7578]'
            }`}
            style={mode === 'signup' ? { background: '#0b3c42', boxShadow: '2px 2px 6px rgba(11,60,66,0.4)' } : {}}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8aa8ab]">
              Student Email
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#8aa8ab]">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@student.lasu.edu.ng"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-xs outline-none text-[#0b3c42]"
                style={{
                  background: '#dde8ea',
                  boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                }}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8aa8ab]">
                  WhatsApp Number (For instant PIN SMS)
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#8aa8ab]">phone</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0810 000 0000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-xs outline-none text-[#0b3c42]"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8aa8ab]">
                  Campus / Hostel
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#8aa8ab]">location_on</span>
                  <select
                    value={campus}
                    onChange={e => setCampus(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 rounded-xl text-xs outline-none text-[#0b3c42] appearance-none"
                    style={{
                      background: '#dde8ea',
                      boxShadow: 'inset 3px 3px 7px #b8c6c9, inset -3px -3px 7px #ffffff',
                    }}
                  >
                    <option value="Lagos State University (LASU) - Epe">LASU (Epe Campus)</option>
                    <option value="Lagos State University (LASU) - Ojo">LASU (Ojo Main Campus)</option>
                    <option value="University of Lagos (UNILAG)">University of Lagos (UNILAG)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 text-[18px] text-[#8aa8ab] pointer-events-none">
                    unfold_more
                  </span>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full text-xs font-bold text-white transition-all mt-2 flex items-center justify-center gap-2"
            style={{
              background: '#fd8451',
              boxShadow: '4px 4px 12px rgba(253,132,81,0.45), -2px -2px 6px rgba(255,255,255,0.5)',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            <span>{isLoading ? 'Verifying Student…' : mode === 'signin' ? 'Sign In to Dashboard' : 'Create My Account'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#5a7578]">
          <Link to="/" className="text-[#0b3c42] font-semibold hover:underline">
            ← Return to Kilowash Landing Page
          </Link>
        </div>
      </div>
    </div>
  )
}
