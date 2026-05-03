'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shell } from '@/components/druip/shell'
import { Button, Toast } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

type AppStatus = 'loading' | 'none' | 'pending' | 'approved' | 'denied'

export default function ApplyToSellPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<AppStatus>('loading')
  const [reviewerNotes, setReviewerNotes] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }
      const { data } = await supabase
        .from('seller_applications')
        .select('status, reviewer_notes')
        .eq('user_id', user.id)
        .maybeSingle()
      setStatus((data?.status as AppStatus) || 'none')
      setReviewerNotes(data?.reviewer_notes || null)
    }
    check()
  }, [router])

  async function submit() {
    if (!file) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${user.id}/reports/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage.from('notes').upload(path, file)
    if (uploadError) {
      setToast({ tone: 'coral', msg: 'Upload failed. Try again.' })
      setSubmitting(false)
      return
    }

    const { error } = await supabase
      .from('seller_applications')
      .upsert({ user_id: user.id, report_url: path, status: 'pending' }, { onConflict: 'user_id' })

    setSubmitting(false)
    if (error) { setToast({ tone: 'coral', msg: 'Something went wrong. Try again.' }); return }
    setStatus('pending')
  }

  if (status === 'loading') {
    return (
      <Shell hideNav title="Apply to sell" onBack={() => router.back()}>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--charcoal-soft)', fontSize: 14 }}>Loading…</div>
      </Shell>
    )
  }

  if (status === 'pending') {
    return (
      <Shell hideNav title="Application submitted" onBack={() => router.push('/profile')}>
        <section style={{ padding: '32px 20px' }}>
          <div style={{ background: 'linear-gradient(140deg, var(--gold-soft) 0%, var(--cream-warm) 100%)', borderRadius: 28, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icon.bell size={32}/>
            </div>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 26, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 10px' }}>Under review</h2>
            <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', lineHeight: 1.6, margin: '0 0 24px' }}>
              We&apos;re reviewing your school report. You&apos;ll be notified once approved — usually within 24 hours.
            </p>
            <Button variant="ghost" size="md" onClick={() => router.push('/profile')}>Back to profile</Button>
          </div>
        </section>
      </Shell>
    )
  }

  if (status === 'approved') {
    router.push('/sell')
    return null
  }

  return (
    <>
      <Shell hideNav title="Apply to sell" onBack={() => router.back()}>
        <section style={{ padding: '8px 20px 24px' }}>
          <div style={{ background: 'linear-gradient(140deg, var(--cream-warm) 0%, var(--sage-soft) 100%)', borderRadius: 28, padding: '24px 22px', marginBottom: 24 }}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 26, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 10px', lineHeight: 1.1 }}>Only top students sell on Druip.</h1>
            <p style={{ fontSize: 13, color: 'var(--charcoal-soft)', lineHeight: 1.6, margin: 0 }}>
              We only approve students with strong academic records. This keeps the quality high and makes your notes worth more.
            </p>
          </div>

          {status === 'denied' && (
            <div style={{ background: 'var(--coral-soft)', borderRadius: 20, padding: '16px 18px', marginBottom: 20, border: '1px solid var(--coral)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--coral-deep)', marginBottom: 4 }}>Application not approved</div>
              {reviewerNotes && <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', lineHeight: 1.5 }}>{reviewerNotes}</div>}
              <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 6 }}>You can reapply below with an updated report.</div>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>What to upload</div>
            {['Your latest academic record or marksheet', 'Must show your student number and results', 'PDF or clear photo — we keep it private'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--hairline)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--sage-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon.shield size={10}/>
                </div>
                <span style={{ fontSize: 13, color: 'var(--charcoal-soft)', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }}/>

          {file ? (
            <div style={{ background: 'var(--sage-soft)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon.doc size={18}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                <div style={{ fontSize: 11, color: 'var(--charcoal-soft)', marginTop: 2 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</div>
              </div>
              <button onClick={() => setFile(null)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--charcoal)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Icon.close size={11}/>
              </button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--sage)', borderRadius: 20, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--sage-soft)', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--white)', color: 'var(--sage-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon.upload size={22}/>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 4 }}>Upload your school report</div>
              <div style={{ fontSize: 12, color: 'var(--charcoal-soft)' }}>PDF, JPG or PNG</div>
            </div>
          )}

          <Button variant="primary" size="lg" full disabled={!file || submitting} onClick={submit}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </Button>
        </section>
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
