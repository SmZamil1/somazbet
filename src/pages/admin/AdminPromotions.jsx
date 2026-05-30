import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

const EMPTY = { title_en: '', title_local: '', description_en: '', type: 'bonus', bonus_amount: '', bonus_percent: '', min_deposit: '', start_date: '', end_date: '', is_active: true, visibility: true }

export default function AdminPromotions() {
  const [promos, setPromos] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    supabase.from('promotions').select('*').order('created_at', { ascending: false }).then(({ data }) => setPromos(data || []))
  }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    const payload = { ...form, bonus_amount: Number(form.bonus_amount) || null, bonus_percent: Number(form.bonus_percent) || null, min_deposit: Number(form.min_deposit) || null }
    if (editing?.id) {
      await supabase.from('promotions').update(payload).eq('id', editing.id)
      setPromos(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p))
    } else {
      const { data } = await supabase.from('promotions').insert(payload).select().single()
      if (data) setPromos(prev => [data, ...prev])
    }
    setEditing(null)
  }

  async function toggleActive(p) {
    await supabase.from('promotions').update({ is_active: !p.is_active }).eq('id', p.id)
    setPromos(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function deletePromo(p) {
    if (!confirm('Delete this promotion?')) return
    await supabase.from('promotions').delete().eq('id', p.id)
    setPromos(prev => prev.filter(x => x.id !== p.id))
  }

  function startNew() { setEditing({}); setForm(EMPTY) }
  function startEdit(p) { setEditing(p); setForm({ ...p }) }

  return (
    <AdminLayout title="Promotion Manager">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={startNew}>+ New Promotion</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {promos.map(p => (
          <div key={p.id} className="card" style={{ borderColor: p.is_active ? 'var(--border)' : 'var(--border-subtle)', opacity: p.is_active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span className={`badge badge-${p.type === 'bonus' ? 'green' : p.type === 'cashback' ? 'blue' : p.type === 'referral' ? 'gold' : 'gray'}`}>{p.type}</span>
              <span className={`badge badge-${p.is_active ? 'green' : 'gray'}`}>{p.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{p.title_en || 'Untitled'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '40px' }}>{p.description_en}</div>
            {p.bonus_amount && <div style={{ fontSize: '14px', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '4px' }}>৳{p.bonus_amount} Bonus</div>}
            {p.bonus_percent && <div style={{ fontSize: '14px', color: 'var(--accent-green)', fontWeight: 600, marginBottom: '4px' }}>{p.bonus_percent}% Bonus</div>}
            {p.end_date && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Until: {p.end_date}</div>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => startEdit(p)}>Edit</button>
              <button className="btn btn-sm" style={{ flex: 1, background: p.is_active ? 'rgba(255,71,87,0.15)' : 'rgba(0,212,170,0.15)', color: p.is_active ? 'var(--accent-red)' : 'var(--accent-green)', border: 'none' }} onClick={() => toggleActive(p)}>
                {p.is_active ? 'Disable' : 'Enable'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => deletePromo(p)}>Del</button>
            </div>
          </div>
        ))}
        {!promos.length && <div className="empty-state" style={{ gridColumn: '1/-1' }}>No promotions yet. Create one!</div>}
      </div>

      {editing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-title">{editing.id ? 'Edit Promotion' : 'New Promotion'}</div>
              <button className="modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="input-group"><label className="input-label">Title (English)</label><input className="input" value={form.title_en} onChange={e => set('title_en', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Title (Local Language)</label><input className="input" value={form.title_local} onChange={e => set('title_local', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Description</label><textarea className="input" rows={3} style={{ resize: 'vertical' }} value={form.description_en} onChange={e => set('description_en', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                {['bonus','cashback','referral','event'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group"><label className="input-label">Bonus Amount ৳</label><input className="input" type="number" value={form.bonus_amount} onChange={e => set('bonus_amount', e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Bonus Percent %</label><input className="input" type="number" value={form.bonus_percent} onChange={e => set('bonus_percent', e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Min Deposit ৳</label><input className="input" type="number" value={form.min_deposit} onChange={e => set('min_deposit', e.target.value)} /></div>
              <div className="input-group" />
              <div className="input-group"><label className="input-label">Start Date</label><input className="input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
              <div className="input-group"><label className="input-label">End Date</label><input className="input" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: 'var(--accent-green)' }} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="checkbox" checked={form.visibility} onChange={e => set('visibility', e.target.checked)} style={{ accentColor: 'var(--accent-green)' }} />
                Visible to users
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={save}>Save Promotion</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
