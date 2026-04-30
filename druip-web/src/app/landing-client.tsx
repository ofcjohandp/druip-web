'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Chip, BlobBg } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

export default function LandingClient() {
  const router = useRouter()

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <>
      <style>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        [data-reveal].revealed { opacity: 1; transform: translateY(0); }
        [data-reveal][data-delay="1"] { transition-delay: 0.1s; }
        [data-reveal][data-delay="2"] { transition-delay: 0.2s; }
        [data-reveal][data-delay="3"] { transition-delay: 0.3s; }
        [data-reveal][data-delay="4"] { transition-delay: 0.4s; }
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .roadmap-step { flex-direction: column !important; gap: 16px !important; }
          .roadmap-step.flip { flex-direction: column !important; }
          .roadmap-node { display: none !important; }
          .roadmap-line { display: none !important; }
          .cta-inner { grid-template-columns: 1fr !important; text-align: center; }
          .section-pad { padding-left: 20px !important; padding-right: 20px !important; }
          .hero-h1 { font-size: 48px !important; }
          .section-h2 { font-size: 32px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--cream)', position: 'relative' }}>

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(250,247,242,.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '10px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <img src="/logo.png" alt="Druip" style={{ height: 60, width: 'auto', display: 'block' }} />
            <Button variant="ghost" size="sm" onClick={() => router.push('/sign-in')}>Sign in</Button>
          </div>
        </header>

        {/* Hero */}
        <section className="section-pad" style={{ padding: '80px 40px 72px', position: 'relative', overflow: 'hidden' }}>
          <BlobBg tone="gold" size={440} top={-100} right={-140} opacity={0.38}/>
          <BlobBg tone="sage" size={320} top={180} right={-100} opacity={0.22}/>

          <div className="hero-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '55% 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
            {/* Left */}
            <div>
              <div data-reveal>
                <Chip tone="gold" style={{ marginBottom: 24 }}>★ For SA varsity students</Chip>
              </div>
              <h1 data-reveal data-delay="1" className="hero-h1" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 72, lineHeight: 0.97, letterSpacing: '-.035em', color: 'var(--charcoal)', margin: '0 0 22px' }}>
                Study to<br/><span style={{ color: 'var(--sage)' }}>make money.</span>
              </h1>
              <p data-reveal data-delay="2" style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--charcoal-soft)', margin: '0 0 32px', maxWidth: 420 }}>
                Buy and sell notes, past papers and cheat sheets - student to student. Your varsity grind, finally paying you back.
              </p>
              <div data-reveal data-delay="3" style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                <Button variant="primary" size="lg" onClick={() => router.push('/sign-up')}>Get started - free</Button>
                <Button variant="ghost" size="lg" onClick={() => router.push('/sign-in')}>I have an account</Button>
              </div>
              <div data-reveal data-delay="4" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg-muted)' }}>
                <div style={{ display: 'flex' }}>
                  {(['L','K','N','S'] as const).map((l, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: ['var(--sage-soft)','var(--gold-soft)','var(--turquoise-soft)','var(--coral-soft)'][i], color: ['var(--sage-deep)','var(--gold-deep)','var(--turquoise-deep)','#B05B3F'][i], fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i ? -10 : 0, border: '2px solid var(--cream)' }}>{l}</div>
                  ))}
                </div>
                <span><b style={{ color: 'var(--charcoal)' }}>340+</b> NWU Potch students already earning</span>
              </div>
            </div>

            {/* Right: stat cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Paid out this week', value: 'R 12,840', tone: 'gold', icon: <Icon.card size={20}/> },
                { label: 'Student sellers', value: '340+', tone: 'sage', icon: <Icon.upload size={20}/> },
                { label: 'Notes sold this month', value: '1,200+', tone: 'turquoise', icon: <Icon.zap size={20}/> },
                { label: 'Average payout time', value: 'Same day', tone: 'gold', icon: <Icon.card size={20}/> },
              ].map((stat, i) => (
                <div key={i} data-reveal data-delay={String(i + 1)} style={{ background: 'var(--white)', borderRadius: 24, padding: 22, border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-lift)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: `var(--${stat.tone}-soft)`, color: `var(--${stat.tone}-deep)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>{stat.icon}</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 28, color: 'var(--charcoal)', lineHeight: 1, letterSpacing: '-.02em' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--charcoal-soft)', marginTop: 5, lineHeight: 1.4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials - alternating */}
        <section className="section-pad" style={{ padding: '80px 40px', background: 'var(--cream-warm)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div data-reveal style={{ marginBottom: 52 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sage-deep)', marginBottom: 10 }}>Why students love it</div>
              <h2 className="section-h2" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 44, lineHeight: 1.05, letterSpacing: '-.03em', margin: 0, color: 'var(--charcoal)' }}>The varsity hustle, simplified.</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { name: 'Lerato, 3rd-year Physio', tone: 'sage', q: 'I made R 1,420 last month from FISI notes I already had. Honestly mad.' },
                { name: 'Karabo, 2nd-year Med', tone: 'gold', q: 'Anatomy past papers all in one place. Saved me a full weekend before exams.' },
                { name: 'Nadia, 4th-year Health Sci', tone: 'turquoise', q: "I sell flashcards while I study. The streak keeps me consistent - wild combo." },
              ].map((t, i) => (
                <div key={i} data-reveal style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                  <div style={{
                    background: 'var(--white)',
                    borderRadius: 28,
                    padding: '36px 40px',
                    border: '1px solid var(--hairline)',
                    boxShadow: 'var(--shadow-lift)',
                    maxWidth: 600,
                    width: '100%',
                    borderLeft: i % 2 === 0 ? `4px solid var(--${t.tone})` : undefined,
                    borderRight: i % 2 !== 0 ? `4px solid var(--${t.tone})` : undefined,
                  }}>
                    <div style={{ fontSize: 52, fontFamily: 'Fraunces, serif', color: `var(--${t.tone})`, lineHeight: 0.6, marginBottom: 16, opacity: 0.5 }}>"</div>
                    <p style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--charcoal)', margin: '0 0 22px', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>{t.q}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `var(--${t.tone}-soft)`, color: `var(--${t.tone}-deep)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 16 }}>{t.name.charAt(0)}</div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal-soft)' }}>{t.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="section-pad" style={{ padding: '80px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div data-reveal style={{ marginBottom: 60 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold-deep)', marginBottom: 10 }}>How it works</div>
              <h2 className="section-h2" style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 44, lineHeight: 1.05, letterSpacing: '-.03em', margin: 0, color: 'var(--charcoal)' }}>Three steps. That&apos;s it.</h2>
            </div>

            <div style={{ position: 'relative' }}>
              {/* Center line */}
              <div className="roadmap-line" style={{ position: 'absolute', left: '50%', top: 28, bottom: 28, width: 2, background: 'linear-gradient(to bottom, var(--sage-soft), var(--gold-soft), var(--turquoise-soft))', transform: 'translateX(-50%)', zIndex: 0 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
                {[
                  { n: '01', tone: 'sage', icon: <Icon.upload size={28}/>, t: 'Upload your notes', s: 'Snap your hand-written pages or upload your PDFs. Set a price in rands. Takes 2 minutes.' },
                  { n: '02', tone: 'gold', icon: <Icon.zap size={28}/>, t: 'Other students buy', s: 'Your notes show up in their faculty feed. They pay, you get paid. No chasing anyone.' },
                  { n: '03', tone: 'turquoise', icon: <Icon.card size={28}/>, t: 'Cash out to your bank', s: 'Withdraw to Capitec, FNB, ABSA, anything - typically same day.' },
                ].map((step, i) => (
                  <div key={i} data-reveal className={`roadmap-step${i % 2 !== 0 ? ' flip' : ''}`} style={{ display: 'flex', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', alignItems: 'center', gap: 48, position: 'relative', zIndex: 1 }}>
                    {/* Card side */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                      <div style={{ background: 'var(--white)', borderRadius: 28, padding: '30px 34px', border: '1px solid var(--hairline)', boxShadow: 'var(--shadow-lift)', maxWidth: 420, width: '100%' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 18, background: `var(--${step.tone}-soft)`, color: `var(--${step.tone}-deep)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{step.icon}</div>
                        <div style={{ fontSize: 21, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 10, letterSpacing: '-.01em' }}>{step.t}</div>
                        <div style={{ fontSize: 15, color: 'var(--charcoal-soft)', lineHeight: 1.65 }}>{step.s}</div>
                      </div>
                    </div>

                    {/* Center node */}
                    <div className="roadmap-node" style={{ width: 60, height: 60, borderRadius: '50%', background: `var(--${step.tone})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18, flexShrink: 0, boxShadow: `0 0 0 8px var(--${step.tone}-soft)` }}>
                      {step.n}
                    </div>

                    {/* Empty side */}
                    <div style={{ flex: 1 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-pad" style={{ padding: '0 40px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div data-reveal className="cta-inner" style={{ background: 'var(--sage)', color: '#fff', borderRadius: 40, padding: '56px 60px', position: 'relative', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 40 }}>
              <BlobBg tone="gold" size={320} top={-80} right={-80} opacity={0.22}/>
              <div style={{ position: 'relative' }}>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 38, lineHeight: 1.05, letterSpacing: '-.025em', margin: '0 0 12px' }}>Ready to start the side hustle?</h3>
                <p style={{ fontSize: 16, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>Free to sign up. No subscription. We take a small cut only when you sell.</p>
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Button variant="gold" size="lg" onClick={() => router.push('/sign-up')}>Sign up - it&apos;s free</Button>
              </div>
            </div>
          </div>
        </section>

        <footer style={{ padding: '24px 40px 48px', textAlign: 'center', fontSize: 12, color: 'var(--fg-muted)' }}>
          <div style={{ marginBottom: 8 }}>Made with ♡ for SA varsity students</div>
          <div>© Druip · NWU Potch · 2026</div>
        </footer>
      </div>
    </>
  )
}
