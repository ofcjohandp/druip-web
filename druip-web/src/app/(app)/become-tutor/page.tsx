'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Economics',
  'Accounting',
  'Law',
]

export default function BecomeTutorPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 fields
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')

  // Step 2 fields
  const [level, setLevel] = useState<'highschool' | 'varsity' | null>(null)
  const [classroomName, setClassroomName] = useState('')
  const [moduleCode, setModuleCode] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [customSubject, setCustomSubject] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  function toggleSubject(subject: string) {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
  }

  function addCustomSubject() {
    const trimmed = customSubject.trim()
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects((prev) => [...prev, trimmed])
      setCustomSubject('')
    }
  }

  function handleStep1() {
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (bio.trim().length < 50) { setError('Please write a bio of at least 50 characters.'); return }
    setError(null)
    setStep(2)
  }

  async function handleSubmit() {
    if (!level) { setError('Please select High School or Varsity.'); return }
    if (!classroomName.trim()) { setError('Please enter a classroom name.'); return }
    if (level === 'varsity' && !moduleCode.trim()) { setError('Please enter the module code.'); return }
    if (level === 'highschool' && selectedSubjects.length === 0) { setError('Please select at least one subject.'); return }
    if (!description.trim()) { setError('Please add a description.'); return }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError('Please enter a valid price.'); return }
    setError(null)
    setLoading(true)

    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) { setError('Not authenticated. Please sign in.'); setLoading(false); return }

      // Split fullName into first/last
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || null

      // Cast to any: supabase-js generic inference collapses to never for
      // tables with Update: Record<string, never> (subscriptions) which
      // poisons the whole client type in this component.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any

      // 1. Update profile role + name
      const { error: profileErr } = await db
        .from('profiles')
        .update({ is_tutor: true, first_name: firstName, last_name: lastName })
        .eq('id', user.id)
      if (profileErr) throw profileErr

      // 2. Insert tutor record (upsert to handle re-attempts)
      const { data: tutor, error: tutorErr } = await db
        .from('tutors')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' })
        .select('id')
        .single()
      if (tutorErr || !tutor) throw tutorErr ?? new Error('Failed to create tutor record')

      // 3. Insert classroom
      const { data: classroom, error: classroomErr } = await db
        .from('classrooms')
        .insert({
          name: classroomName.trim(),
          bio: description.trim() || null,
          subjects: selectedSubjects,
          module_code: moduleCode.trim() || null,
          price_cents: Math.round(Number(price) * 100),
          tutor_id: tutor.id,
        })
        .select('id')
        .single()
      if (classroomErr || !classroom) throw classroomErr ?? new Error('Failed to create classroom')

      router.push('/tutor/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Kinetic gradient header strip */}
      <div className="kinetic-gradient h-2 w-full fixed top-0 z-50" />

      <main className="pt-10 pb-20 px-6 max-w-lg mx-auto">
        {/* Logo */}
        <div className="mt-6 mb-8">
          <span className="text-2xl font-headline font-black italic text-primary">Druip</span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Step {step} of 2
            </span>
            <span className="font-label text-xs font-bold text-primary">{step === 1 ? '50%' : '100%'}</span>
          </div>
          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full kinetic-gradient rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-error-container text-on-error-container rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">error</span>
            <span className="font-label text-sm">{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div>
            <h1 className="font-headline text-3xl font-extrabold leading-tight mb-2">
              Join the ranks of <span className="text-primary italic">top tutors</span>
            </h1>
            <p className="text-on-surface-variant mb-8">
              Share your expertise and build a student community around your knowledge.
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Thabo Nkosi"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">
                  Your Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about your background, qualifications, and teaching style..."
                  rows={5}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                />
                <p className="font-label text-xs text-on-surface-variant mt-1">
                  {bio.length} characters - aim for at least 150 for a strong profile
                </p>
              </div>

              <button
                onClick={handleStep1}
                className="w-full kinetic-gradient text-white font-bold py-4 rounded-full text-base shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Next Step →
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => { setStep(1); setError(null) }}
              className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface mb-6 font-label text-sm font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>

            <h1 className="font-headline text-3xl font-extrabold leading-tight mb-2">
              Launch your <span className="text-primary italic">Digital Classroom</span>
            </h1>
            <p className="text-on-surface-variant mb-8">
              Set up your first classroom - you can always create more later.
            </p>

            <div className="flex flex-col gap-5">

              {/* Level toggle */}
              <div>
                <label className="font-label text-sm font-bold text-on-surface-variant block mb-3">
                  Who are you tutoring?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['highschool', 'varsity'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => { setLevel(l); setSelectedSubjects([]); setModuleCode('') }}
                      className={`py-4 rounded-xl font-label font-bold text-sm border-2 transition-all ${
                        level === l
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                    >
                      {l === 'highschool' ? '🎒 High School' : '🎓 Varsity'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">
                  Classroom Name
                </label>
                <input
                  type="text"
                  value={classroomName}
                  onChange={(e) => setClassroomName(e.target.value)}
                  placeholder={level === 'varsity' ? 'e.g. FISI 111 Study Group' : 'e.g. Grade 12 Maths Mastery'}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>

              {/* Varsity: module code (required) */}
              {level === 'varsity' && (
                <div>
                  <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">
                    Module Code
                  </label>
                  <input
                    type="text"
                    value={moduleCode}
                    onChange={(e) => setModuleCode(e.target.value)}
                    placeholder="e.g. FISI 111 - Human Physiology"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              )}

              {/* High school: subjects (required) */}
              {level === 'highschool' && (
                <div>
                  <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">
                    Subjects
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {SUBJECTS.map((subject) => {
                      const active = selectedSubjects.includes(subject)
                      return (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-4 py-2 rounded-full font-label text-sm font-bold border transition-all ${
                            active
                              ? 'bg-primary text-white border-primary'
                              : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                          }`}
                        >
                          {subject}
                        </button>
                      )
                    })}
                    {selectedSubjects.filter((s) => !SUBJECTS.includes(s)).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject(s)}
                        className="px-4 py-2 rounded-full font-label text-sm font-bold border bg-primary text-white border-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubject() } }}
                      placeholder="Add custom subject..."
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 font-body text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                    <button
                      type="button"
                      onClick={addCustomSubject}
                      className="px-4 py-2 bg-surface-container rounded-xl font-label text-sm font-bold text-primary border border-outline-variant hover:bg-surface-container-low transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what students will learn, how the classroom is structured, and what makes your approach unique..."
                  rows={4}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                />
              </div>

              <div>
                <label className="font-label text-sm font-bold text-on-surface-variant block mb-2">
                  Monthly Price (R)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">R</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 249"
                    min="1"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-8 pr-4 py-3 font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span className="font-label text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full kinetic-gradient text-white font-bold py-4 rounded-full text-base shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    Setting up...
                  </span>
                ) : (
                  'Complete Setup'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
