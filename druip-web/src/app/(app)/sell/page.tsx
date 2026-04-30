'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shell } from '@/components/druip/shell'
import { Button, Chip, Toast } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

export default function SellPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('Notes')
  const [faculty, setFaculty] = useState('')
  const [price, setPrice] = useState<number | string>(45)
  const [desc, setDesc] = useState('')
  const [lang, setLang] = useState('English')
  const [format, setFormat] = useState('PDF')
  const [publishing, setPublishing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(f => [...f, ...selected])
    e.target.value = ''
  }

  const removeFile = (i: number) => setFiles(f => f.filter((_, j) => j !== i))

  const publish = async () => {
    setPublishing(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }

    const uploadedPaths: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadProgress(`Uploading ${i + 1} of ${files.length}…`)
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${user.id}/${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('notes').upload(path, file)
      if (!uploadError) uploadedPaths.push(path)
    }

    setUploadProgress('')
    const { error } = await supabase.from('listings').insert({
      seller_id: user.id,
      title,
      code,
      type,
      faculty,
      tone: FACULTY_TONES[faculty] || 'sage',
      description: desc,
      price,
      pages: files.length,
      file_urls: uploadedPaths,
      language: lang,
      format,
      status: 'published',
    })

    setPublishing(false)
    if (error) {
      setToast({ tone: 'coral', msg: 'Something went wrong. Try again.' })
      return
    }
    setToast({ tone: 'gold', msg: 'Listing published! 🎉' })
    setTimeout(() => router.push('/profile'), 800)
  }

  const saveDraft = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }
    await supabase.from('listings').insert({
      seller_id: user.id,
      title,
      code,
      type,
      faculty,
      description: desc,
      price,
      pages: files.length,
      status: 'draft',
    })
    setToast({ tone: 'sage', msg: 'Saved as draft' })
  }

  const FACULTY_TONES: Record<string, string> = {
    'Health Sci': 'sage', 'Engineering': 'turquoise', 'Law': 'coral',
    'Commerce': 'gold', 'Education': 'gold', 'Natural Sciences': 'turquoise',
    'Arts': 'coral', 'Theology': 'sage',
  }

  const inputStyle = { width: '100%', padding: '14px 16px', background: 'var(--cream-warm)', border: '1.5px solid transparent', borderRadius: 16, fontFamily: 'Nunito, sans-serif', fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, color: 'var(--charcoal)' }

  return (
    <>
      <Shell hideNav onBack={() => step === 1 ? router.push('/home') : setStep(s => s - 1)} title="Sell your notes">
        {/* Progress */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'var(--sage)' : 'var(--cream-deep)', transition: 'background 280ms' }}/>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 8, fontWeight: 600 }}>
            Step {step} of 3 · {['Upload pages', 'Details', 'Set price'][step - 1]}
          </div>
        </div>

        {step === 1 && (
          <>
            <section style={{ padding: '0 20px 20px' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 8px', color: 'var(--charcoal)' }}>Add your pages</h2>
              <p style={{ fontSize: 13, color: 'var(--charcoal-soft)', margin: '0 0 20px', lineHeight: 1.5 }}>Snap photos or upload PDFs. Better-quality scans sell faster.</p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {files.length === 0 ? (
                <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed var(--sage)', borderRadius: 24, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--sage-soft)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--white)', color: 'var(--sage-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Icon.upload size={26}/></div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 4 }}>Tap to add files</div>
                  <div style={{ fontSize: 12, color: 'var(--charcoal-soft)' }}>JPG, PNG or PDF · up to 50 MB</div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ aspectRatio: '3/4', background: 'var(--cream-warm)', borderRadius: 14, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 6px', gap: 4 }}>
                        <Icon.doc size={24}/>
                        <div style={{ fontSize: 9, color: 'var(--charcoal-soft)', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.2 }}>
                          {f.name.length > 18 ? f.name.slice(0, 15) + '…' : f.name}
                        </div>
                        <button onClick={() => removeFile(i)} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'var(--charcoal)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Icon.close size={10}/>
                        </button>
                      </div>
                    ))}
                    <button onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '3/4', background: 'transparent', border: '1.5px dashed var(--sage)', borderRadius: 14, color: 'var(--sage-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Icon.upload size={22}/>
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center' }}>{files.length} file{files.length !== 1 ? 's' : ''} selected</div>
                </div>
              )}
            </section>
            <section style={{ padding: '0 20px 32px' }}>
              <Button variant="primary" size="lg" full disabled={files.length < 1} onClick={() => setStep(2)}>Continue</Button>
            </section>
          </>
        )}

        {step === 2 && (
          <>
            <section style={{ padding: '0 20px 24px' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 20px', color: 'var(--charcoal)' }}>Tell us about it</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Human physiology - full term" style={inputStyle}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>Course code</label>
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="FISI 111" style={inputStyle}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>Faculty / subject</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Health Sci', 'Engineering', 'Law', 'Commerce', 'Education', 'Natural Sciences', 'Arts', 'Theology'].map(f => (
                    <Chip key={f} active={faculty === f} tone={faculty === f ? 'neutral' : 'white'} onClick={() => setFaculty(f)}>{f}</Chip>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>Type</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Notes', 'Past papers', 'Cheat sheet', 'Flashcards'].map(t => (
                    <Chip key={t} active={type === t} tone={type === t ? 'neutral' : 'white'} onClick={() => setType(t)}>{t}</Chip>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>Description</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's covered? What makes these notes good?" rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>Language of notes</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['English', 'Afrikaans', 'isiZulu', 'Sesotho', 'Other'].map(l => (
                    <Chip key={l} active={lang === l} tone={lang === l ? 'neutral' : 'white'} onClick={() => setLang(l)}>{l}</Chip>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>Format</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['PDF', 'Screenshots', 'Mixed'].map(f => (
                    <Chip key={f} active={format === f} tone={format === f ? 'neutral' : 'white'} onClick={() => setFormat(f)}>{f}</Chip>
                  ))}
                </div>
              </div>
            </section>
            <section style={{ padding: '0 20px 32px' }}>
              <Button variant="primary" size="lg" full disabled={!title || !code || !faculty} onClick={() => setStep(3)}>Continue</Button>
            </section>
          </>
        )}

        {step === 3 && (
          <>
            <section style={{ padding: '0 20px 24px' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, letterSpacing: '-.02em', margin: '0 0 8px', color: 'var(--charcoal)' }}>Set your price</h2>
              <p style={{ fontSize: 13, color: 'var(--charcoal-soft)', margin: '0 0 24px', lineHeight: 1.5 }}>Set whatever price you think is fair for your notes.</p>

              <div style={{ background: 'linear-gradient(140deg, var(--gold-soft) 0%, var(--cream-warm) 100%)', borderRadius: 28, padding: 28, textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 8 }}>Your price</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 40, color: 'var(--charcoal)' }}>R</span>
                  <input type="number" min={1} value={price} onChange={e => setPrice(e.target.value === '' ? '' : +e.target.value)} placeholder="0"
                    style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 56, lineHeight: 1, color: 'var(--charcoal)', background: 'none', border: 'none', outline: 'none', width: 160, textAlign: 'center' }}/>
                </div>
                <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 4 }}>Enter any price you think is fair</div>
              </div>

              <div style={{ background: 'var(--white)', borderRadius: 20, padding: 16, border: '1px solid var(--hairline)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--charcoal-soft)', marginBottom: 8 }}>
                  <span>You receive (per sale)</span>
                  <span style={{ fontWeight: 700, color: 'var(--charcoal)' }}>R {Math.round(Number(price) * 0.85)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--charcoal-soft)' }}>
                  <span>Druip fee (15%)</span><span>R {Math.round(Number(price) * 0.15)}</span>
                </div>
              </div>

              {uploadProgress && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--sage-soft)', borderRadius: 14, fontSize: 13, fontWeight: 600, color: 'var(--sage-deep)', textAlign: 'center' }}>
                  {uploadProgress}
                </div>
              )}
            </section>
            <section style={{ padding: '0 20px 32px' }}>
              <Button variant="primary" size="lg" full onClick={publish} disabled={publishing}>
                {publishing ? (uploadProgress || 'Publishing…') : 'Publish listing 🎉'}
              </Button>
              <Button variant="ghost" size="md" full onClick={saveDraft} style={{ marginTop: 8 }}>Save as draft</Button>
            </section>
          </>
        )}
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
