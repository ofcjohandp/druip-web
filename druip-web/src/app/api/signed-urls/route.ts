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

  const result: Record<string, string> = {}
  const external = paths.filter(p => p.startsWith('http'))
  const storagePaths = paths.filter(p => !p.startsWith('http'))
  external.forEach(url => { result[url] = url })

  if (storagePaths.length) {
    const { data } = await storage.storage.from('notes').createSignedUrls(storagePaths, 3600)
    if (data) {
      data.forEach((item, idx) => { if (item.signedUrl) result[storagePaths[idx]] = item.signedUrl })
    }
  }

  return NextResponse.json(result)
}
