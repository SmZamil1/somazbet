import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import BottomNav from '../../components/shared/BottomNav'

export default function SupportPage() {
  const [tab, setTab] = useState('chat')
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [msgs, setMsgs] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const { profile } = useAuth()

  useEffect(() => {
    if (!profile) return
    supabase.from('support_tickets').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).then(({ data }) => setTickets(data || []))
  }, [profile])

  async function openTicket(ticket) {
    setSelected(ticket)
    setTab('chat')
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticket.id).order('created_at')
    setMsgs(data || [])
  }

  async function createTicket() {
    if (!subject) return
    setLoading(true)
    const { data: t } = await supabase.from('support_tickets').insert({ user_id: profile.id, subject }).select().single()
    if (t) {
      setTickets(prev => [t, ...prev])
      setSelected(t)
      setMsgs([])
      setSubject('')
    }
    setLoading(false)
  }

  async function sendMsg() {
    if (!newMsg.trim() || !selected) return
    const { data: m } = await supabase.from('ticket_messages').insert({ ticket_id: selected.id, sender_type: 'user', sender_id: profile.id, message: newMsg }).select().single()
    if (m) setMsgs(prev => [...prev, m])
    setNewMsg('')
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Help & Support</div>
      </div>
      <div style={{ padding: '20px 20px 0' }}>
        <div className="tabs">
          <button className={`tab ${tab === 'tickets' ? 'active' : ''}`} onClick={() => { setSelected(null); setTab('tickets') }}>My Tickets</button>
          <button className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>New Ticket</button>
          {selected && <button className={`tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>Chat</button>}
        </div>

        {tab === 'new' && (
          <div>
            <div className="input-group">
              <label className="input-label">Subject</label>
              <input className="input" placeholder="Describe your issue..." value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" disabled={loading || !subject} onClick={createTicket}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        )}

        {tab === 'tickets' && (
          <div>
            {tickets.length === 0 && <div className="empty-state">No tickets yet</div>}
            {tickets.map(t => (
              <div key={t.id} onClick={() => openTicket(t)} style={{ padding: '14px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', marginBottom: '10px', cursor: 'pointer', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{t.subject}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`badge badge-${t.status === 'resolved' ? 'green' : t.status === 'open' ? 'gold' : 'blue'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'chat' && selected && (
          <div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>#{selected.id.slice(0,8)} — {selected.subject}</div>
            <div style={{ minHeight: '300px', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {msgs.length === 0 && <div className="empty-state" style={{ padding: '20px' }}>No messages yet. Describe your issue.</div>}
              {msgs.map(m => (
                <div key={m.id} style={{ alignSelf: m.sender_type === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', background: m.sender_type === 'user' ? 'var(--accent-green)' : 'var(--bg-elevated)', color: m.sender_type === 'user' ? 'var(--bg-deep)' : 'var(--text-primary)', padding: '10px 14px', borderRadius: m.sender_type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '13px' }}>
                  {m.message}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
              <button className="btn btn-primary" onClick={sendMsg}>Send</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
