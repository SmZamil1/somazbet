import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'User Management', icon: '👥' },
  { path: '/admin/games', label: 'Game Management', icon: '🎮' },
  { path: '/admin/financial', label: 'Financial Control', icon: '💰' },
  { path: '/admin/logs', label: 'Gaming Logs', icon: '📋' },
  { path: '/admin/promotions', label: 'Promotion Manager', icon: '🎁' },
  { path: '/admin/agents', label: 'Agent Management', icon: '🤝' },
  { path: '/admin/content', label: 'Content & App', icon: '📱' },
  { path: '/admin/support', label: 'Support & Feedback', icon: '💬' },
  { path: '/admin/settings', label: 'System Settings', icon: '⚙️' },
]

export default function AdminLayout({ children, title }) {
  const nav = useNavigate()
  const loc = useLocation()
  const { adminUser, signOut } = useAuth()
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ display: 'flex' }}>
        <div className="sidebar-logo">
          <div className="logo">SomazBet</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(item => (
            <button
              key={item.path}
              className={`sidebar-item ${loc.pathname === item.path ? 'active' : ''}`}
              onClick={() => nav(item.path)}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {adminUser?.username || adminUser?.email}
          </div>
          <button className="btn btn-outline btn-sm btn-full" onClick={signOut}>Sign Out</button>
        </div>
      </aside>

      {/* Main area */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700 }}>{title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--bg-deep)', fontSize: '14px' }}>
              A
            </div>
          </div>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
