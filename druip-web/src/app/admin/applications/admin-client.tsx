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

export default function AdminApplicationsClient({ applications }: { applications: Application[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [denyingId, setDenyingId] = useState<string | null>(null)
  const [denyNotes, setDenyNotes] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

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

  const pending = applications.filter(a => a.status === 'pending')
  const reviewed = applications.filter(a => a.status !== 'pending')

  const statusColor: Record<string, string> = {
    pending: 'var(--gold)',
    approved: 'var(--sage)',
    denied: 'var(--coral)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', padding: '32px 20px', fontFamily: 'Nunito, sans-serif' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 28, color: 'var(--charcoal)', margin: '0 0 6px' }}>Seller Applications</h1>
      <p style={{ fontSize: 13, color: 'var(--charcoal-soft)', margin: '0 0 32px' }}>{pending.length} pending</p>

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
    </div>
  )
}
