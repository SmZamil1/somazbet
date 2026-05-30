import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ username: '', phone: '', password: '', confirm: '', referral: '' })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const nav = useNavigate()

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (!agreed) { setError('Please agree to Terms & Conditions'); return }
    setLoading(true)
    const { error } = await signUp(form.phone, form.password, form.username)
    if (error) setError(error.message)
    else nav('/home')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '36px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '8px' }}>SomazBet</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Create your account</div>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= s ? 'var(--accent-green)' : 'var(--bg-elevated)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div className="card fade-in-up">
          {error && (
            <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '16px', color: 'var(--accent-red)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="input-group">
                <label className="input-label">Username</label>
                <input className="input" placeholder="Choose a username" value={form.username} onChange={e => set('username', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input className="input" type="tel" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Referral Code (optional)</label>
                <input className="input" placeholder="Enter referral code" value={form.referral} onChange={e => set('referral', e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { if (!form.username || !form.phone) { setError('Fill all fields'); return } setError(''); setStep(2) }}>
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input className="input" type="password" placeholder="Re-enter password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => { if (!form.password || form.password.length < 6) { setError('Password too short'); return } setError(''); setStep(3) }}>Next</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Terms & Conditions</strong><br />
                By registering, you confirm you are 18+ years old and agree to our terms of service. Gambling involves risk. Please gamble responsibly.
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '16px' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: 'var(--accent-green)', width: '16px', height: '16px' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>I agree to Terms & Conditions</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" style={{ flex: 2 }} disabled={loading} onClick={handleSubmit}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
