import { useNavigate, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/home', label: 'Home', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { path: '/games', label: 'Games', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01M7 12h.01M17 12h.01"/><path d="M9 10v4M7 12h4"/></svg>
  )},
  { path: '/wallet', label: 'Wallet', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  )},
  { path: '/promotions', label: 'Promo', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
  )},
  { path: '/account', label: 'Account', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
]

export default function BottomNav() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.path}
          className={`bottom-nav-item ${pathname === item.path ? 'active' : ''}`}
          onClick={() => nav(item.path)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  )
}
