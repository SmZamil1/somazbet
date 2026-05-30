// LeaderboardPage.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/shared/BottomNav'

export function LeaderboardPage() {
  const [leaders, setLeaders] = useState([])
  const medals = ['🥇','🥈','🥉']
  useEffect(() => {
    supabase.from('leaderboard').select('*').limit(20).then(({ data }) => setLeaders(data || []))
  }, [])
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">🏆 Leaderboard</div></div>
      <div style={{ padding: '20px' }}>
        {leaders.map((u, i) => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '32px', textAlign: 'center', fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
              {medals[i] || `#${i + 1}`}
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {(u.username || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{u.username}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.games_played} games</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: 'var(--accent-green)' }}>৳{Number(u.total_wins || 0).toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>won</div>
            </div>
          </div>
        ))}
        {!leaders.length && <div className="empty-state">No data yet</div>}
      </div>
      <BottomNav />
    </div>
  )
}

export default LeaderboardPage
