import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

const gameEmojis = { slots: '🎰', aviator: '✈️', poker: '🃏', casino: '🎲', sports: '⚽' }

export default function GameDetailPage() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    supabase.from('games').select('*').eq('id', id).single().then(({ data }) => {
      setGame(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>
  if (!game) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Game not found</div>

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-subtle)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700 }}>{game.name}</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>Min ৳{game.min_bet} | Max ৳{game.max_bet}</span>
      </div>

      {/* Balance bar */}
      <div style={{ background: 'var(--bg-card)', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Balance</div>
        <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, color: 'var(--accent-green)' }}>৳ {Number(profile?.balance || 0).toLocaleString()}</div>
        <button className="btn btn-primary btn-sm" onClick={() => nav('/wallet?tab=deposit')}>Deposit</button>
      </div>

      {/* Game area */}
      {game.game_url ? (
        <iframe
          src={game.game_url}
          style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none' }}
          title={game.name}
          allowFullScreen
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 120px)', gap: '20px' }}>
          <div style={{ fontSize: '80px' }}>{gameEmojis[game.category] || '🎮'}</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '28px', fontWeight: 700 }}>{game.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
            Game integration requires external game provider API.<br />
            Connect your game provider URL in Admin → Games.
          </div>
          <button className="btn btn-primary btn-lg" disabled style={{ opacity: 0.5 }}>Coming Soon</button>
        </div>
      )}
    </div>
  )
}
