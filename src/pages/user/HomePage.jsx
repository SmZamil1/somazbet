import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import BottomNav from '../../components/shared/BottomNav'

export default function HomePage() {
  const { profile, signOut } = useAuth()
  const [games, setGames] = useState([])
  const [promotions, setPromotions] = useState([])
  const [promoIdx, setPromoIdx] = useState(0)
  const nav = useNavigate()

  useEffect(() => {
    supabase.from('games').select('*').eq('is_active', true).limit(6).then(({ data }) => setGames(data || []))
    supabase.from('promotions').select('*').eq('is_active', true).limit(4).then(({ data }) => setPromotions(data || []))
  }, [])

  // Auto-rotate banner
  useEffect(() => {
    if (!promotions.length) return
    const t = setInterval(() => setPromoIdx(i => (i + 1) % promotions.length), 4000)
    return () => clearInterval(t)
  }, [promotions.length])

  const gameEmojis = { slots: '🎰', aviator: '✈️', poker: '🃏', casino: '🎲', sports: '⚽' }

  return (
    <div className="page" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: 'Rajdhani', fontSize: '24px', fontWeight: 700, color: 'var(--accent-green)' }}>SomazBet</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '6px 14px', color: 'var(--accent-green)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => nav('/wallet')}>
            ৳ {Number(profile?.balance || 0).toLocaleString()}
          </button>
          <button onClick={() => nav('/support')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>
          </button>
        </div>
      </header>

      <div className="page-body">
        {/* Welcome */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Welcome back,</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '22px', fontWeight: 700 }}>{profile?.username || 'Player'} {profile?.vip_level > 0 && <span className={`vip-${profile.vip_level}`}>★ VIP {profile.vip_level}</span>}</div>
        </div>

        {/* Banner */}
        {promotions.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #0f3d2e, #0a2820)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(0,212,170,0.2)', minHeight: '100px' }}>
            <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '60px', opacity: 0.3 }}>🎁</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, marginBottom: '6px', color: 'var(--accent-gold)' }}>
              {promotions[promoIdx]?.title_en || 'Special Offer'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '220px' }}>
              {promotions[promoIdx]?.description_en || 'Check your latest promotions!'}
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => nav('/promotions')}>
              Claim Now
            </button>
            {/* Dots */}
            <div style={{ display: 'flex', gap: '6px', position: 'absolute', bottom: '14px', right: '16px' }}>
              {promotions.map((_, i) => (
                <div key={i} style={{ width: i === promoIdx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === promoIdx ? 'var(--accent-green)' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {[
            { icon: '💰', label: 'Deposit', action: () => nav('/wallet?tab=deposit') },
            { icon: '📤', label: 'Withdraw', action: () => nav('/wallet?tab=withdraw') },
            { icon: '🏆', label: 'Ranking', action: () => nav('/leaderboard') },
            { icon: '📢', label: 'Invite', action: () => nav('/account?tab=referral') },
          ].map(q => (
            <button key={q.label} onClick={q.action} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius)', padding: '14px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-green)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <span style={{ fontSize: '24px' }}>{q.icon}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{q.label}</span>
            </button>
          ))}
        </div>

        {/* Games section */}
        <div className="section-header">
          <span className="section-title">🎮 Games</span>
          <span className="section-link" onClick={() => nav('/games')}>See all →</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
          {games.map(g => (
            <div key={g.id} className="game-card" onClick={() => nav(`/games/${g.id}`)}>
              <div className="game-card-img">
                <span style={{ fontSize: '40px' }}>{gameEmojis[g.category] || '🎮'}</span>
              </div>
              <div className="game-card-name">{g.name}</div>
            </div>
          ))}
          {!games.length && [1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', aspectRatio: '4/3', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>

        {/* Offers section */}
        <div className="section-header">
          <span className="section-title">🎁 Offers</span>
          <span className="section-link" onClick={() => nav('/promotions')}>See all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {[
            { emoji: '🎰', title: 'Daily Bonus', sub: 'Login every day', color: '#00d4aa' },
            { emoji: '👥', title: 'Refer & Earn', sub: 'Invite friends', color: '#f5c842' },
          ].map(o => (
            <div key={o.title} style={{ background: `linear-gradient(135deg, rgba(${o.color === '#00d4aa' ? '0,212,170' : '245,200,66'},0.1), var(--bg-card))`, border: `1px solid rgba(${o.color === '#00d4aa' ? '0,212,170' : '245,200,66'},0.2)`, borderRadius: 'var(--radius-lg)', padding: '16px', cursor: 'pointer' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{o.emoji}</div>
              <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '15px' }}>{o.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{o.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
