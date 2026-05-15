'use client'

import { useState, useCallback } from 'react'
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
}

function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>(0)
  const [error, setError] = useState(false)

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
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--charcoal-soft)', fontSize: 14 }}>
          Loading...
        </div>
      }
    >
      {Array.from({ length: numPages }, (_, i) => (
        <div key={i} style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <Page
            pageNumber={i + 1}
            width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 32 : 360, 720)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      ))}
    </Document>
  )
}

export default function ViewClient({ title, files }: Props) {
  const router = useRouter()

  return (
    <Shell hideNav onBack={() => router.back()} title="">
      <div
        style={{ padding: '0 16px 40px' }}
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
          <div
            key={i}
            style={{ marginBottom: 24, userSelect: 'none' }}
          >
            {file.type === 'pdf' ? (
              <PdfViewer url={file.url} />
            ) : (
              <img
                src={file.url}
                alt={`Page ${i + 1}`}
                draggable={false}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  display: 'block',
                  boxShadow: 'var(--shadow-card)',
                  pointerEvents: 'none',
                }}
              />
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
    </Shell>
  )
}
