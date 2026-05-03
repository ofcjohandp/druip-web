import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const { paths } = await request.json() as { paths: string[] }
  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json({})
  }

  const storage = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await storage.storage.from('notes').createSignedUrls(paths, 3600)
  const result: Record<string, string> = {}
  if (data) {
    // Key by original submitted path (not item.path which Supabase may normalise)
    data.forEach((item, idx) => { if (item.signedUrl) result[paths[idx]] = item.signedUrl })
  }

  return NextResponse.json(result)
}
