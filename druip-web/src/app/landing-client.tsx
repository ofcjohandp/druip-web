'use client'

import { useRouter } from 'next/navigation'
import { Button, Chip, BlobBg } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

export default function LandingClient() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(250,247,242,.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, color: 'var(--sage)', letterSpacing: '-.02em' }}>druip</span>
        <Button variant="ghost" size="sm" onClick={() => router.push('/sign-in')}>Sign in</Button>
      </header>

      {/* Hero */}
      <section style={{ padding: '24px 20px 32px', position: 'relative' }}>
        <BlobBg tone="gold" size={260} top={-40} right={-100} opacity={0.5}/>
        <BlobBg tone="sage" size={200} top={140} right={-60} opacity={0.35}/>

        <div style={{ position: 'relative' }}>
          <Chip tone="gold" style={{ marginBottom: 18 }}>★ For SA varsity students</Chip>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 52, lineHeight: 1.02, letterSpacing: '-.03em', color: 'var(--charcoal)', margin: '0 0 14px' }}>
            Study to <span style={{ color: 'var(--sage)' }}>make money.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--charcoal-soft)', margin: '0 0 24px', maxWidth: 320 }}>
            Buy and sell notes, past papers and cheat sheets - student to student. Your varsity grind, finally paying you back.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={() => router.push('/sign-up')}>Get started - free</Button>
            <Button variant="ghost" size="lg" onClick={() => router.push('/sign-in')}>I have an account</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-muted)' }}>
            <div style={{ display: 'flex' }}>
              {(['L','K','N','S'] as const).map((l, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: ['var(--sage-soft)','var(--gold-soft)','var(--turquoise-soft)','var(--coral-soft)'][i], color: ['var(--sage-deep)','var(--gold-deep)','var(--turquoise-deep)','#B05B3F'][i], fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i ? -8 : 0, border: '2px solid var(--cream)' }}>{l}</div>
              ))}
            </div>
            <span><b style={{ color: 'var(--charcoal)' }}>340+</b> NWU Potch students earning</span>
          </div>
        </div>

        {/* Hero card */}
        <div style={{ marginTop: 36, position: 'relative', background: 'linear-gradient(140deg, var(--cream-warm) 0%, var(--gold-soft) 100%)', borderRadius: 28, padding: 22, border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-lift)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold-deep)' }}>This week on Druip</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 38, lineHeight: 1, letterSpacing: '-.02em', color: 'var(--charcoal)', marginTop: 8 }}>R 12,840</div>
          <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', marginTop: 4 }}>paid out to student sellers</div>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding: '32px 20px', background: 'var(--cream-warm)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sage-deep)', marginBottom: 8 }}>Why students love it</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 28, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 20px', color: 'var(--charcoal)' }}>The varsity hustle, simplified.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { name: 'Lerato, 3rd-year Physio', tone: 'sage', q: 'I made R 1,420 last month from FISI notes I already had. Honestly mad.' },
            { name: 'Karabo, 2nd-year Med', tone: 'gold', q: 'Anatomy past papers all in one place. Saved me a full weekend before exams.' },
            { name: 'Nadia, 4th-year Health Sci', tone: 'turquoise', q: "I sell flashcards while I study. The streak keeps me consistent - wild combo." },
          ].map((t, i) => (
            <div key={i} style={{ background: 'var(--white)', borderRadius: 24, padding: 18, border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: 22, fontFamily: 'Fraunces, serif', color: 'var(--gold)', lineHeight: 0.5, marginBottom: 4 }}>"</div>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--charcoal)', margin: '0 0 10px' }}>{t.q}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `var(--${t.tone}-soft)`, color: `var(--${t.tone}-deep)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 13 }}>{t.name.charAt(0)}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--charcoal-soft)' }}>{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '40px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 8 }}>How it works</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 28, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 20px', color: 'var(--charcoal)' }}>Three steps. That&apos;s it.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { n: '01', tone: 'sage', icon: <Icon.upload size={22}/>, t: 'Upload your notes', s: 'Snap your hand-written pages or upload your PDFs. Set a price in rands.' },
            { n: '02', tone: 'gold', icon: <Icon.zap size={22}/>, t: 'Other students buy', s: 'Your notes show up in their faculty feed. They pay, you get paid.' },
            { n: '03', tone: 'turquoise', icon: <Icon.card size={22}/>, t: 'Cash out to your bank', s: 'Withdraw to Capitec, FNB, ABSA, anything - typically same day.' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: `var(--${s.tone}-soft)`, color: `var(--${s.tone}-deep)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--fg-muted)' }}>{s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--charcoal)', marginTop: 2 }}>{s.t}</div>
                <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', marginTop: 4, lineHeight: 1.5 }}>{s.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '20px 20px 40px' }}>
        <div style={{ background: 'var(--sage)', color: '#fff', borderRadius: 32, padding: 28, position: 'relative', overflow: 'hidden' }}>
          <BlobBg tone="gold" size={180} top={-50} right={-50} opacity={0.3}/>
          <div style={{ position: 'relative' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 26, lineHeight: 1.1, letterSpacing: '-.02em', margin: '0 0 8px' }}>Ready to start the side hustle?</h3>
            <p style={{ fontSize: 14, opacity: 0.9, margin: '0 0 18px', lineHeight: 1.5 }}>Free to sign up. No subscription. We take a small cut only when you sell.</p>
            <Button variant="gold" size="lg" onClick={() => router.push('/sign-up')}>Sign up - it&apos;s free</Button>
          </div>
        </div>
      </section>

      <footer style={{ padding: '24px 20px 40px', textAlign: 'center', fontSize: 12, color: 'var(--fg-muted)' }}>
        <div style={{ marginBottom: 8 }}>Made with ♡ for SA varsity students</div>
        <div>© Druip · NWU Potch · 2026</div>
      </footer>
    </div>
  )
}
