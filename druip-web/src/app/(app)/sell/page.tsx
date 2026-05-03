import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SellClient from './sell-client'
import { Shell } from '@/components/druip/shell'
import { Button } from '@/components/druip/ui'

export default async function SellPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  // Existing sellers bypass the approval gate
  const { count: listingsCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', user.id)

  if ((listingsCount ?? 0) > 0) return <SellClient/>

  // Check application status
  const { data: application } = await supabase
    .from('seller_applications')
    .select('status, reviewer_notes')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!application) redirect('/apply-to-sell')
  if (application.status === 'approved') return <SellClient/>

  // Pending or denied - show gate page
  return <SellGate status={application.status} notes={application.reviewer_notes}/>
}

function SellGate({ status, notes }: { status: string; notes: string | null }) {
  const isPending = status === 'pending'
  return (
    <Shell hideNav title={isPending ? 'Application pending' : 'Application denied'}>
      <section style={{ padding: '32px 20px' }}>
        <div style={{
          background: isPending
            ? 'linear-gradient(140deg, var(--gold-soft) 0%, var(--cream-warm) 100%)'
            : 'linear-gradient(140deg, var(--coral-soft) 0%, var(--cream-warm) 100%)',
          borderRadius: 28, padding: 32, textAlign: 'center'
        }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 12px' }}>
            {isPending ? 'Under review' : 'Not approved'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', lineHeight: 1.6, margin: '0 0 8px' }}>
            {isPending
              ? 'Your application is being reviewed. We\'ll notify you once approved.'
              : 'Your application was not approved this time.'}
          </p>
          {notes && <p style={{ fontSize: 13, color: 'var(--charcoal-soft)', lineHeight: 1.5, margin: '8px 0 24px', padding: '12px', background: 'rgba(255,255,255,0.5)', borderRadius: 14 }}>{notes}</p>}
          {!isPending && (
            <form action="/apply-to-sell">
              <Button variant="primary" size="md">Reapply</Button>
            </form>
          )}
        </div>
      </section>
    </Shell>
  )
}
