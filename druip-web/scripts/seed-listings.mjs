import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vpmrgidheamgerimkaox.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwbXJnaWRoZWFtZ2VyaW1rYW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTczODQyOCwiZXhwIjoyMDkxMzE0NDI4fQ.aY_aLk-oDuVMuLBR5s6pz-eZ8FoESFq8PsKI4-VlhL4'
)

// Create a seed auth user + profile via admin API, or reuse existing
const SEED_EMAIL = 'seed@druip.co.za'
const { data: adminUsers } = await supabase.auth.admin.listUsers()
let seedUser = adminUsers?.users?.find(u => u.email === SEED_EMAIL)
if (!seedUser) {
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: SEED_EMAIL, password: 'SeedPass123!', email_confirm: true,
    user_metadata: { first_name: 'Lerato', last_name: 'Dlamini' }
  })
  if (createErr) { console.error('Failed to create seed user:', createErr.message); process.exit(1) }
  seedUser = created.user
  await supabase.from('profiles').upsert({ id: seedUser.id, first_name: 'Lerato', last_name: 'Dlamini', university: 'NWU Potchefstroom' })
}
const sellerId = seedUser.id

const FACULTY_TONES = {
  'Health Sci': 'sage', 'Engineering': 'turquoise', 'Law': 'coral',
  'Commerce': 'gold', 'Education': 'gold', 'Natural Sciences': 'turquoise',
  'Arts': 'coral', 'Theology': 'sage',
}

const listings = [
  { title: 'Anatomy & Physiology: Musculoskeletal System', code: 'PHYT211', faculty: 'Health Sci', type: 'Notes', pages: 34, price: 65, desc: 'Complete lecture notes covering joints, muscle groups, and innervation. Includes labelled diagrams and mnemonics.' },
  { title: 'Human Anatomy Vol. 1: Full Semester Summary', code: 'PHYT111', faculty: 'Health Sci', type: 'Summary', pages: 18, price: 45, desc: 'Condensed one-page-per-topic summaries. Perfect for last-minute cramming before exams.' },
  { title: 'Contract Law: Essentials and Case Law', code: 'LAW201', faculty: 'Law', type: 'Study Guide', pages: 52, price: 80, desc: 'Covers offer, acceptance, consideration, and breach. Includes key case summaries with outcome notes.' },
  { title: 'Constitutional Law Past Papers 2019-2023', code: 'LAW301', faculty: 'Law', type: 'Past Paper', pages: 90, price: 120, desc: 'Five years of past exam papers with model answers. Annotated with common examiner feedback.' },
  { title: 'Thermodynamics Lecture Notes: Full Module', code: 'ENG221', faculty: 'Engineering', type: 'Notes', pages: 61, price: 75, desc: 'Handwritten and typed hybrid notes. Includes worked examples for every major theorem.' },
  { title: 'Fluid Mechanics Study Guide', code: 'ENG312', faculty: 'Engineering', type: 'Study Guide', pages: 29, price: 55, desc: 'Clear visual explanations of Bernoulli, continuity, and pipe flow. Great for test prep.' },
  { title: 'Financial Accounting: First Year Complete', code: 'ACC101', faculty: 'Commerce', type: 'Notes', pages: 44, price: 60, desc: 'Full set of notes from intro to trial balance. Includes practice questions at the end of each chapter.' },
  { title: 'Business Statistics Cheat Sheet', code: 'STAT201', faculty: 'Commerce', type: 'Summary', pages: 6, price: 25, desc: 'One-page formula sheet per topic: distributions, regression, hypothesis testing. Laminate-ready.' },
  { title: 'Child Development: Piaget and Vygotsky Summary', code: 'EDU211', faculty: 'Education', type: 'Summary', pages: 12, price: 35, desc: 'Comparative summary of major theorists. Includes timeline, key concepts, and exam-ready definitions.' },
  { title: 'Organic Chemistry Notes: Reactions and Mechanisms', code: 'CHEM231', faculty: 'Natural Sciences', type: 'Notes', pages: 48, price: 70, desc: 'All major reaction mechanisms with arrow-pushing diagrams. Colour-coded by reaction type.' },
  { title: 'Introduction to Philosophy: Ethics Module', code: 'PHIL101', faculty: 'Arts', type: 'Notes', pages: 22, price: 40, desc: 'Clear notes on utilitarianism, deontology, and virtue ethics. Includes essay structure tips.' },
  { title: 'Old Testament Survey: Full Semester Notes', code: 'THEO111', faculty: 'Theology', type: 'Notes', pages: 37, price: 50, desc: 'Book-by-book summaries of the OT canon. Includes key themes, authorship debates, and timeline.' },
]

const rows = listings.map(l => ({
  seller_id: sellerId,
  title: l.title,
  code: l.code,
  faculty: l.faculty,
  type: l.type,
  tone: FACULTY_TONES[l.faculty] || 'sage',
  description: l.desc,
  price: l.price,
  pages: l.pages,
  file_urls: [],
  status: 'published',
}))

const { data, error } = await supabase.from('listings').insert(rows).select('id, title')
if (error) { console.error('Insert failed:', error.message); process.exit(1) }
console.log(`✓ Inserted ${data.length} listings:`)
data.forEach(l => console.log(`  · ${l.title}`))
