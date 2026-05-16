import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// One-shot endpoint to seed a real listing with a PDF — delete after use
export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('key') !== 'druip-seed-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Find seller
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const seller = users.find(u => u.email === 'ofc.johandp@gmail.com')
    ?? users.find(u => u.email === 'btois248@gmail.com')
    ?? users[0]

  if (!seller) return NextResponse.json({ error: 'No users found' }, { status: 500 })

  // Fetch a real free PDF (public domain sample)
  const pdfUrl = 'https://www.africau.edu/images/default/sample.pdf'
  const pdfRes = await fetch(pdfUrl)
  if (!pdfRes.ok) return NextResponse.json({ error: 'PDF fetch failed' }, { status: 500 })
  const pdfBuffer = await pdfRes.arrayBuffer()

  // Upload PDF to storage
  const pdfPath = `${seller.id}/files/${Date.now()}-physio-notes-sample.pdf`
  const { error: uploadErr } = await supabase.storage
    .from('notes')
    .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf' })
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  // Create listing
  const { data: listing, error: insertErr } = await supabase.from('listings').insert({
    seller_id: seller.id,
    title: 'Anatomy & Physiology — Chapter 3 Notes',
    code: 'PHYS 201',
    type: 'Notes',
    faculty: 'Health Sciences',
    tone: 'sage',
    description: 'Detailed notes covering musculoskeletal anatomy, physiological processes, and exam-ready summaries for PHYS 201.',
    price: 55,
    pages: 8,
    file_urls: [pdfPath],
    cover_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop',
    status: 'published',
    language: 'English',
    format: 'PDF',
  }).select('id').single()

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, listing_id: listing.id, seller_email: seller.email, pdf_path: pdfPath })
}
