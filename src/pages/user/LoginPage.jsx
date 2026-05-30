import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const nav = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(phone, password)
    if (error) setError(error.message)
    else nav('/home')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '36px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '8px' }}>SomazBet</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to your account</div>
        </div>

        <div className="card fade-in-up">
          {error && (
            <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '16px', color: 'var(--accent-red)', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <input className="input" type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>← Back</Link>
        </p>
      </div>
    </div>
  )
}
