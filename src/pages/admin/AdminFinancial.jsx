import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminFinancial() {
  const [tab, setTab] = useState('deposits')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(null)

  useEffect(() => { loadTx() }, [tab])

  async function loadTx() {
    setLoading(true)
    const type = tab === 'deposits' ? 'deposit' : 'withdrawal'
    const { data } = await supabase.from('transactions').select('*, users(username, phone)').eq('type', type).eq('status', 'pending').order('created_at')
    setTransactions(data || [])
    setLoading(false)
  }

  async function action(tx, status) {
    setProcessing(tx.id)
    await supabase.from('transactions').update({ status, processed_at: new Date().toISOString() }).eq('id', tx.id)
    if (status === 'approved' && tx.type === 'deposit') {
      await supabase.rpc('update_user_balance', { p_user_id: tx.user_id, p_amount: tx.amount, p_type: 'add' })
    }
    setTransactions(prev => prev.filter(t => t.id !== tx.id))
    setProcessing(null)
  }

  return (
    <AdminLayout title="Financial Control">
      <div className="tabs" style={{ maxWidth: '400px' }}>
        <button className={`tab ${tab === 'deposits' ? 'active' : ''}`} onClick={() => setTab('deposits')}>Pending Deposits</button>
        <button className={`tab ${tab === 'withdrawals' ? 'active' : ''}`} onClick={() => setTab('withdrawals')}>Pending Withdrawals</button>
        <button className={`tab ${tab === 'methods' ? 'active' : ''}`} onClick={() => setTab('methods')}>Payment Config</button>
      </div>

      {tab !== 'methods' && (
        <div className="card">
          {loading ? <div className="spinner" /> : (
            <>
              {transactions.length === 0 && <div className="empty-state">No pending {tab} 🎉</div>}
              {transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{tx.users?.username}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.users?.phone}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Method: <strong>{tx.payment_method?.toUpperCase()}</strong>
                      {tx.payment_reference && <> | TxID: <strong>{tx.payment_reference}</strong></>}
                      {tx.bank_info?.phone && <> | Phone: <strong>{tx.bank_info.phone}</strong></>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: '22px', fontWeight: 700, color: 'var(--accent-green)' }}>৳{Number(tx.amount).toLocaleString()}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary btn-sm" disabled={!!processing} onClick={() => action(tx, 'approved')}>
                      {processing === tx.id ? '...' : 'Approve'}
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={!!processing} onClick={() => action(tx, 'rejected')}>Reject</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'methods' && <PaymentMethodsConfig />}
    </AdminLayout>
  )
}

function PaymentMethodsConfig() {
  const [methods, setMethods] = useState([])
  useEffect(() => {
    supabase.from('payment_methods').select('*').order('sort_order').then(({ data }) => setMethods(data || []))
  }, [])

  async function toggle(m) {
    await supabase.from('payment_methods').update({ is_active: !m.is_active }).eq('id', m.id)
    setMethods(prev => prev.map(pm => pm.id === m.id ? { ...pm, is_active: !pm.is_active } : pm))
  }

  return (
    <div className="card">
      <div style={{ fontFamily: 'Rajdhani', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Payment Methods</div>
      {methods.map(m => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{m.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.type}</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.is_active ? 'Active' : 'Disabled'}</span>
            <input type="checkbox" checked={m.is_active} onChange={() => toggle(m)} style={{ accentColor: 'var(--accent-green)', width: '16px', height: '16px' }} />
          </label>
        </div>
      ))}
    </div>
  )
}
