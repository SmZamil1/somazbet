import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import BottomNav from '../../components/shared/BottomNav'

export default function AccountPage() {
  const { profile, signOut } = useAuth()
  const [tab, setTab] = useState('profile')

  const referralLink = `https://somazbet.com/register?ref=${profile?.referral_code}`

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">My Account</div>
        <button onClick={signOut} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Sign Out</button>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Profile card */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), #00a885)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani', fontSize: '24px', fontWeight: 700, color: 'var(--bg-deep)', flexShrink: 0 }}>
            {(profile?.username || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700 }}>{profile?.username}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{profile?.phone}</div>
            <span className={`badge badge-${profile?.vip_level > 0 ? 'gold' : 'gray'}`} style={{ marginTop: '6px' }}>
              {profile?.vip_level === 0 ? 'Standard' : `VIP ${profile.vip_level}`}
            </span>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>Profile</button>
          <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
          <button className={`tab ${tab === 'referral' ? 'active' : ''}`} onClick={() => setTab('referral')}>Referral</button>
        </div>

        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Username', value: profile?.username },
              { label: 'Phone', value: profile?.phone },
              { label: 'Balance', value: `৳ ${Number(profile?.balance || 0).toLocaleString()}` },
              { label: 'Bonus Balance', value: `৳ ${Number(profile?.bonus_balance || 0).toLocaleString()}` },
              { label: 'VIP Level', value: profile?.vip_level || 0 },
              { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{row.label}</span>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'security' && (
          <div>
            <div className="input-group">
              <label className="input-label">Current Password</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input className="input" type="password" placeholder="••••••••" />
            </div>
            <button className="btn btn-primary btn-full">Update Password</button>
          </div>
        )}

        {tab === 'referral' && (
          <div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Your Referral Code</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: '32px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>{profile?.referral_code}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input className="input" value={referralLink} readOnly style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={() => navigator.clipboard?.writeText(referralLink)}>Copy</button>
            </div>
            <div style={{ background: 'rgba(0,212,170,0.08)', borderRadius: 'var(--radius)', padding: '16px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--accent-green)' }}>🎁 Referral Rewards</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Earn ৳50 bonus for every friend who registers and makes their first deposit using your code.
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
