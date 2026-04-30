import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import BottomNav from '@/components/ui/BottomNav'

type TutorProfile = {
  first_name: string | null
  last_name: string | null
}

type Tutor = {
  id: string
  bio: string | null
  subjects: string[] | null
  photo_url: string | null
  profiles: TutorProfile | null
}

type Classroom = {
  id: string
  name: string
  description: string | null
  price: number | null
  tutor_id: string
  tutors: Tutor | null
}

type Card = {
  id: string
  type: 'text' | 'pdf' | 'image' | 'flashcard'
  content: Record<string, unknown>
}

type Section = {
  id: string
  title: string
  order: number
  cards: Card[]
}

const cardIconMap: Record<string, { icon: string; bg: string }> = {
  pdf: { icon: 'description', bg: 'bg-primary-container' },
  flashcard: { icon: 'style', bg: 'bg-secondary-container' },
  text: { icon: 'article', bg: 'bg-tertiary-container' },
  image: { icon: 'image', bg: 'bg-surface-container' },
}

async function subscribeToClassroom(classroomId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('subscriptions').insert({ student_id: user.id, classroom_id: classroomId })
  revalidatePath(`/classrooms/${classroomId}`)
}

export default async function ClassroomDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const [classroomResult, sectionsResult, subscriptionResult] = await Promise.all([
    db
      .from('classrooms')
      .select('id, name, description, price, tutor_id, tutors(id, bio, subjects, photo_url, profiles(first_name, last_name))')
      .eq('id', id)
      .single(),
    db
      .from('sections')
      .select('id, title, order, cards(id, type, content)')
      .eq('classroom_id', id)
      .order('order'),
    db
      .from('subscriptions')
      .select('id')
      .eq('student_id', user.id)
      .eq('classroom_id', id)
      .single(),
  ])

  if (!classroomResult.data) notFound()

  const classroom = classroomResult.data as Classroom
  const sections = sectionsResult.data as Section[] | null
  const isSubscribed = !!subscriptionResult.data

  const tutor = classroom.tutors
  const tutorName = tutor?.profiles
    ? `${tutor.profiles.first_name ?? ''} ${tutor.profiles.last_name ?? ''}`.trim() || 'Unknown tutor'
    : 'Unknown tutor'
  const isFree = !classroom.price || classroom.price === 0

  const subscribeWithId = subscribeToClassroom.bind(null, classroom.id)

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex items-center gap-4 px-6 py-4">
        <Link
          href="/browse"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </Link>
        <span className="text-2xl font-headline font-black italic text-primary flex-1">Druip</span>
      </header>

      <main className="pt-28 pb-32 px-6 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="mb-12">
          <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-label text-[11px] font-bold tracking-wider mb-4">
            PREMIUM CLASSROOM
          </span>
          <h1 className="font-headline text-5xl font-extrabold leading-none tracking-tight mb-4 text-on-surface">
            {classroom.name}
          </h1>
          {classroom.description && (
            <p className="text-on-surface-variant text-lg max-w-2xl">{classroom.description}</p>
          )}
          <div className="flex items-center gap-6 mt-5 flex-wrap">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-base">person</span>
              <span className="font-medium">{tutorName}</span>
            </div>
            <span
              className={`px-4 py-1.5 rounded-full font-label font-bold text-sm ${
                isFree
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface'
              }`}
            >
              {isFree ? 'Free' : `R${classroom.price}`}
            </span>
          </div>
        </section>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT: Join the Squad CTA */}
          <div className="md:col-span-1 bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)] flex flex-col justify-between gap-6">
            <div>
              <h2 className="font-headline text-2xl font-bold mb-2">Join the Squad</h2>
              <p className="text-on-surface-variant text-sm">
                {isSubscribed
                  ? "You're part of this classroom. Dive into the content below."
                  : 'Subscribe to unlock all sections, flashcards, and study material.'}
              </p>
            </div>

            {isSubscribed ? (
              <div className="flex items-center gap-3 bg-[#e6f4ea] rounded-xl p-4">
                <span
                  className="material-symbols-outlined text-[#1b7f38] text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <div>
                  <div className="font-bold text-[#1b7f38] text-sm">You&apos;re enrolled</div>
                  <div className="text-[#1b7f38]/70 text-xs">Full access unlocked</div>
                </div>
              </div>
            ) : (
              <form action={subscribeWithId}>
                <button
                  type="submit"
                  className="w-full kinetic-gradient text-white py-4 rounded-full font-bold text-base shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  {isFree ? 'Subscribe - Free' : `Subscribe - R${classroom.price}`}
                </button>
              </form>
            )}

            {/* Tutor card */}
            {tutor && (
              <div className="bg-surface-container rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary kinetic-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {tutorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm">{tutorName}</div>
                  {tutor.bio && (
                    <p className="text-on-surface-variant text-xs line-clamp-2 mt-0.5">{tutor.bio}</p>
                  )}
                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {tutor.subjects.slice(0, 3).map((s) => (
                        <span key={s} className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Study Vault */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-2xl font-bold">Study Vault</h2>
              {sections && sections.length > 0 && (
                <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full font-label text-xs font-bold">
                  {sections.length} section{sections.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {!sections || sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <span className="material-symbols-outlined text-outline text-5xl">folder_open</span>
                <p className="text-on-surface-variant font-medium">Your tutor hasn&apos;t added content yet</p>
                <p className="text-on-surface-variant/60 text-sm">Check back soon - they&apos;re working on it.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sections.map((section) => {
                  const cardCount = section.cards?.length ?? 0
                  const typeGroups = section.cards?.reduce<Record<string, number>>((acc, card) => {
                    acc[card.type] = (acc[card.type] ?? 0) + 1
                    return acc
                  }, {}) ?? {}
                  const dominantType = Object.keys(typeGroups).sort((a, b) => typeGroups[b] - typeGroups[a])[0]
                  const iconData = dominantType
                    ? cardIconMap[dominantType] ?? { icon: 'folder', bg: 'bg-surface-container' }
                    : { icon: 'folder', bg: 'bg-surface-container' }

                  const content = (
                    <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl hover:bg-surface-container-high transition-colors group">
                      <div className={`w-10 h-10 ${iconData.bg} rounded-lg flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-on-surface text-lg">{iconData.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-on-surface truncate">{section.title}</div>
                        <div className="text-on-surface-variant text-xs mt-0.5">
                          {cardCount === 0
                            ? 'No cards yet'
                            : `${cardCount} card${cardCount !== 1 ? 's' : ''}`}
                        </div>
                      </div>
                      {isSubscribed ? (
                        <span className="material-symbols-outlined text-primary text-xl group-hover:translate-x-0.5 transition-transform">
                          chevron_right
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-outline text-xl">lock</span>
                      )}
                    </div>
                  )

                  if (isSubscribed) {
                    return (
                      <Link key={section.id} href={`/classrooms/${classroom.id}/sections/${section.id}`}>
                        {content}
                      </Link>
                    )
                  }

                  return <div key={section.id}>{content}</div>
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav active="classroom" />
    </div>
  )
}
