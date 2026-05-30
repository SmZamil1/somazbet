import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminSupport() {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState('open')
  const [sending, setSending] = useState(false)

  useEffect(() => { loadTickets() }, [filter])

  async function loadTickets() {
    let q = supabase.from('support_tickets').select('*, users(username, phone)').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setTickets(data || [])
  }

  async function openTicket(t) {
    setSelected(t)
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', t.id).order('created_at')
    setMsgs(data || [])
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    const { data: m } = await supabase.from('ticket_messages').insert({ ticket_id: selected.id, sender_type: 'admin', message: reply }).select().single()
    if (m) setMsgs(prev => [...prev, m])
    setReply('')
    setSending(false)
  }

  async function updateStatus(t, status) {
    await supabase.from('support_tickets').update({ status }).eq('id', t.id)
    setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status } : x))
    if (selected?.id === t.id) setSelected(s => ({ ...s, status }))
  }

  const statusColors = { open: 'gold', in_progress: 'blue', resolved: 'green', closed: 'gray' }

  return (
    <AdminLayout title="Support & Feedback">
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.2fr' : '1fr', gap: '20px' }}>
        {/* Ticket list */}
        <div>
          <div className="tabs" style={{ marginBottom: '16px' }}>
            {['open','in_progress','resolved','all'].map(f => (
              <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => { setFilter(f); setSelected(null) }} style={{ textTransform: 'capitalize', fontSize: '11px' }}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tickets.map(t => (
              <div key={t.id} onClick={() => openTicket(t)} style={{ background: selected?.id === t.id ? 'var(--bg-elevated)' : 'var(--bg-card)', border: `1px solid ${selected?.id === t.id ? 'var(--accent-green)' : 'var(--border-subtle)'}`, borderRadius: 'var(--radius)', padding: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{t.users?.username || 'Unknown'}</span>
                  <span className={`badge badge-${statusColors[t.status] || 'gray'}`}>{t.status}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.subject}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(t.created_at).toLocaleString()}</div>
              </div>
            ))}
            {!tickets.length && <div className="empty-state">No tickets</div>}
          </div>
        </div>

        {/* Chat panel */}
        {selected && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700 }}>{selected.subject}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selected.users?.username} • {selected.users?.phone}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['open','in_progress','resolved','closed'].map(s => (
                  <button key={s} className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '10px', padding: '4px 8px' }} onClick={() => updateStatus(selected, s)}>
                    {s.replace('_',' ')}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 0' }}>
              {msgs.map(m => (
                <div key={m.id} style={{ alignSelf: m.sender_type === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', textAlign: m.sender_type === 'admin' ? 'right' : 'left' }}>
                    {m.sender_type === 'admin' ? '🛡️ Admin' : '👤 User'}
                  </div>
                  <div style={{ background: m.sender_type === 'admin' ? 'var(--accent-green)' : 'var(--bg-elevated)', color: m.sender_type === 'admin' ? 'var(--bg-deep)' : 'var(--text-primary)', padding: '10px 14px', borderRadius: m.sender_type === 'admin' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '13px' }}>
                    {m.message}
                  </div>
                </div>
              ))}
              {!msgs.length && <div className="empty-state">No messages yet</div>}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexShrink: 0 }}>
              <input className="input" placeholder="Type reply..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} />
              <button className="btn btn-primary" disabled={sending || !reply.trim()} onClick={sendReply}>Send</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
