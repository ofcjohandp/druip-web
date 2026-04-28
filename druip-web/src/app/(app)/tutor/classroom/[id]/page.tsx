import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TutorBottomNav from '@/components/ui/TutorBottomNav'
import AddSectionForm from './AddSectionForm'

type CardRow = {
  id: string
  type: 'text' | 'pdf' | 'image' | 'flashcard'
}

type SectionWithCards = {
  id: string
  title: string
  order: number | null
  cards: CardRow[]
}

const CARD_TYPE_ICONS: Record<string, string> = {
  text: 'article',
  pdf: 'description',
  image: 'image',
  flashcard: 'style',
}

export default async function ClassroomBuilderPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: tutor } = await db
    .from('tutors')
    .select('id')
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null }
  if (!tutor) redirect('/become-tutor')

  const { data: classroom } = await db
    .from('classrooms')
    .select('id, name, description, price, tutor_id')
    .eq('id', id)
    .single() as { data: { id: string; name: string; description: string | null; price: number | null; tutor_id: string } | null }

  if (!classroom) redirect('/tutor/dashboard')
  if (classroom.tutor_id !== tutor.id) redirect('/tutor/dashboard')

  const { data: rawSections } = await db
    .from('sections')
    .select('id, title, order, cards(id, type)')
    .eq('classroom_id', id)
    .order('order') as { data: SectionWithCards[] | null }

  const sections = rawSections ?? []

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex items-center gap-3 px-6 py-4">
        <Link
          href="/tutor/dashboard"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <h1 className="font-headline text-lg font-bold truncate flex-1">{classroom.name}</h1>
        {classroom.price != null && (
          <span className="font-label text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
            R{classroom.price}/mo
          </span>
        )}
      </header>

      <main className="pt-24 pb-36 px-6 max-w-3xl mx-auto">
        {/* Hero banner */}
        <div className="kinetic-gradient rounded-xl p-8 mb-10 relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 text-white px-4 py-1 rounded-full font-label text-[11px] font-bold tracking-wider mb-4 inline-block">
              CLASSROOM BUILDER
            </span>
            <h2 className="font-headline text-3xl font-extrabold text-white mb-2 leading-tight">
              {classroom.name}
            </h2>
            <p className="text-white/80 text-sm max-w-md">
              {classroom.description ?? 'Add sections to organise your classroom content.'}
            </p>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-12 -mt-12 pointer-events-none" />
        </div>

        {/* Sections */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline text-xl font-bold">Sections</h3>
            <span className="font-label text-sm text-on-surface-variant">
              {sections.length} {sections.length === 1 ? 'section' : 'sections'}
            </span>
          </div>

          {sections.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-10 text-center mb-4">
              <span className="material-symbols-outlined text-outline text-5xl block mb-3">layers</span>
              <p className="font-headline text-lg font-bold mb-1">No sections yet</p>
              <p className="text-on-surface-variant text-sm">Add your first section to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              {sections.map((section) => {
                const cardCount = section.cards?.length ?? 0
                const typeSet = Array.from(new Set(section.cards?.map((c) => c.type) ?? []))
                return (
                  <Link
                    key={section.id}
                    href={`/tutor/classroom/${id}/sections/${section.id}`}
                    className="bg-surface-container-lowest rounded-xl p-6 flex items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow group"
                  >
                    <span className="material-symbols-outlined text-outline text-xl flex-shrink-0">
                      drag_indicator
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline text-lg font-bold text-on-surface truncate">
                        {section.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-label text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                          {cardCount} {cardCount === 1 ? 'item' : 'items'}
                        </span>
                        {typeSet.map((type) => (
                          <span
                            key={type}
                            className="material-symbols-outlined text-primary text-base"
                            title={type}
                          >
                            {CARD_TYPE_ICONS[type] ?? 'article'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Add Section Form */}
          <AddSectionForm classroomId={id} currentSectionCount={sections.length} />
        </div>
      </main>

      {/* Floating action button */}
      <button
        className="fixed bottom-24 right-6 w-14 h-14 kinetic-gradient rounded-full flex items-center justify-center shadow-lg hover:opacity-90 active:scale-95 transition-all z-40"
        title="Publish classroom"
      >
        <span className="material-symbols-outlined text-white text-2xl">publish</span>
      </button>

      <TutorBottomNav active="classrooms" />
    </div>
  )
}
