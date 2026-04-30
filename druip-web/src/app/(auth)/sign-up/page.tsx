'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/druip/ui'
import { Icon } from '@/components/druip/icons'

const UNIVERSITIES = ['NWU','UP','UCT','Wits','Stellenbosch','UNISA','UJ','UFS','UKZN','UWC','Rhodes','CPUT','TUT','VUT','DUT','Other']
const ROLES = ['Student','Lecturer','Teacher','Scholar'] as const
type Role = typeof ROLES[number]
const FACULTIES = ['Health Sciences','Engineering & Technology','Law','Commerce','Education','Natural Sciences','Humanities','Theology','Agriculture','Information Technology','Management Sciences','Built Environment']
const DEGREES = ['BSc','BCom','BEd','BEng','BA','LLB','BPharm','MBChB','BTech','BNursing','BSc Physiotherapy','BSc Occupational Therapy','BCom Accounting','BCom Finance','BCom Marketing','Honours','Masters','PhD','HND','ND','Diploma','Certificate']
const MODULES = ['Anatomy','Physiology','Biochemistry','Microbiology','Pathology','Pharmacology','Calculus','Statistics','Linear Algebra','Computer Science','Economics','Financial Accounting','Business Management','Marketing','Constitutional Law','Contract Law','Physics','Chemistry','Cell Biology','History','Geography','Psychology','Research Methods','Communication Skills']
const SCHOOL_SUBJECTS = ['Mathematics','Mathematical Literacy','English Home Language','Afrikaans Home Language','isiZulu','Sesotho','Xhosa','Physical Sciences','Life Sciences','Geography','History','Business Studies','Economics','Accounting','Computer Applications Technology','Information Technology','Life Orientation','Tourism','Agricultural Sciences','Dramatic Arts','Music','Visual Arts','Engineering Graphics & Design']
const GRADES = ['Grade 8','Grade 9','Grade 10','Grade 11','Grade 12']
const STUDY_YEARS = ['1st year','2nd year','3rd year','4th year','5th year','Postgraduate']

function MultiSelect({ label, options, value, onChange, placeholder, allowCustom = false }: {
  label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; placeholder: string; allowCustom?: boolean
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hits = options.filter(o => !value.includes(o) && o.toLowerCase().includes(q.toLowerCase())).slice(0, 7)
  const canAdd = allowCustom && q.trim() && !options.includes(q.trim()) && !value.includes(q.trim())

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const dropStyle: React.CSSProperties = { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--hairline)', borderRadius: 14, overflow: 'hidden', zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
  const rowStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--charcoal)', cursor: 'pointer', fontWeight: 600 }

  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>{label}</label>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {value.map(v => (
            <span key={v} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--sage)', color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
              {v}
              <button type="button" onClick={() => onChange(value.filter(x => x !== v))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 0 0 2px', fontSize: 15, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
          placeholder={value.length ? 'Add more…' : placeholder}
          style={{ width: '100%', padding: '13px 16px', background: 'var(--cream-warm)', border: '1.5px solid var(--hairline)', borderRadius: 14, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: 'var(--charcoal)' }}/>
        {open && (hits.length > 0 || canAdd) && (
          <div style={dropStyle}>
            {hits.map(o => (
              <button key={o} type="button" onClick={() => { onChange([...value, o]); setQ(''); setOpen(false) }}
                style={rowStyle}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>{o}</button>
            ))}
            {canAdd && (
              <button type="button" onClick={() => { onChange([...value, q.trim()]); setQ(''); setOpen(false) }}
                style={{ ...rowStyle, color: 'var(--sage-deep)', fontWeight: 700, borderTop: '1px solid var(--hairline)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>+ Add &ldquo;{q.trim()}&rdquo;</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SingleSelect({ label, options, value, onChange, placeholder }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; placeholder: string
}) {
  const [q, setQ] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hits = options.filter(o => o.toLowerCase().includes(q.toLowerCase())).slice(0, 8)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input value={q} onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '13px 16px', background: 'var(--cream-warm)', border: '1.5px solid var(--hairline)', borderRadius: 14, fontFamily: 'Nunito, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: 'var(--charcoal)' }}/>
        {open && hits.length > 0 && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--hairline)', borderRadius: 14, overflow: 'hidden', zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
            {hits.map(o => (
              <button key={o} type="button" onClick={() => { onChange(o); setQ(o); setOpen(false) }}
                style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', fontFamily: 'Nunito, sans-serif', fontSize: 13, color: 'var(--charcoal)', cursor: 'pointer', fontWeight: 600 }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>{o}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [university, setUniversity] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  const [studentFaculty, setStudentFaculty] = useState<string[]>([])
  const [studentDegree, setStudentDegree] = useState<string[]>([])
  const [studentYear, setStudentYear] = useState('')
  const [lecturerFaculty, setLecturerFaculty] = useState<string[]>([])
  const [lecturerDegree, setLecturerDegree] = useState<string[]>([])
  const [lecturerModules, setLecturerModules] = useState<string[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([])
  const [scholarGrade, setScholarGrade] = useState('')
  const [scholarSubjects, setScholarSubjects] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errs, setErrs] = useState<Record<string, string>>({})

  const toggleRole = (r: Role) => setRoles(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
  }

  function goStep2() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'We need to know what to call you.'
    if (!email.includes('@') || !email.includes('.')) e.email = "That doesn't look right - check the email."
    if (password.length < 8) e.pwd = 'Make it at least 8 characters.'
    setErrs(e)
    if (!Object.keys(e).length) { setErrs({}); setStep(2) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ne: Record<string, string> = {}
    if (!roles.length) ne.roles = 'Pick at least one.'
    setErrs(ne)
    if (Object.keys(ne).length) return

    setError(null)
    setLoading(true)
    const [firstName, ...rest] = name.trim().split(' ')
    const lastName = rest.join(' ') || null
    const supabase = createClient()
    const { error: signUpError, data } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          first_name: firstName, last_name: lastName, university, roles,
          ...(roles.includes('Student') && { student_faculty: studentFaculty, student_degree: studentDegree, student_year: studentYear }),
          ...(roles.includes('Lecturer') && { lecturer_faculty: lecturerFaculty, lecturer_degree: lecturerDegree, lecturer_modules: lecturerModules }),
          ...(roles.includes('Teacher') && { teacher_subjects: teacherSubjects }),
          ...(roles.includes('Scholar') && { scholar_grade: scholarGrade, scholar_subjects: scholarSubjects }),
        },
      },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').update({ university }).eq('id', data.user.id)
    }
    router.push('/home')
    router.refresh()
  }

  const box: React.CSSProperties = { marginBottom: 20, padding: '18px 20px', background: 'var(--cream-warm)', borderRadius: 20, border: '1px solid var(--hairline)' }
  const boxLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '18px 20px 8px', display: 'flex', alignItems: 'center' }}>
        <button onClick={() => step === 1 ? router.push('/') : setStep(1)} aria-label="back"
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cream-warm)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon.back size={18}/>
        </button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {[1,2].map(s => <div key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 4, background: s <= step ? 'var(--sage)' : 'var(--hairline)', transition: 'all 300ms' }}/>)}
        </div>
        <div style={{ width: 40 }}/>
      </header>

      <main style={{ padding: '12px 24px 32px', flex: 1 }}>
        {step === 1 && (
          <>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 8px' }}>Create your account</h1>
            <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', margin: '0 0 28px', lineHeight: 1.5 }}>Free to join. Discover, buy, and sell notes.</p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              <button onClick={signInWithGoogle}
                style={{ flex: 1, padding: '12px 16px', background: 'var(--white)', border: '1px solid var(--hairline)', borderRadius: 16, fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--charcoal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-warm)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--white)')}>
                <Icon.google size={18}/> Continue with Google
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 18px', color: 'var(--fg-muted)' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }}/>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>or with email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--hairline)' }}/>
            </div>

            {error && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--coral-soft)', color: '#B05B3F', borderRadius: 14, fontSize: 13, fontWeight: 600 }}>{error}</div>}

            <Input label="Full name" icon={<Icon.user size={18}/>} placeholder="Lerato Mokoena" value={name} onChange={e => setName(e.target.value)} error={errs.name}/>
            <Input label="Email" type="email" icon={<Icon.mail size={18}/>} placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)} error={errs.email}/>
            <Input label="Password" type="password" icon={<Icon.lock size={18}/>} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} error={errs.pwd}/>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 8 }}>
                University <span style={{ fontWeight: 400, color: 'var(--fg-muted)', fontSize: 12 }}>(optional)</span>
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {UNIVERSITIES.map(u => (
                  <button key={u} type="button" onClick={() => setUniversity(university === u ? '' : u)}
                    style={{ padding: '8px 14px', borderRadius: 999, border: `1.5px solid ${university === u ? 'var(--charcoal)' : 'var(--hairline)'}`, background: university === u ? 'var(--charcoal)' : 'var(--white)', color: university === u ? '#fff' : 'var(--charcoal-soft)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="primary" full size="lg" type="button" onClick={goStep2}>Continue →</Button>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 36, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)', margin: '0 0 8px' }}>One last thing.</h1>
            <p style={{ fontSize: 14, color: 'var(--charcoal-soft)', margin: '0 0 24px', lineHeight: 1.5 }}>Tell us about yourself so we can personalise your experience.</p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 12 }}>
                What are you? <span style={{ fontWeight: 400, color: 'var(--fg-muted)', fontSize: 12 }}>(choose all that apply)</span>
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {ROLES.map(r => (
                  <button key={r} type="button" onClick={() => toggleRole(r)}
                    style={{ padding: '12px 20px', borderRadius: 16, border: `2px solid ${roles.includes(r) ? 'var(--sage)' : 'var(--hairline)'}`, background: roles.includes(r) ? 'var(--sage-soft)' : 'var(--white)', color: roles.includes(r) ? 'var(--sage-deep)' : 'var(--charcoal-soft)', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 200ms' }}>
                    {r}
                  </button>
                ))}
              </div>
              {errs.roles && <div style={{ fontSize: 12, color: '#B05B3F', marginTop: 8 }}>{errs.roles}</div>}
            </div>

            {roles.includes('Student') && (
              <div style={box}>
                <div style={{ ...boxLabel, color: 'var(--sage-deep)' }}>Student details</div>
                <MultiSelect label="Faculty" options={FACULTIES} value={studentFaculty} onChange={setStudentFaculty} placeholder="e.g. Health Sciences"/>
                <MultiSelect label="What you're studying" options={DEGREES} value={studentDegree} onChange={setStudentDegree} placeholder="e.g. BSc Physiotherapy" allowCustom/>
                <SingleSelect label="Year of study" options={STUDY_YEARS} value={studentYear} onChange={setStudentYear} placeholder="e.g. 2nd year"/>
              </div>
            )}

            {roles.includes('Lecturer') && (
              <div style={box}>
                <div style={{ ...boxLabel, color: 'var(--gold-deep)' }}>Lecturer details</div>
                <MultiSelect label="Faculty" options={FACULTIES} value={lecturerFaculty} onChange={setLecturerFaculty} placeholder="e.g. Health Sciences"/>
                <MultiSelect label="Programme / degree you lecture" options={DEGREES} value={lecturerDegree} onChange={setLecturerDegree} placeholder="e.g. BSc" allowCustom/>
                <MultiSelect label="Modules you teach" options={MODULES} value={lecturerModules} onChange={setLecturerModules} placeholder="e.g. Anatomy" allowCustom/>
              </div>
            )}

            {roles.includes('Teacher') && (
              <div style={box}>
                <div style={{ ...boxLabel, color: '#b05b3f' }}>Teacher details</div>
                <MultiSelect label="Subjects you teach" options={SCHOOL_SUBJECTS} value={teacherSubjects} onChange={setTeacherSubjects} placeholder="e.g. Mathematics" allowCustom/>
              </div>
            )}

            {roles.includes('Scholar') && (
              <div style={box}>
                <div style={{ ...boxLabel, color: '#2a7a7a' }}>Scholar details</div>
                <SingleSelect label="Your grade" options={GRADES} value={scholarGrade} onChange={setScholarGrade} placeholder="e.g. Grade 11"/>
                <MultiSelect label="Your subjects" options={SCHOOL_SUBJECTS} value={scholarSubjects} onChange={setScholarSubjects} placeholder="e.g. Mathematics" allowCustom/>
              </div>
            )}

            {error && <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--coral-soft)', color: '#B05B3F', borderRadius: 14, fontSize: 13, fontWeight: 600 }}>{error}</div>}
            <Button variant="primary" full size="lg" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        )}
      </main>

      {step === 1 && (
        <>
          <p style={{ padding: '0 24px 8px', fontSize: 11, color: 'var(--fg-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            By signing up you agree to Druip&apos;s <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>terms</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>privacy policy</span>.
          </p>
          <footer style={{ padding: '0 24px 28px', textAlign: 'center', fontSize: 13, color: 'var(--charcoal-soft)' }}>
            Already on Druip?{' '}
            <span onClick={() => router.push('/sign-in')} style={{ color: 'var(--sage-deep)', fontWeight: 700, cursor: 'pointer' }}>Sign in</span>
          </footer>
        </>
      )}
    </div>
  )
}
