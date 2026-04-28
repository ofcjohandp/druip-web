'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AddSectionForm({
  classroomId,
  currentSectionCount,
}: {
  classroomId: string
  currentSectionCount: number
}) {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSave() {
    if (!title.trim()) { setError('Section title is required.'); return }
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { error: insertErr } = await db.from('sections').insert({
      classroom_id: classroomId,
      title: title.trim(),
      order: currentSectionCount + 1,
    })

    if (insertErr) {
      setError(insertErr.message)
      return
    }

    setTitle('')
    setOpen(false)
    startTransition(() => {
      router.refresh()
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-outline-variant rounded-xl py-5 text-on-surface-variant hover:border-primary hover:text-primary transition-colors font-label font-bold"
      >
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <span className="material-symbols-outlined text-xl">add</span>
        </span>
        Add Section
      </button>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border-2 border-primary/30">
      <h4 className="font-headline text-lg font-bold mb-4">New Section</h4>

      {error && (
        <div className="mb-4 bg-error-container text-on-error-container rounded-lg px-3 py-2 font-label text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
        placeholder="e.g. Week 1: Introduction"
        autoFocus
        className="w-full bg-white border border-outline-variant rounded-xl px-4 py-3 font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary transition mb-4"
      />

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 kinetic-gradient text-white font-bold py-3 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 font-label text-sm"
        >
          {isPending ? 'Saving...' : 'Save Section'}
        </button>
        <button
          onClick={() => { setOpen(false); setTitle(''); setError(null) }}
          className="px-6 py-3 bg-surface-container rounded-full font-label text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
