'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const HS_SUBJECTS = [
  'Mathematics', 'Physical Sciences', 'Life Sciences',
  'Accounting', 'Economics', 'Business Studies',
  'History', 'Geography', 'English', 'Afrikaans',
  'Computer Applications Technology', 'Information Technology',
]

export default function NewClassroomPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  const [level, setLevel] = useState<'highschool' | 'varsity' | null>(null)
  const [name, setName] = useState('')
  const [moduleCode, setModuleCode] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [customSubject, setCustomSubject] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(249)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSubject(s: string) {
    setSelectedSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  function addCustomSubject() {
    const t = customSubject.trim()
    if (t && !selectedSubjects.includes(t)) {
      setSelectedSubjects((prev) => [...prev, t])
      setCustomSubject('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!level) { setError('Select High School or Varsity first.'); return }
    if (!name.trim()) { setError('Classroom name is required.'); return }
    if (level === 'varsity' && !moduleCode.trim()) { setError('Module code is required for varsity classrooms.'); return }
    if (level === 'highschool' && selectedSubjects.length === 0) { setError('Select at least one subject.'); return }
    setError(null)
    setLoading(true)

    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) { setError('Not authenticated.'); setLoading(false); return }

      const { data: tutor, error: tutorErr } = await supabase
        .from('tutors').select('id').eq('user_id', user.id).single()
      if (tutorErr || !tutor) { router.push('/become-tutor'); return }

      const { data: classroom, error: classroomErr } = await supabase
        .from('classrooms')
        .insert({
          name: name.trim(),
          bio: description.trim() || null,
          subjects: level === 'highschool' ? selectedSubjects : [],
          module_code: level === 'varsity' ? moduleCode.trim() : null,
          price_cents: price * 100,
          tutor_id: tutor.id,
        })
        .select('id')
        .single()

      if (classroomErr || !classroom) throw classroomErr ?? new Error('Failed to create classroom')
      router.push(`/tutor/classroom/${classroom.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <div className="kinetic-gradient h-1 w-full fixed top-0 z-50" />

      <header className="fixed top-1 w-full z-40 bg-white/80 backdrop-blur-xl flex items-center gap-3 px-6 py-4">
        <Link href="/tutor/dashboard" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <h1 className="font-headline text-lg font-bold">New Classroom</h1>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-lg mx-auto">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            New Classroom
          </span>
          <h2 className="font-headline text-4xl font-extrabold leading-tight mb-2">
            Launch your <span className="text-primary italic">Digital Classroom</span>
          </h2>
          <p className="text-on-surface-variant">Set it up once - students can find and subscribe from day one.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Level toggle */}
          <div>
            <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-3">
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

          {/* Classroom name */}
          <div>
            <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
              Classroom Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={level === 'varsity' ? 'e.g. FISI 111 Study Group' : level === 'highschool' ? 'e.g. Grade 12 Maths Mastery' : 'e.g. Advanced Statistics'}
              className="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant"
            />
          </div>

          {/* Varsity: module code */}
          {level === 'varsity' && (
            <div>
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
                Module Code
              </label>
              <input
                type="text"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
                placeholder="e.g. FISI 111 - Human Physiology"
                className="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant"
              />
            </div>
          )}

          {/* High school: subjects */}
          {level === 'highschool' && (
            <div>
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-3">
                Subject
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {HS_SUBJECTS.map((s) => {
                  const active = selectedSubjects.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSubject(s)}
                      className={`px-4 py-2 rounded-full font-label text-sm font-bold transition-all ${
                        active
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {s}
                    </button>
                  )
                })}
                {selectedSubjects.filter((s) => !HS_SUBJECTS.includes(s)).map((s) => (
                  <button key={s} type="button" onClick={() => toggleSubject(s)}
                    className="px-4 py-2 rounded-full font-label text-sm font-bold bg-primary text-white shadow-md">
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
                  className="flex-1 bg-surface-container-high border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant"
                />
                <button type="button" onClick={addCustomSubject}
                  className="px-4 py-3 bg-surface-container rounded-xl font-label text-sm font-bold text-primary hover:bg-surface-container-high transition">
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2">
              Short Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn? What makes your classroom different?"
              rows={3}
              className="w-full bg-surface-container-high border-none rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant resize-none"
            />
          </div>

          {/* Price slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                Monthly Price
              </label>
              <span className="font-headline text-2xl font-extrabold text-primary">R{price}</span>
            </div>
            <input
              type="range"
              min={99}
              max={999}
              step={10}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between mt-1">
              <span className="font-label text-xs text-outline">R99</span>
              <span className="font-label text-xs text-outline">R999</span>
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">error</span>
              <span className="font-label text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full kinetic-gradient text-white font-bold py-4 rounded-full text-base shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Creating...
              </span>
            ) : (
              'Launch Classroom →'
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
