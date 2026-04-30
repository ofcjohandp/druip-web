'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shell } from '@/components/druip/shell'
import { Button, Toast, IconButton } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Believe you can and you're halfway there.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "The harder you work, the greater you'll feel when you achieve it.",
  "Dream it. Believe it. Build it.",
  "Success is not the key to happiness. Happiness is the key to success.",
  "The future depends on what you do today.",
  "Small steps every day lead to big results.",
  "You don't have to be great to start, but you have to start to be great.",
  "Your only limit is your mind.",
  "Push yourself - no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard is not impossible.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up. Work hard. Repeat.",
  "Be so good they can't ignore you.",
  "Study hard in silence. Let success make the noise.",
  "Every expert was once a beginner.",
  "Education is the passport to the future.",
  "The more you learn, the more you earn.",
  "Knowledge is power. Use it wisely.",
  "Success is the sum of small efforts repeated every day.",
  "You are capable of amazing things.",
  "Consistency is the key to achieving and maintaining momentum.",
  "One day at a time. One page at a time.",
  "You didn't come this far to only come this far.",
  "Your future self is watching you through your memories. Make it proud.",
  "Work hard in silence. Let your results speak.",
  "Stay focused and never give up.",
  "Good things come to those who work hard.",
  "Start where you are. Use what you have. Do what you can.",
  "Success doesn't come from what you do occasionally, but what you do consistently.",
  "The pain of studying now is lighter than the weight of regret later.",
  "Discipline is choosing between what you want now and what you want most.",
  "Don't limit your challenges. Challenge your limits.",
  "Be the hardest working person you know.",
  "Mistakes are proof that you're trying.",
  "You are stronger than you think.",
  "Make each day your masterpiece.",
  "Learning is not attained by chance; it must be sought with passion.",
  "The beautiful thing about learning is that nobody can take it away from you.",
  "Education is not the filling of a pail, but the lighting of a fire.",
  "Strive for progress, not perfection.",
  "Your attitude determines your direction.",
  "Today's hard work is tomorrow's foundation.",
  "Every achievement begins with the decision to try.",
  "A year from now you'll wish you had started today.",
  "Don't wait for the perfect moment. Take the moment and make it perfect.",
  "Commit to being the best version of yourself.",
  "Rome wasn't built in a day, but they were laying bricks every hour.",
  "Show up. Work. Learn. Repeat.",
  "The grind is real, but so is the reward.",
  "What you put in is what you get out.",
  "Hustle in silence and let your success be your noise.",
  "You've survived 100% of your hard days so far. Keep going.",
  "It's not about being the best. It's about being better than yesterday.",
  "Study like your future depends on it - because it does.",
  "Your degree is worth the early mornings.",
  "Kganya ke thuto - knowledge is light.",
  "One more page. One more step. One more day.",
  "The grind never stops for those who want it enough.",
  "Turn your can'ts into cans and your dreams into plans.",
  "Hard work beats talent when talent doesn't work hard.",
  "You are one study session away from a breakthrough.",
  "Be patient. Be persistent. Be present.",
  "Today's preparation is tomorrow's achievement.",
  "The difference between ordinary and extraordinary is that little extra.",
  "You have what it takes. Now go prove it.",
  "Bokamoso bo tletse - the future is full. Fill yours wisely.",
  "Focus on where you want to go, not where you currently are.",
  "Your mind is a superpower. Train it daily.",
  "There are no shortcuts to any place worth going.",
  "Dig deep. Work hard. Shine bright.",
  "You are building something great. Don't stop now.",
  "The world belongs to those who read.",
  "Success is getting up one more time than you fall.",
  "You are exactly where you need to be to get where you want to go.",
  "Thuto ke lerumo - education is a spear. Sharpen yours.",
  "Tough times make great outcomes.",
  "Every page you study is an investment in your future.",
  "Your dedication today shapes your destination tomorrow.",
  "Make your family's investment in you count.",
  "Ulutho ngolwazi - you are enriched by knowledge.",
  "Keep going. The best is yet to come.",
  "You owe it to yourself to become everything you are capable of being.",
  "Impumelelo iqala nokuqala - success begins with beginning.",
]

interface Props { firstName: string; streak: number }

export default function HomeClient({ firstName, streak }: Props) {
  const router = useRouter()
  const [toast, setToast] = useState<{ tone: 'sage' | 'gold' | 'coral'; msg: string } | null>(null)

  const todayQuote = QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]

  return (
    <>
      <Shell
        headerVariant="logo"
        sticky
        rightAction={
          <div style={{ display: 'flex', gap: 8 }}>
            <IconButton ariaLabel="search" onClick={() => router.push('/search')}><Icon.search size={18}/></IconButton>
            <IconButton ariaLabel="alerts" onClick={() => setToast({ tone: 'sage', msg: 'Notifications coming soon.' })}><Icon.bell size={18}/></IconButton>
          </div>
        }
      >
        {/* Greeting */}
        <section style={{ padding: '4px 20px 16px' }}>
          <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', fontWeight: 600 }}>Sawubona, {firstName} 👋</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 30, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '6px 0 0' }}>Let&apos;s make this year count.</h1>
        </section>

        {/* Daily quote card */}
        <section style={{ padding: '0 20px 24px' }}>
          <div style={{ background: 'linear-gradient(140deg, var(--cream-warm) 0%, var(--gold-soft) 100%)', borderRadius: 24, padding: '22px 22px 18px', border: '1px solid var(--hairline)' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 16, lineHeight: 1.55, color: 'var(--charcoal)', marginBottom: streak > 0 ? 14 : 0 }}>
              &ldquo;{todayQuote}&rdquo;
            </div>
            {streak > 0 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'var(--gold)', borderRadius: 999, color: 'var(--charcoal)' }}>
                <Icon.flame size={13} fill="currentColor"/>
                <span style={{ fontWeight: 700, fontSize: 12 }}>{streak}-day login streak</span>
              </div>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section style={{ padding: '0 20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { icon: <Icon.search size={18}/>, label: 'Discover', tone: 'gold', href: '/browse' },
              { icon: <Icon.bookmark size={18}/>, label: 'Wishlist', tone: 'turquoise', href: '/library?tab=saved' },
              { icon: <Icon.doc size={18}/>, label: 'My Notes', tone: 'sage', href: '/library' },
              { icon: <Icon.zap size={18}/>, label: 'Earn', tone: 'coral', href: '/earnings' },
            ].map((q, i) => (
              <button key={i} onClick={() => router.push(q.href)}
                style={{ background: `var(--${q.tone}-soft)`, color: `var(--${q.tone}-deep)`, border: 'none', borderRadius: 18, padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, transition: 'transform 200ms' }}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {q.icon}{q.label}
              </button>
            ))}
          </div>
        </section>

        {/* Your library */}
        <section style={{ padding: '0 20px 32px' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 22, letterSpacing: '-.02em', margin: '0 0 14px', color: 'var(--charcoal)' }}>Your library</h2>
          <div style={{ background: 'var(--cream-warm)', borderRadius: 24, padding: '28px 20px', textAlign: 'center', border: '1px solid var(--hairline)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>Build your collection.</div>
            <div style={{ fontSize: 13, color: 'var(--charcoal-soft)', marginBottom: 20 }}>Shop for notes or create and store your own.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button variant="primary" size="sm" onClick={() => router.push('/browse')}>Shop</Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/library?create=true')}>+ Create</Button>
            </div>
          </div>
        </section>
      </Shell>

      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}
    </>
  )
}
