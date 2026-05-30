import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/shared/BottomNav'

const CATS = ['All', 'Slots', 'Aviator', 'Poker', 'Casino', 'Sports']
const gameEmojis = { slots: '🎰', aviator: '✈️', poker: '🃏', casino: '🎲', sports: '⚽' }

export default function GamesPage() {
  const [games, setGames] = useState([])
  const [cat, setCat] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    let q = supabase.from('games').select('*').eq('is_active', true)
    if (cat !== 'All') q = q.eq('category', cat.toLowerCase())
    q.then(({ data }) => { setGames(data || []); setLoading(false) })
  }, [cat])

  const filtered = games.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Games</div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <input className="input" placeholder="🔍 Search games..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${cat === c ? 'var(--accent-green)' : 'var(--border-subtle)'}`, background: cat === c ? 'var(--accent-green)' : 'transparent', color: cat === c ? 'var(--bg-deep)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[...Array(9)].map((_, i) => <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', aspectRatio: '3/4', animation: 'pulse 1.5s ease infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {filtered.map(g => (
              <div key={g.id} className="game-card" onClick={() => nav(`/games/${g.id}`)}>
                <div className="game-card-img">
                  <span style={{ fontSize: '44px' }}>{gameEmojis[g.category] || '🎮'}</span>
                </div>
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Min ৳{g.min_bet}</div>
                </div>
              </div>
            ))}
            {!filtered.length && <div className="empty-state" style={{ gridColumn: '1/-1' }}>No games found</div>}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
