import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TutorBottomNav from '@/components/ui/TutorBottomNav'

export default async function TutorDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: tutor } = await supabase
    .from('tutors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!tutor) redirect('/become-tutor')

  const [classroomsResult, profileResult] = await Promise.all([
    supabase
      .from('classrooms')
      .select('id, name, bio, price_cents, module_code, subjects')
      .eq('tutor_id', tutor.id),
    supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single(),
  ])

  const classrooms = classroomsResult.data ?? []
  const profile = profileResult.data

  const classroomIds = classrooms.map((c) => c.id)

  const { data: subscriptions } = classroomIds.length > 0
    ? await supabase
        .from('subscriptions')
        .select('classroom_id, subscribed_at')
        .in('classroom_id', classroomIds)
    : { data: [] }

  const allSubs = subscriptions ?? []
  const totalStudents = allSubs.length

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const newThisWeek = allSubs.filter(
    (s) => new Date(s.subscribed_at) >= oneWeekAgo
  ).length

  // Map subscriber counts per classroom
  const subsPerClassroom: Record<string, number> = {}
  for (const s of allSubs) {
    subsPerClassroom[s.classroom_id] = (subsPerClassroom[s.classroom_id] ?? 0) + 1
  }

  const firstName = profile?.first_name ?? user.email?.split('@')[0] ?? 'Coach'

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-headline font-black italic text-primary">Druip</span>
          <span className="font-label text-xs text-on-surface-variant font-bold tracking-wider uppercase ml-2 hidden sm:inline">
            The Academic Catalyst
          </span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">menu</span>
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Greeting */}
        <section className="mb-10">
          <h1 className="font-headline text-[2.5rem] font-extrabold leading-tight tracking-tight mb-1">
            Welcome back, <span className="text-primary italic">{firstName}!</span>
          </h1>
          <p className="text-on-surface-variant">
            {classrooms.length > 0
              ? `You have ${classrooms.length} classroom${classrooms.length !== 1 ? 's' : ''} running.`
              : 'Create your first classroom to get started.'}
          </p>
        </section>

        {/* Bento stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total students */}
          <div className="bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <span className="material-symbols-outlined text-primary text-3xl mb-4"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
            <div>
              <div className="font-headline text-5xl font-black text-on-surface mb-1">{totalStudents}</div>
              <div className="font-label text-sm font-bold text-on-surface-variant uppercase tracking-wider">Total Students</div>
            </div>
          </div>

          {/* Classrooms — primary gradient */}
          <div className="kinetic-gradient rounded-xl p-8 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,88,187,0.25)]">
            <span className="material-symbols-outlined text-white/80 text-3xl mb-4"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            <div>
              <div className="font-headline text-5xl font-black text-white mb-1">{classrooms.length}</div>
              <div className="font-label text-sm font-bold text-white/80 uppercase tracking-wider">
                {classrooms.length === 1 ? 'Classroom' : 'Classrooms'}
              </div>
            </div>
          </div>

          {/* New this week */}
          <div className="bg-secondary-container rounded-xl p-8 flex flex-col justify-between">
            <span className="material-symbols-outlined text-on-secondary-container text-3xl mb-4"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
            <div>
              <div className="font-headline text-5xl font-black text-on-secondary-container mb-1">{newThisWeek}</div>
              <div className="font-label text-sm font-bold text-on-secondary-container uppercase tracking-wider">New This Week</div>
            </div>
          </div>
        </div>

        {/* My Classrooms */}
        <section className="mb-8">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-headline text-2xl font-bold">My Classrooms</h2>
            <Link
              href="/tutor/new-classroom"
              className="font-label text-sm font-bold text-primary hover:underline"
            >
              + New
            </Link>
          </div>

          {classrooms.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-outline text-6xl mb-4 block">
                school
              </span>
              <h3 className="font-headline text-xl font-bold mb-2">No classrooms yet</h3>
              <p className="text-on-surface-variant mb-6">Create your first classroom to start earning and teaching.</p>
              <Link
                href="/tutor/new-classroom"
                className="inline-block kinetic-gradient text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Create First Classroom
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {classrooms.map((classroom) => {
                const count = subsPerClassroom[classroom.id] ?? 0
                return (
                  <div
                    key={classroom.id}
                    className="bg-surface-container-lowest rounded-xl p-6 flex items-center justify-between gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-headline text-lg font-bold truncate">{classroom.name}</h3>
                        <span className="flex-shrink-0 bg-primary/10 text-primary px-3 py-0.5 rounded-full font-label text-xs font-bold">
                          {count} {count === 1 ? 'student' : 'students'}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-sm line-clamp-1">
                        {classroom.module_code ?? (classroom.subjects?.join(', ') || classroom.bio) ?? 'No description.'}
                      </p>
                      {classroom.price_cents != null && (
                        <span className="font-label text-xs text-on-surface-variant">R{classroom.price_cents / 100}/mo</span>
                      )}
                    </div>
                    <Link
                      href={`/tutor/classroom/${classroom.id}`}
                      className="flex-shrink-0 flex items-center gap-1 bg-surface-container text-on-surface px-4 py-2 rounded-full font-label text-sm font-bold hover:bg-primary hover:text-white transition-colors"
                    >
                      Manage
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Create New Classroom CTA */}
        {classrooms.length > 0 && (
          <Link
            href="/tutor/new-classroom"
            className="block w-full text-center kinetic-gradient text-white font-bold py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Create New Classroom
            </span>
          </Link>
        )}
      </main>

      <TutorBottomNav active="dashboard" />
    </div>
  )
}
