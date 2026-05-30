import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    let q = supabase.from('users').select('*').order('created_at', { ascending: false })
    if (search) q = q.ilike('username', `%${search}%`)
    const { data } = await q
    setUsers(data || [])
    setLoading(false)
  }

  async function toggleBan(user) {
    setActionLoading(true)
    await supabase.from('users').update({ is_banned: !user.is_banned }).eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_banned: !u.is_banned } : u))
    if (selected?.id === user.id) setSelected(u => ({ ...u, is_banned: !u.is_banned }))
    setActionLoading(false)
  }

  async function adjustBalance(user, amount, type) {
    const delta = type === 'add' ? Number(amount) : -Number(amount)
    const newBalance = Number(user.balance) + delta
    if (newBalance < 0) return alert('Insufficient balance')
    setActionLoading(true)
    await supabase.from('users').update({ balance: newBalance }).eq('id', user.id)
    await supabase.from('transactions').insert({ user_id: user.id, type: type === 'add' ? 'bonus' : 'refund', amount: Math.abs(delta), status: 'approved', admin_note: 'Manual adjustment' })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, balance: newBalance } : u))
    if (selected?.id === user.id) setSelected(u => ({ ...u, balance: newBalance }))
    setActionLoading(false)
  }

  async function setVip(user, level) {
    await supabase.from('users').update({ vip_level: level }).eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, vip_level: level } : u))
    if (selected?.id === user.id) setSelected(u => ({ ...u, vip_level: level }))
  }

  return (
    <AdminLayout title="User Management">
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: '20px' }}>
        <div className="card">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input className="input" style={{ flex: 1 }} placeholder="Search username, phone..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-primary" onClick={loadUsers}>Search</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>User</th><th>Phone</th><th>VIP</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading...</td></tr>
                  : users.map(u => (
                  <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(u)}>
                    <td><strong>{u.username}</strong><br /><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{u.id.slice(0,8)}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.phone}</td>
                    <td><span className={`badge badge-${u.vip_level > 0 ? 'gold' : 'gray'}`}>VIP {u.vip_level}</span></td>
                    <td><span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>৳{Number(u.balance).toLocaleString()}</span></td>
                    <td>
                      <span className={`badge badge-${u.is_banned ? 'red' : 'green'}`}>
                        {u.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button className={`btn btn-sm ${u.is_banned ? 'btn-primary' : 'btn-danger'}`} onClick={e => { e.stopPropagation(); toggleBan(u) }}>
                        {u.is_banned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User detail panel */}
        {selected && (
          <div className="card" style={{ alignSelf: 'start', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700 }}>User Profile</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 700, fontSize: '20px', color: 'var(--bg-deep)' }}>
                {(selected.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ fontWeight: 700 }}>{selected.username}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selected.phone}</div>
            </div>
            {[
              ['Balance', `৳${Number(selected.balance).toLocaleString()}`],
              ['Bonus', `৳${Number(selected.bonus_balance || 0).toLocaleString()}`],
              ['VIP Level', selected.vip_level],
              ['Status', selected.is_banned ? '🚫 Banned' : '✅ Active'],
              ['Joined', new Date(selected.created_at).toLocaleDateString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Manage Balance</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input id="balAmt" className="input" type="number" placeholder="Amount" style={{ flex: 1 }} />
                <button className="btn btn-primary btn-sm" disabled={actionLoading} onClick={() => adjustBalance(selected, document.getElementById('balAmt').value, 'add')}>+Add</button>
                <button className="btn btn-danger btn-sm" disabled={actionLoading} onClick={() => adjustBalance(selected, document.getElementById('balAmt').value, 'sub')}>-Sub</button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>VIP Level</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2,3].map(l => (
                  <button key={l} onClick={() => setVip(selected, l)} className={`btn btn-sm ${selected.vip_level === l ? 'btn-gold' : 'btn-outline'}`} style={{ flex: 1 }}>
                    {l === 0 ? 'STD' : `VIP${l}`}
                  </button>
                ))}
              </div>
              <button className={`btn btn-full btn-sm ${selected.is_banned ? 'btn-primary' : 'btn-danger'}`} disabled={actionLoading} onClick={() => toggleBan(selected)}>
                {selected.is_banned ? '✅ Unban User' : '🚫 Ban User'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
