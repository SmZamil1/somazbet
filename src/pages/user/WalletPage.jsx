import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import BottomNav from '../../components/shared/BottomNav'

const METHODS = [
  { id: 'bkash', name: 'bKash', emoji: '📱' },
  { id: 'nagad', name: 'Nagad', emoji: '💳' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀' },
  { id: 'bank', name: 'Bank', emoji: '🏦' },
]

export default function WalletPage() {
  const loc = useLocation()
  const initTab = loc.search.includes('withdraw') ? 'withdraw' : loc.search.includes('deposit') ? 'deposit' : 'deposit'
  const [tab, setTab] = useState(initTab)
  const [method, setMethod] = useState(METHODS[0])
  const [amount, setAmount] = useState('')
  const [txnId, setTxnId] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [history, setHistory] = useState([])
  const { profile, refreshProfile } = useAuth()

  useEffect(() => {
    if (!profile) return
    supabase.from('transactions').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setHistory(data || []))
  }, [profile])

  async function submitDeposit() {
    if (!amount || Number(amount) < 10) { setMsg({ type: 'error', text: 'Minimum deposit is ৳10' }); return }
    setLoading(true)
    const { error } = await supabase.from('transactions').insert({
      user_id: profile.id,
      type: 'deposit',
      amount: Number(amount),
      status: 'pending',
      payment_method: method.id,
      payment_reference: txnId,
      bank_info: { phone }
    })
    setLoading(false)
    if (error) setMsg({ type: 'error', text: 'Failed to submit. Try again.' })
    else {
      setMsg({ type: 'success', text: 'Deposit submitted! Pending admin approval.' })
      setAmount(''); setTxnId(''); setPhone('')
      refreshProfile()
    }
  }

  async function submitWithdraw() {
    if (!amount || Number(amount) < 100) { setMsg({ type: 'error', text: 'Minimum withdrawal is ৳100' }); return }
    if (Number(amount) > Number(profile?.balance || 0)) { setMsg({ type: 'error', text: 'Insufficient balance' }); return }
    setLoading(true)
    const { error } = await supabase.from('transactions').insert({
      user_id: profile.id,
      type: 'withdrawal',
      amount: Number(amount),
      status: 'pending',
      payment_method: method.id,
      bank_info: { phone }
    })
    setLoading(false)
    if (error) setMsg({ type: 'error', text: 'Failed to submit.' })
    else {
      setMsg({ type: 'success', text: 'Withdrawal requested! Processing 1-24 hours.' })
      setAmount(''); setPhone('')
    }
  }

  const quick = [100, 500, 1000, 5000]

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Wallet</div>
      </div>

      {/* Balance card */}
      <div style={{ padding: '20px', paddingBottom: 0 }}>
        <div style={{ background: 'linear-gradient(135deg, #0a3320, #0f2a1a)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>Available Balance</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: '42px', fontWeight: 700, color: 'var(--accent-green)' }}>
            ৳ {Number(profile?.balance || 0).toLocaleString('en', { minimumFractionDigits: 2 })}
          </div>
          {profile?.bonus_balance > 0 && (
            <div style={{ fontSize: '13px', color: 'var(--accent-gold)', marginTop: '4px' }}>+ ৳{profile.bonus_balance} Bonus</div>
          )}
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'deposit' ? 'active' : ''}`} onClick={() => { setTab('deposit'); setMsg(null) }}>Deposit</button>
          <button className={`tab ${tab === 'withdraw' ? 'active' : ''}`} onClick={() => { setTab('withdraw'); setMsg(null) }}>Withdraw</button>
          <button className={`tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>History</button>
        </div>

        {msg && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius)', marginBottom: '16px', background: msg.type === 'success' ? 'rgba(0,212,170,0.1)' : 'rgba(255,71,87,0.1)', border: `1px solid ${msg.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)'}`, color: msg.type === 'success' ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '13px' }}>
            {msg.text}
          </div>
        )}

        {(tab === 'deposit' || tab === 'withdraw') && (
          <>
            {/* Payment method */}
            <div style={{ marginBottom: '16px' }}>
              <div className="input-label" style={{ marginBottom: '8px' }}>Payment Method</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m)} style={{ padding: '10px', borderRadius: 'var(--radius)', border: `1px solid ${method.id === m.id ? 'var(--accent-green)' : 'var(--border-subtle)'}`, background: method.id === m.id ? 'rgba(0,212,170,0.1)' : 'var(--bg-elevated)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '20px' }}>{m.emoji}</div>
                    <div style={{ fontSize: '11px', color: method.id === m.id ? 'var(--accent-green)' : 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>{m.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick amount */}
            <div className="input-label" style={{ marginBottom: '8px' }}>Amount (৳)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {quick.map(q => (
                <button key={q} onClick={() => setAmount(String(q))} style={{ padding: '8px', borderRadius: 'var(--radius-sm)', border: `1px solid ${amount === String(q) ? 'var(--accent-green)' : 'var(--border-subtle)'}`, background: amount === String(q) ? 'rgba(0,212,170,0.1)' : 'var(--bg-elevated)', color: amount === String(q) ? 'var(--accent-green)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  {q.toLocaleString()}
                </button>
              ))}
            </div>
            <input className="input" type="number" placeholder="Or enter custom amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ marginBottom: '12px' }} />

            <div className="input-group">
              <label className="input-label">{tab === 'deposit' ? 'Your Phone (bKash/Nagad number)' : 'Payout Phone Number'}</label>
              <input className="input" type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            {tab === 'deposit' && (
              <div className="input-group">
                <label className="input-label">Transaction ID</label>
                <input className="input" placeholder="Enter TxID from your payment app" value={txnId} onChange={e => setTxnId(e.target.value)} />
              </div>
            )}

            {tab === 'deposit' && (
              <div style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', borderRadius: 'var(--radius)', padding: '12px', marginBottom: '16px', fontSize: '12px', color: 'var(--accent-gold)' }}>
                📋 Send money to: <strong>01XXXXXXXXXX</strong> ({method.name}) then enter the TxID above.
              </div>
            )}

            <button className="btn btn-primary btn-full btn-lg" disabled={loading} onClick={tab === 'deposit' ? submitDeposit : submitWithdraw}>
              {loading ? 'Submitting...' : tab === 'deposit' ? 'Submit Deposit' : 'Request Withdrawal'}
            </button>
          </>
        )}

        {tab === 'history' && (
          <div>
            {history.length === 0 && <div className="empty-state">No transactions yet</div>}
            {history.map(tx => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>{tx.type}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: '16px', fontWeight: 700, color: tx.type === 'deposit' || tx.type === 'win' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                  </div>
                  <span className={`badge badge-${tx.status === 'approved' ? 'green' : tx.status === 'rejected' ? 'red' : 'gold'}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
