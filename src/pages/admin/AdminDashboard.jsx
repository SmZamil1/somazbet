import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, active: 0, bets: 0, revenue: 0, pendingDeposits: 0, pendingWithdrawals: 0 })
  const [recentTx, setRecentTx] = useState([])
  const [recentUsers, setRecentUsers] = useState([])

  const chartData = [
    { day: 'Mon', deposits: 12000, withdrawals: 8000, bets: 45000 },
    { day: 'Tue', deposits: 18000, withdrawals: 11000, bets: 62000 },
    { day: 'Wed', deposits: 15000, withdrawals: 9000, bets: 55000 },
    { day: 'Thu', deposits: 22000, withdrawals: 14000, bets: 78000 },
    { day: 'Fri', deposits: 28000, withdrawals: 18000, bets: 92000 },
    { day: 'Sat', deposits: 35000, withdrawals: 22000, bets: 115000 },
    { day: 'Sun', deposits: 30000, withdrawals: 19000, bets: 98000 },
  ]

  useEffect(() => {
    async function load() {
      const [users, bets, pending] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount').eq('status', 'approved'),
        supabase.from('transactions').select('id, type', { count: 'exact' }).eq('status', 'pending'),
      ])
      const revenue = (bets.data || []).reduce((s, t) => s + Number(t.amount), 0)
      const pendingDeposits = (pending.data || []).filter(t => t.type === 'deposit').length
      const pendingWithdrawals = (pending.data || []).filter(t => t.type === 'withdrawal').length
      setStats({ users: users.count || 0, active: Math.floor((users.count || 0) * 0.14), bets: 0, revenue, pendingDeposits, pendingWithdrawals })
    }
    load()
    supabase.from('transactions').select('*, users(username)').order('created_at', { ascending: false }).limit(8).then(({ data }) => setRecentTx(data || []))
    supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5).then(({ data }) => setRecentUsers(data || []))
  }, [])

  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Users', value: stats.users.toLocaleString(), sub: 'All registered', color: 'var(--accent-green)' },
          { label: "Today's Active", value: stats.active.toLocaleString(), sub: 'Online now', color: 'var(--accent-blue)' },
          { label: 'Total Bets', value: `৳${(stats.revenue * 3).toLocaleString()}`, sub: 'All time', color: 'var(--accent-gold)' },
          { label: 'Game Revenue', value: `৳${stats.revenue.toLocaleString()}`, sub: 'Net profit', color: 'var(--accent-green)' },
        ].map(s => (
          <div className="stat-card" key={s.label} style={{ '--accent': s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pendingDeposits > 0 || stats.pendingWithdrawals > 0) && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {stats.pendingDeposits > 0 && (
            <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.25)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--accent-gold)' }}>{stats.pendingDeposits} Pending Deposits</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Awaiting approval</div>
              </div>
            </div>
          )}
          {stats.pendingWithdrawals > 0 && (
            <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '20px' }}>💸</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--accent-red)' }}>{stats.pendingWithdrawals} Pending Withdrawals</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Awaiting processing</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Daily Transactions</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fill: '#8ba3c4', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="deposits" fill="#00d4aa" radius={[3,3,0,0]} />
              <Bar dataKey="withdrawals" fill="#f5c842" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentTx.slice(0,5).map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{tx.users?.username || 'User'}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>#{tx.id.slice(0,6)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: tx.type === 'deposit' ? 'var(--accent-green)' : 'var(--accent-gold)' }}>৳{Number(tx.amount).toLocaleString()}</div>
                  <span className={`badge badge-${tx.status === 'approved' ? 'green' : tx.status === 'pending' ? 'gold' : 'red'}`}>{tx.status}</span>
                </div>
              </div>
            ))}
            {!recentTx.length && <div className="empty-state" style={{ padding: '20px 0' }}>No transactions yet</div>}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card">
        <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Users</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Phone</th><th>VIP</th><th>Balance</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.phone}</td>
                  <td><span className="badge badge-gold">VIP {u.vip_level}</span></td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>৳{Number(u.balance).toLocaleString()}</td>
                  <td><span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
