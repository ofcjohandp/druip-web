'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Icon } from './icons'
import { IconButton } from './ui'

const NAV = [
  { key: '/home',     label: 'Home',     icon: Icon.home },
  { key: '/browse',   label: 'Browse',   icon: Icon.browse },
  { key: '/sell',     label: 'Sell',     icon: Icon.sell, primary: true },
  { key: '/earnings', label: 'Earnings', icon: Icon.earn },
  { key: '/profile',  label: 'You',      icon: Icon.user },
]

interface ShellProps {
  children: React.ReactNode
  title?: string
  headerVariant?: 'logo' | 'title'
  onBack?: () => void
  sticky?: boolean
  hideNav?: boolean
  hideHeader?: boolean
  rightAction?: React.ReactNode
}

export const Shell = ({ children, title, headerVariant, onBack, sticky, hideNav, hideHeader, rightAction }: ShellProps) => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {!hideHeader && (
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 8px', flexShrink: 0,
          ...(sticky ? { position: 'sticky', top: 0, zIndex: 30, background: 'rgba(250,247,242,.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {})
        }}>
          {onBack
            ? <IconButton ariaLabel="back" onClick={onBack}><Icon.back size={18}/></IconButton>
            : headerVariant === 'logo'
              ? <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 26, color: 'var(--sage)', letterSpacing: '-.02em', lineHeight: 1 }}>druip</span>
              : <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 22, color: 'var(--charcoal)' }}>{title}</div>}
          {onBack && title && <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 17, color: 'var(--charcoal)' }}>{title}</div>}
          {rightAction ?? (!onBack ? <IconButton ariaLabel="alerts"><Icon.bell size={18}/></IconButton> : <div style={{ width: 40 }}/>)}
        </header>
      )}

      <main style={{ flex: 1, paddingBottom: hideNav ? 24 : 110 }}>
        {children}
      </main>

      {!hideNav && (
        <nav style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 16, width: 'min(360px, calc(100% - 32px))', height: 68, background: 'rgba(250,247,242,.86)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'space-around', boxShadow: '0 14px 36px rgba(60,50,30,.12)', border: '1px solid var(--hairline)', zIndex: 50 }}>
          {NAV.map(item => {
            const active = pathname === item.key
            if (item.primary) {
              return (
                <button key={item.key} onClick={() => router.push(item.key)} aria-label={item.label}
                  style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--sage)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 18px rgba(122,158,126,.4)', transition: 'transform 200ms cubic-bezier(.34,1.56,.64,1)' }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  <item.icon size={22}/>
                </button>
              )
            }
            return (
              <button key={item.key} onClick={() => router.push(item.key)} aria-label={item.label}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: active ? 'var(--sage-deep)' : 'var(--fg-muted)', padding: 4 }}>
                <div style={{ width: 38, height: 26, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'var(--sage-soft)' : 'transparent', transition: 'background 220ms' }}>
                  <item.icon size={18} fill={active ? 'currentColor' : 'none'}/>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
