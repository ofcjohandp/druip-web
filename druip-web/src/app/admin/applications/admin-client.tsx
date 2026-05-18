'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  user_id: string
  name: string
  report_url: string
  reportSignedUrl: string | null
  status: string
  reviewer_notes: string | null
  created_at: string
}

interface Payout {
  id: string
  seller_id: string
  seller_name: string
  amount: number
  bank_name: string
  account_number: string
  account_holder: string
  status: string
  paid_at: string | null
  created_at: string
}

interface Props {
  applications: Application[]
  payouts: Payout[]
}

export default function AdminApplicationsClient({ applications, payouts }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState<'applications' | 'payouts'>('applications')
  const [denyingId, setDenyingId] = useState<string | null>(null)
  const [denyNotes, setDenyNotes] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [payoutLoading, setPayoutLoading] = useState<string | null>(null)

  async function action(id: string, act: 'approved' | 'denied', notes?: string) {
    setLoading(id)
    await fetch(`/api/admin/applications/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act, notes }),
    })
    setLoading(null)
    setDenyingId(null)
    setDenyNotes('')
    startTransition(() => router.refresh())
  }

  async function payoutAction(id: string, act: 'paid' | 'rejected') {
    setPayoutLoading(id)
    await fetch(`/api/admin/payouts/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act }),
    })
    setPayoutLoading(null)
    startTransition(() => router.refresh())
  }

  const pending = applications.filter(a => a.status === 'pending')
  const reviewed = applications.filter(a => a.status !== 'pending')
  const pendingPayouts = payouts.filter(p => p.status === 'pending')
  const otherPayouts = payouts.filter(p => p.status !== 'pending')

  const statusColor: Record<string, string> = {
    pending: 'var(--gold)',
    approved: 'var(--sage)',
    denied: 'var(--coral)',
    paid: 'var(--sage)',
    rejected: 'var(--coral)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '32px 20px', fontFamily: 'Nunito, sans-serif' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 28, color: 'var(--charcoal)', margin: '0 0 6px' }}>Admin</h1>
      <p style={{ fontSize: 13, color: 'var(--charcoal-soft)', margin: '0 0 24px' }}>
        {pending.length} pending application{pending.length === 1 ? '' : 's'} · {pendingPayouts.length} pending payout{pendingPayouts.length === 1 ? '' : 's'}
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--hairline)' }}>
        {([{ k: 'applications', l: 'Applications' }, { k: 'payouts', l: 'Payouts' }] as const).map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{ background: 'none', border: 'none', padding: '12px 16px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, color: tab === t.k ? 'var(--charcoal)' : 'var(--fg-muted)', borderBottom: `2px solid ${tab === t.k ? 'var(--sage)' : 'transparent'}`, marginBottom: -1, cursor: 'pointer' }}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'applications' && (
        <>
          {pending.length === 0 && (
            <div style={{ background: 'var(--white)', borderRadius: 20, padding: '32px 20px', textAlign: 'center', color: 'var(--charcoal-soft)', fontSize: 14 }}>
              No pending applications
            </div>
          )}

          {pending.length > 0 && (
            <>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--charcoal-soft)', margin: '0 0 12px' }}>Pending review</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {pending.map(app => (
                  <div key={app.id} style={{ background: 'var(--white)', borderRadius: 20, padding: 20, border: '1px solid var(--hairline)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)' }}>{app.name || 'Unknown user'}</div>
                        <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 3 }}>{new Date(app.created_at).toLocaleDateString('en-ZA')}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: statusColor[app.status] + '33', color: statusColor[app.status] }}>{app.status}</span>
                    </div>

                    {app.reportSignedUrl && (
                      <a href={app.reportSignedUrl} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--sage-deep)', textDecoration: 'none', padding: '8px 14px', background: 'var(--sage-soft)', borderRadius: 10, marginBottom: 14 }}>
                        View report
                      </a>
                    )}

                    {denyingId === app.id ? (
                      <div>
                        <textarea
                          placeholder="Reason for denial (optional)"
                          value={denyNotes}
                          onChange={e => setDenyNotes(e.target.value)}
                          rows={3}
                          style={{ width: '100%', padding: '12px 14px', background: 'var(--cream-warm)', border: '1.5px solid var(--hairline)', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--charcoal)', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => action(app.id, 'denied', denyNotes)} disabled={loading === app.id}
                            style={{ flex: 1, padding: '12px', background: 'var(--coral)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                            {loading === app.id ? 'Saving…' : 'Confirm deny'}
                          </button>
                          <button onClick={() => { setDenyingId(null); setDenyNotes('') }}
                            style={{ padding: '12px 16px', background: 'var(--cream-warm)', color: 'var(--charcoal)', border: 'none', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => action(app.id, 'approved')} disabled={loading === app.id}
                          style={{ flex: 1, padding: '12px', background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                          {loading === app.id ? 'Saving…' : 'Approve'}
                        </button>
                        <button onClick={() => setDenyingId(app.id)}
                          style={{ flex: 1, padding: '12px', background: 'var(--cream-warm)', color: 'var(--coral-deep)', border: '1.5px solid var(--coral)', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {reviewed.length > 0 && (
            <>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--charcoal-soft)', margin: '0 0 12px' }}>Reviewed</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reviewed.map(app => (
                  <div key={app.id} style={{ background: 'var(--white)', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>{app.name}</div>
                      {app.reviewer_notes && <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 2 }}>{app.reviewer_notes}</div>}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: statusColor[app.status] + '33', color: statusColor[app.status] }}>{app.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'payouts' && (
        <>
          {payouts.length === 0 && (
            <div style={{ background: 'var(--white)', borderRadius: 20, padding: '32px 20px', textAlign: 'center', color: 'var(--charcoal-soft)', fontSize: 14 }}>
              No payout requests yet.
            </div>
          )}

          {pendingPayouts.length > 0 && (
            <>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--charcoal-soft)', margin: '0 0 12px' }}>Pending payouts</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {pendingPayouts.map(p => (
                  <div key={p.id} style={{ background: 'var(--white)', borderRadius: 20, padding: 20, border: '1px solid var(--hairline)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)' }}>{p.seller_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 3 }}>{new Date(p.created_at).toLocaleDateString('en-ZA')}</div>
                      </div>
                      <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 22, color: 'var(--charcoal)' }}>R {Number(p.amount).toFixed(2)}</div>
                    </div>

                    <div style={{ background: 'var(--cream-warm)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 6, fontSize: 13, color: 'var(--charcoal)' }}>
                        <div style={{ color: 'var(--charcoal-soft)' }}>Bank</div><div style={{ fontWeight: 700 }}>{p.bank_name}</div>
                        <div style={{ color: 'var(--charcoal-soft)' }}>Account number</div><div style={{ fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{p.account_number}</div>
                        <div style={{ color: 'var(--charcoal-soft)' }}>Account holder</div><div style={{ fontWeight: 700 }}>{p.account_holder}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => payoutAction(p.id, 'paid')} disabled={payoutLoading === p.id}
                        style={{ flex: 1, padding: '12px', background: 'var(--sage)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        {payoutLoading === p.id ? 'Saving…' : 'Mark paid'}
                      </button>
                      <button onClick={() => payoutAction(p.id, 'rejected')} disabled={payoutLoading === p.id}
                        style={{ flex: 1, padding: '12px', background: 'var(--cream-warm)', color: 'var(--coral-deep)', border: '1.5px solid var(--coral)', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {otherPayouts.length > 0 && (
            <>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--charcoal-soft)', margin: '0 0 12px' }}>Processed</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherPayouts.map(p => (
                  <div key={p.id} style={{ background: 'var(--white)', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>{p.seller_name} · R {Number(p.amount).toFixed(2)}</div>
                      <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 2 }}>
                        {p.bank_name} · ****{p.account_number.slice(-4)}
                        {p.paid_at ? ` · paid ${new Date(p.paid_at).toLocaleDateString('en-ZA')}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: statusColor[p.status] + '33', color: statusColor[p.status], flexShrink: 0 }}>{p.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
