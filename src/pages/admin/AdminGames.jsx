// AdminGames.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminGames() {
  const [games, setGames] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    supabase.from('games').select('*').order('sort_order').then(({ data }) => setGames(data || []))
  }, [])

  async function toggleGame(g) {
    await supabase.from('games').update({ is_active: !g.is_active }).eq('id', g.id)
    setGames(prev => prev.map(x => x.id === g.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function toggleVisible(g) {
    await supabase.from('games').update({ is_visible: !g.is_visible }).eq('id', g.id)
    setGames(prev => prev.map(x => x.id === g.id ? { ...x, is_visible: !x.is_visible } : x))
  }

  async function saveGame() {
    if (editing.id) {
      await supabase.from('games').update(form).eq('id', editing.id)
      setGames(prev => prev.map(g => g.id === editing.id ? { ...g, ...form } : g))
    } else {
      const { data } = await supabase.from('games').insert(form).select().single()
      if (data) setGames(prev => [...prev, data])
    }
    setEditing(null)
  }

  function startEdit(g) {
    setEditing(g)
    setForm({ name: g.name, category: g.category, min_bet: g.min_bet, max_bet: g.max_bet, game_url: g.game_url || '' })
  }

  return (
    <AdminLayout title="Game Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={() => { setEditing({}); setForm({ name: '', category: 'slots', min_bet: 1, max_bet: 1000, game_url: '' }) }}>
          + Add Game
        </button>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Game</th><th>Category</th><th>Min Bet</th><th>Max Bet</th><th>Active</th><th>Visible</th><th>Actions</th></tr></thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id}>
                  <td><strong>{g.name}</strong></td>
                  <td><span className="badge badge-blue">{g.category}</span></td>
                  <td>৳{g.min_bet}</td>
                  <td>৳{g.max_bet}</td>
                  <td>
                    <input type="checkbox" checked={g.is_active} onChange={() => toggleGame(g)} style={{ accentColor: 'var(--accent-green)' }} />
                  </td>
                  <td>
                    <input type="checkbox" checked={g.is_visible} onChange={() => toggleVisible(g)} style={{ accentColor: 'var(--accent-green)' }} />
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => startEdit(g)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing.id ? 'Edit Game' : 'Add Game'}</div>
              <button className="modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="input-group"><label className="input-label">Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="input-group"><label className="input-label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                {['slots','aviator','poker','casino','sports'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group"><label className="input-label">Min Bet ৳</label><input className="input" type="number" value={form.min_bet} onChange={e => setForm(f => ({...f, min_bet: e.target.value}))} /></div>
              <div className="input-group"><label className="input-label">Max Bet ৳</label><input className="input" type="number" value={form.max_bet} onChange={e => setForm(f => ({...f, max_bet: e.target.value}))} /></div>
            </div>
            <div className="input-group"><label className="input-label">Game URL (iframe)</label><input className="input" placeholder="https://..." value={form.game_url} onChange={e => setForm(f => ({...f, game_url: e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={saveGame}>Save Game</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
