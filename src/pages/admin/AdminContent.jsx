import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminContent() {
  const [tab, setTab] = useState('banners')
  const [versions, setVersions] = useState([])
  const [vForm, setVForm] = useState({ platform: 'android', version: '', release_notes: '', apk_url: '', is_force_update: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('app_versions').select('*').order('created_at', { ascending: false }).then(({ data }) => setVersions(data || []))
  }, [])

  function setV(k, v) { setVForm(f => ({ ...f, [k]: v })) }

  async function publishVersion() {
    setSaving(true)
    const { data } = await supabase.from('app_versions').insert({ ...vForm, is_active: true }).select().single()
    if (data) setVersions(prev => [data, ...prev])
    setVForm({ platform: 'android', version: '', release_notes: '', apk_url: '', is_force_update: false })
    setSaving(false)
  }

  async function toggleVersion(v) {
    await supabase.from('app_versions').update({ is_active: !v.is_active }).eq('id', v.id)
    setVersions(prev => prev.map(x => x.id === v.id ? { ...x, is_active: !x.is_active } : x))
  }

  return (
    <AdminLayout title="Content & App Control">
      <div className="tabs" style={{ maxWidth: '500px' }}>
        <button className={`tab ${tab === 'banners' ? 'active' : ''}`} onClick={() => setTab('banners')}>Banner Manager</button>
        <button className={`tab ${tab === 'app' ? 'active' : ''}`} onClick={() => setTab('app')}>App Versions</button>
        <button className={`tab ${tab === 'pages' ? 'active' : ''}`} onClick={() => setTab('pages')}>Pages & Links</button>
      </div>

      {tab === 'banners' && (
        <div className="card">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Promotional Banners</div>
          <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 'var(--radius)', padding: '14px', marginBottom: '20px', fontSize: '13px', color: 'var(--accent-gold)' }}>
            💡 Banners are managed through the Promotions page. Active promotions with banner_url set will appear on the app home screen.
          </div>
          <div className="input-group">
            <label className="input-label">Home Screen Banner Text (top message)</label>
            <input className="input" placeholder="e.g. Welcome Bonus 100% up to ৳5000!" />
          </div>
          <div className="input-group">
            <label className="input-label">Marquee / Ticker Text</label>
            <input className="input" placeholder="e.g. 🎉 New games added! Deposit now and win big!" />
          </div>
          <button className="btn btn-primary">Save Banner Settings</button>
        </div>
      )}

      {tab === 'app' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Publish New Version</div>
            <div className="input-group">
              <label className="input-label">Platform</label>
              <select className="input" value={vForm.platform} onChange={e => setV('platform', e.target.value)}>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Version Number</label>
              <input className="input" placeholder="e.g. 1.2.3" value={vForm.version} onChange={e => setV('version', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">APK / App URL</label>
              <input className="input" placeholder="https://..." value={vForm.apk_url} onChange={e => setV('apk_url', e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Release Notes</label>
              <textarea className="input" rows={3} placeholder="What's new in this version..." value={vForm.release_notes} onChange={e => setV('release_notes', e.target.value)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', cursor: 'pointer', fontSize: '14px' }}>
              <input type="checkbox" checked={vForm.is_force_update} onChange={e => setV('is_force_update', e.target.checked)} style={{ accentColor: 'var(--accent-red)', width: '16px', height: '16px' }} />
              Force Update (users must update before using app)
            </label>
            <button className="btn btn-primary btn-full" disabled={saving || !vForm.version} onClick={publishVersion}>
              {saving ? 'Publishing...' : 'Publish Version'}
            </button>
          </div>

          <div className="card">
            <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Version History</div>
            {versions.map(v => (
              <div key={v.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>v{v.version}</span>
                    <span className="badge badge-blue">{v.platform}</span>
                    {v.is_force_update && <span className="badge badge-red">Force</span>}
                    <span className={`badge badge-${v.is_active ? 'green' : 'gray'}`}>{v.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleVersion(v)}>
                    {v.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{v.release_notes}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{new Date(v.created_at).toLocaleDateString()}</div>
              </div>
            ))}
            {!versions.length && <div className="empty-state">No versions published yet</div>}
          </div>
        </div>
      )}

      {tab === 'pages' && (
        <div className="card">
          <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>App Links & Pages</div>
          {[
            { label: 'Terms & Conditions URL', placeholder: 'https://...' },
            { label: 'Privacy Policy URL', placeholder: 'https://...' },
            { label: 'Contact Telegram', placeholder: '@yourtelegram' },
            { label: 'Contact WhatsApp', placeholder: '+880XXXXXXXXXX' },
            { label: 'Live Chat URL', placeholder: 'https://...' },
          ].map(f => (
            <div className="input-group" key={f.label}>
              <label className="input-label">{f.label}</label>
              <input className="input" placeholder={f.placeholder} />
            </div>
          ))}
          <button className="btn btn-primary">Save Links</button>
        </div>
      )}
    </AdminLayout>
  )
}
