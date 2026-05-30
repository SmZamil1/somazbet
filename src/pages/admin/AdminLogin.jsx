import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { adminSignIn } = useAuth()
  const nav = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await adminSignIn(email, password)
    if (error) setError(error.message)
    else nav('/admin')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '380px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '36px', fontWeight: 700, color: 'var(--accent-green)' }}>SomazBet</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <div className="card">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Admin Sign In</div>
          {error && <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius)', padding: '10px', marginBottom: '16px', color: 'var(--accent-red)', fontSize: '13px' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="admin@somazbet.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
