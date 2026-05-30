import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/shared/BottomNav'

export default function PromotionsPage() {
  const [promos, setPromos] = useState([])
  useEffect(() => {
    supabase.from('promotions').select('*').eq('is_active', true).then(({ data }) => setPromos(data || []))
  }, [])
  const bgColors = ['#0a3320', '#1a2a0a', '#2a1a0a', '#0a1a2a']
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">🎁 Promotions</div></div>
      <div style={{ padding: '20px' }}>
        {promos.map((p, i) => (
          <div key={p.id} style={{ background: `linear-gradient(135deg, ${bgColors[i % bgColors.length]}, var(--bg-card))`, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '64px', opacity: 0.2 }}>🎁</div>
            <span className="badge badge-gold" style={{ marginBottom: '10px' }}>{p.type || 'Bonus'}</span>
            <div style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>{p.title_en || 'Special Offer'}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{p.description_en}</div>
            {p.end_date && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Valid until: {p.end_date}</div>}
            <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Claim</button>
          </div>
        ))}
        {!promos.length && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎁</div>
            <div>No active promotions right now</div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
