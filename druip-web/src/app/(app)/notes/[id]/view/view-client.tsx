'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Shell } from '@/components/druip/shell'
import { Icon } from '@/components/druip/icons'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface FileItem { url: string; type: 'image' | 'pdf' }

interface Props {
  title: string
  files: FileItem[]
  userEmail: string
}

const SCALE_STEPS = [0.75, 1, 1.25, 1.5, 2]

function Watermark({ email }: { email: string }) {
  const text = email
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        transform: 'rotate(-35deg)',
        whiteSpace: 'nowrap',
        fontSize: 11,
        fontWeight: 500,
        color: 'rgba(40,40,40,0.07)',
        letterSpacing: '0.05em',
        userSelect: 'none',
        lineHeight: 2.2,
        textAlign: 'center',
        width: '200%',
      }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i}>{Array.from({ length: 4 }, (_, j) => <span key={j}>{text}&nbsp;&nbsp;&nbsp;&nbsp;</span>)}</div>
        ))}
      </div>
    </div>
  )
}

function PageSkeleton({ width }: { width: number }) {
  return (
    <div style={{
      width,
      height: Math.round(width * 1.414),
      borderRadius: 12,
      background: 'linear-gradient(90deg, var(--cream-dark, #f0ebe0) 25%, var(--cream, #faf7f0) 50%, var(--cream-dark, #f0ebe0) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

function PdfViewer({ url, userEmail, scale }: { url: string; userEmail: string; scale: number }) {
  const [numPages, setNumPages] = useState<number>(0)
  const [error, setError] = useState(false)
  const [pageWidth, setPageWidth] = useState<number>(
    typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 720) : 360
  )

  useEffect(() => {
    const onResize = () => setPageWidth(Math.min(window.innerWidth - 32, 720))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }, [])

  if (error) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--charcoal-soft)', fontSize: 14 }}>
        Could not load this file.
      </div>
    )
  }

  return (
    <Document
      file={url}
      onLoadSuccess={onLoadSuccess}
      onLoadError={() => setError(true)}
      loading={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 3 }, (_, i) => <PageSkeleton key={i} width={pageWidth} />)}
        </div>
      }
    >
      {Array.from({ length: numPages }, (_, i) => (
        <div
          key={i}
          data-page={i + 1}
          style={{ position: 'relative', marginBottom: 12, borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}
        >
          <Page
            pageNumber={i + 1}
            width={Math.round(pageWidth * scale)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
          <Watermark email={userEmail} />
        </div>
      ))}
    </Document>
  )
}

export default function ViewClient({ title, files, userEmail }: Props) {
  const router = useRouter()
  const [scaleIdx, setScaleIdx] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const scale = SCALE_STEPS[scaleIdx]

  useEffect(() => {
    const pages = containerRef.current?.querySelectorAll('[data-page]')
    if (!pages?.length) return
    setTotalPages(pages.length)

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) {
          const top = visible.reduce((a, b) => a.boundingClientRect.top < b.boundingClientRect.top ? a : b)
          const page = Number((top.target as HTMLElement).dataset.page)
          if (page) setCurrentPage(page)
        }
      },
      { threshold: 0.3 }
    )
    pages.forEach(p => observer.observe(p))
    return () => observer.disconnect()
  }, [files, scaleIdx])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && (e.key === 's' || e.key === 'p' || (e.shiftKey && e.key === 's'))) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <style>{`
        @media print { body { display: none; } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <Shell hideNav onBack={() => router.back()} title="">
        <div
          ref={containerRef}
          style={{ padding: '0 16px 80px' }}
          onContextMenu={e => e.preventDefault()}
        >
          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 600,
            fontSize: 20,
            color: 'var(--charcoal)',
            margin: '0 0 20px',
            letterSpacing: '-.02em',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>

          {files.map((file, i) => (
            <div key={i} style={{ marginBottom: 24, userSelect: 'none', WebkitUserSelect: 'none' }}>
              {file.type === 'pdf' ? (
                <PdfViewer url={file.url} userEmail={userEmail} scale={scale} />
              ) : (
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
                  <img
                    src={file.url}
                    alt={`Page ${i + 1}`}
                    draggable={false}
                    style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
                  />
                  <Watermark email={userEmail} />
                </div>
              )}
            </div>
          ))}

          {files.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 20px', color: 'var(--charcoal-soft)' }}>
              <Icon.doc size={40} />
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600 }}>No files to display.</div>
            </div>
          )}
        </div>

        {/* Floating toolbar */}
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--charcoal)',
          borderRadius: 100,
          padding: '8px 16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          zIndex: 50,
          color: 'var(--cream)',
          fontSize: 13,
          fontWeight: 600,
          userSelect: 'none',
        }}>
          {totalPages > 0 && (
            <span style={{ opacity: 0.7, fontSize: 12 }}>{currentPage} / {totalPages}</span>
          )}
          <button
            onClick={() => setScaleIdx(i => Math.max(0, i - 1))}
            disabled={scaleIdx === 0}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cream)',
              cursor: scaleIdx === 0 ? 'default' : 'pointer',
              opacity: scaleIdx === 0 ? 0.3 : 1,
              fontSize: 18,
              lineHeight: 1,
              padding: '0 2px',
            }}
          >−</button>
          <span style={{ fontSize: 12, opacity: 0.7, minWidth: 32, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScaleIdx(i => Math.min(SCALE_STEPS.length - 1, i + 1))}
            disabled={scaleIdx === SCALE_STEPS.length - 1}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cream)',
              cursor: scaleIdx === SCALE_STEPS.length - 1 ? 'default' : 'pointer',
              opacity: scaleIdx === SCALE_STEPS.length - 1 ? 0.3 : 1,
              fontSize: 18,
              lineHeight: 1,
              padding: '0 2px',
            }}
          >+</button>
        </div>
      </Shell>
    </>
  )
}
