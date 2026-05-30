import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

const EMPTY = { name: '', phone: '', email: '', commission_rate: 5 }

export default function AdminAgents() {
  const [agents, setAgents] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    supabase.from('agents').select('*').order('created_at', { ascending: false }).then(({ data }) => setAgents(data || []))
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    const payload = { ...form, commission_rate: Number(form.commission_rate) }
    if (editing?.id) {
      await supabase.from('agents').update(payload).eq('id', editing.id)
      setAgents(prev => prev.map(a => a.id === editing.id ? { ...a, ...payload } : a))
    } else {
      const { data } = await supabase.from('agents').insert(payload).select().single()
      if (data) setAgents(prev => [data, ...prev])
    }
    setEditing(null)
  }

  async function toggleAgent(a) {
    await supabase.from('agents').update({ is_active: !a.is_active }).eq('id', a.id)
    setAgents(prev => prev.map(x => x.id === a.id ? { ...x, is_active: !x.is_active } : x))
  }

  return (
    <AdminLayout title="Agent Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={() => { setEditing({}); setForm(EMPTY) }}>+ Add Agent</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Email</th><th>Commission</th><th>Total Users</th><th>Total Commission</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.phone}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{a.email}</td>
                  <td><span className="badge badge-gold">{a.commission_rate}%</span></td>
                  <td>{a.total_users}</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>৳{Number(a.total_commission || 0).toLocaleString()}</td>
                  <td><span className={`badge badge-${a.is_active ? 'green' : 'red'}`}>{a.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditing(a); setForm({ ...a }) }}>Edit</button>
                    <button className={`btn btn-sm ${a.is_active ? 'btn-danger' : 'btn-primary'}`} onClick={() => toggleAgent(a)}>
                      {a.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
              {!agents.length && <tr><td colSpan={8}><div className="empty-state">No agents yet</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing.id ? 'Edit Agent' : 'Add Agent'}</div>
              <button className="modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="input-group"><label className="input-label">Name</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Phone</label><input className="input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Email</label><input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Commission Rate (%)</label><input className="input" type="number" min="0" max="50" step="0.5" value={form.commission_rate} onChange={e => set('commission_rate', e.target.value)} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={save}>Save Agent</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
