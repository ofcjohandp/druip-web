'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SA_UNIVERSITIES = [
  'NWU Potchefstroom', 'NWU Mahikeng', 'NWU Vaal Triangle',
  'University of Cape Town (UCT)', 'University of the Witwatersrand (Wits)',
  'University of Pretoria (UP / Tuks)', 'Stellenbosch University',
  'University of Johannesburg (UJ)', 'University of KwaZulu-Natal (UKZN)',
  'University of the Free State (UFS)', 'Rhodes University',
  'University of the Western Cape (UWC)', 'University of Limpopo',
  'University of Venda', 'Walter Sisulu University',
  'University of Fort Hare', 'University of Zululand',
  'Sol Plaatje University', 'Sefako Makgatho Health Sciences University',
  'University of Mpumalanga', 'UNISA', 'CPUT', 'DUT', 'TUT', 'MUT',
  'VUT', 'CUT', 'WSU', 'UFH',
]

const SA_DEGREES = [
  // Health Sciences
  'BSc Physiotherapy', 'BSc Occupational Therapy', 'BSc Nursing',
  'MBChB (Medicine)', 'BPharm (Pharmacy)', 'BSc Dietetics',
  'BSc Speech-Language Therapy', 'BSc Biomedical Sciences',
  'BSc Medical Sciences', 'BSc Radiography',
  // Science & Engineering
  'BSc Computer Science', 'BSc Information Technology',
  'BSc Mathematics', 'BSc Physics', 'BSc Chemistry',
  'BSc Biochemistry', 'BSc Biology', 'BSc Geology',
  'BSc Engineering (Civil)', 'BSc Engineering (Electrical)',
  'BSc Engineering (Mechanical)', 'BSc Engineering (Chemical)',
  'BEng Civil Engineering', 'BEng Electrical Engineering',
  'BEng Mechanical Engineering', 'BEng Chemical Engineering',
  // Business & Commerce
  'BCom Accounting', 'BCom Finance', 'BCom Economics',
  'BCom Business Management', 'BCom Marketing',
  'BCom Human Resources', 'BCom Information Systems',
  'BAdmin Public Administration',
  // Humanities & Social Sciences
  'BA Psychology', 'BA Sociology', 'BA Social Work',
  'BA Political Science', 'BA Philosophy', 'BA History',
  'BA English', 'BA Communications', 'BA Journalism',
  'BA Law', 'LLB (Law)', 'BA Education',
  // Education
  'BEd Foundation Phase', 'BEd Intermediate Phase',
  'BEd Senior Phase', 'BEd FET', 'PGCE',
]

function ComboBox({
  label, value, onChange, options, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = query.length === 0
    ? options
    : options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  function select(option: string) {
    onChange(option)
    setQuery(option)
    setOpen(false)
  }

  return (
    <div className="space-y-2" ref={ref}>
      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1 block font-label">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          className="w-full bg-surface-container-high border-none rounded-full px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant pr-10"
        />
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">
          {open ? 'expand_less' : 'expand_more'}
        </span>
        {open && filtered.length > 0 && (
          <div className="absolute z-50 top-full mt-2 w-full bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/20 max-h-56 overflow-y-auto">
            {filtered.map(option => (
              <button
                key={option}
                type="button"
                onMouseDown={() => select(option)}
                className={`w-full text-left px-5 py-3 text-sm hover:bg-surface-container transition-colors font-medium ${
                  option === value ? 'text-primary font-bold bg-primary-container/10' : 'text-on-surface'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfileEditPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [university, setUniversity] = useState('')
  const [degree, setDegree] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, university, degree, year')
        .eq('id', user.id)
        .single()
      if (data) {
        const d = data as { first_name: string | null; last_name: string | null; university: string | null; degree: string | null; year: number | null }
        setFirstName(d.first_name ?? '')
        setLastName(d.last_name ?? '')
        setUniversity(d.university ?? '')
        setDegree(d.degree ?? '')
        setYear(d.year?.toString() ?? '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/sign-in'); return }
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        university: university || null,
        degree: degree || null,
        year: year ? parseInt(year) : null,
      } as Record<string, unknown>)
      .eq('id', user.id)
    if (error) { setError(error.message); setSaving(false); return }
    router.push('/profile')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex items-center gap-4 px-6 py-4">
        <Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </Link>
        <span className="text-xl font-headline font-black italic text-primary">Edit Profile</span>
      </header>

      <main className="pt-28 pb-16 px-6 max-w-xl mx-auto">
        {/* Profile picture placeholder - ready for future */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full kinetic-gradient flex items-center justify-center text-white font-headline font-black text-3xl shadow-lg">
              {(firstName || 'S').charAt(0).toUpperCase()}
            </div>
            <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center shadow-md" title="Profile photo coming soon">
              <span className="material-symbols-outlined text-on-secondary-container text-base">add_a_photo</span>
            </button>
          </div>
          <p className="text-on-surface-variant text-xs mt-2 font-medium">Profile photo coming soon</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-full bg-error-container/20 text-error text-sm font-medium">{error}</div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1 block font-label">First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Thabo" className="w-full bg-surface-container-high border-none rounded-full px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1 block font-label">Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mokoena" className="w-full bg-surface-container-high border-none rounded-full px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-outline-variant" />
            </div>
          </div>

          <ComboBox
            label="University"
            value={university}
            onChange={setUniversity}
            options={SA_UNIVERSITIES}
            placeholder="Type to search your university…"
          />

          <ComboBox
            label="Degree"
            value={degree}
            onChange={setDegree}
            options={SA_DEGREES}
            placeholder="Type to search your degree…"
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1 block font-label">Year of Study</label>
            <select value={year} onChange={e => setYear(e.target.value)} className="w-full bg-surface-container-high border-none rounded-full px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-on-surface">
              <option value="">Select year</option>
              {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving} className="w-full kinetic-gradient text-white py-4 rounded-full font-bold text-lg shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </main>
    </div>
  )
}
