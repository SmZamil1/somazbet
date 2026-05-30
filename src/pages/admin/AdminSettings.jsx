import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('system_settings').select('*').then(({ data }) => {
      const s = {}
      ;(data || []).forEach(row => { s[row.key] = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : row.value })
      setSettings(s)
    })
  }, [])

  function set(k, v) { setSettings(s => ({ ...s, [k]: v })) }

  async function saveSettings() {
    setSaving(true)
    const updates = Object.entries(settings).map(([key, value]) => supabase.from('system_settings').upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }))
    await Promise.all(updates)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    {
      title: '🏢 Site Configuration',
      fields: [
        { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'SomazBet' },
        { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
      ]
    },
    {
      title: '💰 Financial Limits',
      fields: [
        { key: 'min_deposit', label: 'Minimum Deposit (৳)', type: 'number' },
        { key: 'max_withdrawal', label: 'Maximum Withdrawal (৳)', type: 'number' },
        { key: 'referral_bonus', label: 'Referral Bonus (৳)', type: 'number' },
      ]
    },
    {
      title: '🔐 Security',
      fields: [
        { key: 'max_login_attempts', label: 'Max Login Attempts', type: 'number' },
        { key: 'session_timeout_hours', label: 'Session Timeout (hours)', type: 'number' },
      ]
    },
  ]

  return (
    <AdminLayout title="System Settings">
      {saved && (
        <div style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid var(--accent-green)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '20px', color: 'var(--accent-green)', fontSize: '14px', fontWeight: 500 }}>
          ✅ Settings saved successfully!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sections.map(sec => (
          <div className="card" key={sec.title}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>{sec.title}</div>
            {sec.fields.map(f => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label}</label>
                {f.type === 'toggle' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <span style={{ fontSize: '13px', color: settings[f.key] === 'true' || settings[f.key] === true ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                      {settings[f.key] === 'true' || settings[f.key] === true ? 'ON' : 'OFF'}
                    </span>
                    <div onClick={() => set(f.key, !(settings[f.key] === 'true' || settings[f.key] === true))} style={{ width: '44px', height: '24px', borderRadius: '12px', background: settings[f.key] === 'true' || settings[f.key] === true ? 'var(--accent-red)' : 'var(--bg-elevated)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: settings[f.key] === 'true' || settings[f.key] === true ? '22px' : '2px', transition: 'left 0.3s' }} />
                    </div>
                  </label>
                ) : (
                  <input
                    className="input"
                    type={f.type}
                    value={settings[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={e => set(f.key, e.target.value)}
                    style={{ width: '200px', textAlign: 'right' }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Admin account section */}
        <div className="card">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>👤 Admin Account</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group"><label className="input-label">New Admin Email</label><input className="input" type="email" placeholder="admin@somazbet.com" /></div>
            <div className="input-group"><label className="input-label">Password</label><input className="input" type="password" placeholder="••••••••" /></div>
          </div>
          <div className="input-group">
            <label className="input-label">Role</label>
            <select className="input">
              <option value="admin">Admin</option>
              <option value="support">Support</option>
              <option value="finance">Finance</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <button className="btn btn-outline">Create Admin Account</button>
        </div>

        <button className="btn btn-primary btn-lg" disabled={saving} onClick={saveSettings} style={{ alignSelf: 'flex-start', minWidth: '200px' }}>
          {saving ? 'Saving...' : '💾 Save All Settings'}
        </button>
      </div>
    </AdminLayout>
  )
}
