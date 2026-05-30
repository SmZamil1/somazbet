import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminLogs() {
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadBets() }, [filter])

  async function loadBets() {
    setLoading(true)
    let q = supabase.from('bet_records').select('*, users(username)').order('created_at', { ascending: false }).limit(100)
    if (filter !== 'all') q = q.eq('result', filter)
    const { data } = await q
    setBets(data || [])
    setLoading(false)
  }

  const filtered = bets.filter(b => !search || (b.users?.username || '').toLowerCase().includes(search.toLowerCase()) || (b.game_name || '').toLowerCase().includes(search.toLowerCase()))

  return (
    <AdminLayout title="Gaming Logs">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input className="input" style={{ flex: 1, minWidth: '200px' }} placeholder="Search user or game..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="tabs" style={{ margin: 0 }}>
          {['all','win','loss','pending'].map(f => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Game</th><th>Bet Amount</th><th>Win Amount</th><th>Result</th><th>Time</th></tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.users?.username || 'Unknown'}</strong></td>
                    <td>{b.game_name || '—'}</td>
                    <td style={{ color: 'var(--accent-red)' }}>৳{Number(b.bet_amount).toLocaleString()}</td>
                    <td style={{ color: 'var(--accent-green)' }}>৳{Number(b.win_amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${b.result === 'win' ? 'green' : b.result === 'loss' ? 'red' : 'gold'}`}>
                        {b.result || 'pending'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(b.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6}><div className="empty-state">No bet records found</div></td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
