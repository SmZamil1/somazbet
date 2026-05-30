import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const nav = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #0d2040 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)`,
            width: `${200 + i * 80}px`,
            height: `${200 + i * 80}px`,
            left: `${10 + i * 15}%`,
            top: `${10 + i * 12}%`,
            animation: `pulse ${3 + i}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px', width: '100%' }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '52px', fontWeight: 700, color: '#00d4aa', lineHeight: 1, textShadow: '0 0 30px rgba(0,212,170,0.4)' }}>
            SomazBet
          </div>
          <div style={{ color: '#8ba3c4', fontSize: '14px', marginTop: '8px', letterSpacing: '0.1em' }}>
            PREMIUM GAMING PLATFORM
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          {['🎰 Slots', '✈️ Aviator', '🃏 Poker', '🎲 Casino'].map(f => (
            <span key={f} style={{ padding: '6px 14px', borderRadius: '20px', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', color: '#00d4aa', fontSize: '13px' }}>
              {f}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary btn-lg btn-full" onClick={() => nav('/register')}>
            Create Account
          </button>
          <button className="btn btn-outline btn-lg btn-full" onClick={() => nav('/login')}>
            Sign In
          </button>
          <button className="btn btn-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#8ba3c4', fontSize: '13px' }} onClick={() => nav('/admin/login')}>
            Admin Panel →
          </button>
        </div>

        {/* Trust badges */}
        <div style={{ marginTop: '32px', display: 'flex', gap: '20px', justifyContent: 'center', color: '#4a6080', fontSize: '12px' }}>
          <span>🔒 Secure</span>
          <span>⚡ Fast Payout</span>
          <span>🎁 Daily Bonus</span>
        </div>
      </div>
    </div>
  )
}
