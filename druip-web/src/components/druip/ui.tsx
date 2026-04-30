'use client'

import React, { useState, useEffect, CSSProperties } from 'react'
import { Icon } from './icons'

export interface Pack {
  id: string
  code: string
  faculty?: string
  tone: 'sage' | 'gold' | 'turquoise' | 'coral' | 'cream'
  thumb: string
  title: string
  pages: number
  rating: number
  seller: string
  sellerTone?: string
  price: string
  priceN?: number
  badge?: string
  badgeTone?: string
  desc?: string
  toc?: string[]
}

// Button
interface ButtonProps {
  variant?: 'primary' | 'gold' | 'secondary' | 'ghost' | 'coral' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  style?: CSSProperties
  full?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export const Button = ({ variant = 'primary', size = 'md', children, onClick, style, full, type = 'button', disabled }: ButtonProps) => {
  const base: CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, border: 'none', fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'transform 160ms cubic-bezier(.22,1,.36,1), background 220ms, box-shadow 220ms', letterSpacing: '.005em', whiteSpace: 'nowrap', opacity: disabled ? 0.5 : 1 }
  const sz = size === 'lg' ? { padding: '16px 28px', fontSize: 16 } : size === 'sm' ? { padding: '10px 18px', fontSize: 12 } : { padding: '14px 24px', fontSize: 14 }
  const variants: Record<string, CSSProperties> = {
    primary: { background: 'var(--sage)', color: '#fff', boxShadow: '0 4px 14px rgba(122,158,126,.25)' },
    gold:    { background: 'var(--gold)', color: 'var(--charcoal)', boxShadow: '0 4px 14px rgba(201,168,76,.25)' },
    secondary: { background: 'var(--cream-warm)', color: 'var(--charcoal)' },
    ghost:   { background: 'transparent', color: 'var(--charcoal)' },
    coral:   { background: 'var(--coral)', color: '#fff', boxShadow: '0 4px 14px rgba(224,136,104,.25)' },
    outline: { background: 'transparent', color: 'var(--charcoal)', boxShadow: 'inset 0 0 0 1.5px var(--charcoal)' },
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      style={{ ...base, ...sz, ...variants[variant], width: full ? '100%' : 'auto', ...style }}
      onMouseDown={e => !disabled && ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)')}
      onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)')}>
      {children}
    </button>
  )
}

// Chip
interface ChipProps {
  tone?: 'neutral' | 'sage' | 'gold' | 'turquoise' | 'coral' | 'white'
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  style?: CSSProperties
  size?: 'sm' | 'md'
}

export const Chip = ({ tone = 'neutral', children, active, onClick, style, size = 'md' }: ChipProps) => {
  const tones: Record<string, CSSProperties> = {
    neutral:   { background: 'var(--cream-warm)', color: 'var(--charcoal-soft)' },
    sage:      { background: 'var(--sage-soft)', color: 'var(--sage-deep)' },
    gold:      { background: 'var(--gold-soft)', color: 'var(--gold-deep)' },
    turquoise: { background: 'var(--turquoise-soft)', color: 'var(--turquoise-deep)' },
    coral:     { background: 'var(--coral-soft)', color: '#B05B3F' },
    white:     { background: 'var(--white)', color: 'var(--charcoal-soft)', boxShadow: 'var(--shadow-card)' },
  }
  const a: CSSProperties = active ? { background: 'var(--charcoal)', color: 'var(--cream)' } : tones[tone]
  const sz = size === 'sm' ? { padding: '4px 10px', fontSize: 11 } : { padding: '7px 13px', fontSize: 13 }
  return (
    <span onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, fontWeight: 700, cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap', transition: 'all 200ms', ...sz, ...a, ...style }}>
      {children}
    </span>
  )
}

// Avatar
interface AvatarProps { name?: string; tone?: 'sage' | 'gold' | 'turquoise' | 'coral'; size?: number }
export const Avatar = ({ name = '?', tone = 'sage', size = 40 }: AvatarProps) => {
  const tones: Record<string, [string, string]> = {
    sage:      ['var(--sage-soft)', 'var(--sage-deep)'],
    gold:      ['var(--gold-soft)', 'var(--gold-deep)'],
    turquoise: ['var(--turquoise-soft)', 'var(--turquoise-deep)'],
    coral:     ['var(--coral-soft)', '#B05B3F'],
  }
  const [bg, fg] = tones[tone] ?? tones.sage
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: size * 0.42, flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// NoteCard
interface NoteCardProps { pack: Pack; onClick?: () => void; saved?: boolean; onSave?: () => void }
export const NoteCard = ({ pack, onClick, saved, onSave }: NoteCardProps) => {
  const tones: Record<string, string> = { sage: 'var(--sage-soft)', gold: 'var(--gold-soft)', turquoise: 'var(--turquoise-soft)', coral: 'var(--coral-soft)', cream: 'var(--cream-deep)' }
  const [hover, setHover] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: 'var(--white)', borderRadius: 24, padding: 12, border: '1px solid var(--hairline)', boxShadow: hover ? 'var(--shadow-lift)' : 'var(--shadow-card)', cursor: 'pointer', transform: hover ? 'translateY(-3px)' : 'translateY(0)', transition: 'all 240ms cubic-bezier(.34,1.56,.64,1)', position: 'relative' }}>
      <div style={{ height: 124, borderRadius: 16, background: tones[pack.tone] ?? 'var(--sage-soft)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 13, color: 'var(--charcoal)', opacity: 0.7 }}>{pack.code}</span>
          {pack.badge && <Chip tone={(pack.badgeTone as ChipProps['tone']) || 'gold'} size="sm">{pack.badge}</Chip>}
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 22, lineHeight: 1.05, letterSpacing: '-.02em', color: 'var(--charcoal)' }}>{pack.thumb}</div>
        {saved && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(255,255,255,0.92)', borderRadius: 999, fontSize: 10, fontWeight: 700, color: 'var(--turquoise-deep, #2a7a7a)' }}>
            <Icon.bookmark size={10}/> Saved
          </div>
        )}
        {onSave && (
          <button onClick={e => { e.stopPropagation(); onSave() }} aria-label="save"
            style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: saved ? 'var(--coral)' : 'var(--charcoal-soft)', cursor: 'pointer' }}>
            <Icon.heart size={16} fill={saved ? 'currentColor' : 'none'}/>
          </button>
        )}
      </div>
      <div style={{ padding: '12px 4px 4px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: 'var(--charcoal)' }}>{pack.title}</div>
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{pack.pages} pages</span>
          <span>·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--gold-deep)' }}><Icon.star size={11} fill="currentColor"/> {pack.rating}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Avatar name={pack.seller} tone={(pack.sellerTone as AvatarProps['tone']) || 'sage'} size={22}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--charcoal-soft)' }}>{pack.seller.split(' ')[0]}</span>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 16, color: 'var(--charcoal)' }}>{pack.price}</span>
        </div>
      </div>
    </div>
  )
}

// IconButton
interface IconButtonProps { children: React.ReactNode; onClick?: () => void; tone?: 'cream' | 'white' | 'sage'; size?: number; ariaLabel?: string }
export const IconButton = ({ children, onClick, tone = 'cream', size = 40, ariaLabel }: IconButtonProps) => {
  const tones: Record<string, string> = { cream: 'var(--cream-warm)', white: 'var(--white)', sage: 'var(--sage-soft)' }
  return (
    <button onClick={onClick} aria-label={ariaLabel}
      style={{ width: size, height: size, borderRadius: '50%', background: tones[tone], border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--charcoal)', cursor: 'pointer', flexShrink: 0, transition: 'background 200ms' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream-deep)')}
      onMouseLeave={e => (e.currentTarget.style.background = tones[tone])}>
      {children}
    </button>
  )
}

// ListRow
interface ListRowProps { icon?: React.ReactNode; label: string; sub?: string; right?: React.ReactNode; onClick?: () => void; last?: boolean; danger?: boolean }
export const ListRow = ({ icon, label, sub, right, onClick, last, danger }: ListRowProps) => (
  <div onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: last ? 'none' : '1px solid var(--hairline)', cursor: onClick ? 'pointer' : 'default', transition: 'background 160ms' }}
    onMouseEnter={e => onClick && (e.currentTarget.style.background = 'var(--cream-warm)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
    {icon && <div style={{ width: 36, height: 36, borderRadius: 12, background: danger ? 'var(--coral-soft)' : 'var(--cream-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#B05B3F' : 'var(--charcoal-soft)' }}>{icon}</div>}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: danger ? '#B05B3F' : 'var(--charcoal)' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
    {right !== undefined ? right : <span style={{ color: 'var(--fg-muted)' }}><Icon.chevron size={18}/></span>}
  </div>
)

// Input
interface InputProps { label?: string; icon?: React.ReactNode; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; error?: string; hint?: string }
export const Input = ({ label, icon, type = 'text', value, onChange, placeholder, error, hint }: InputProps) => {
  const [focus, setFocus] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const realType = type === 'password' && showPwd ? 'text' : type
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--charcoal)', marginBottom: 6 }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', color: focus ? 'var(--sage-deep)' : 'var(--fg-muted)', display: 'flex', pointerEvents: 'none' }}>{icon}</span>}
        <input type={realType} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ width: '100%', padding: '14px 16px', paddingLeft: icon ? 46 : 16, paddingRight: type === 'password' ? 46 : 16, background: focus ? 'var(--white)' : 'var(--cream-warm)', border: `1.5px solid ${error ? 'var(--coral)' : focus ? 'var(--sage)' : 'transparent'}`, borderRadius: 16, fontFamily: 'Nunito, sans-serif', fontSize: 15, color: 'var(--charcoal)', outline: 'none', boxSizing: 'border-box', transition: 'all 200ms' }}/>
        {type === 'password' && (
          <button type="button" onClick={() => setShowPwd(s => !s)} aria-label="toggle visibility"
            style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', display: 'flex', padding: 6 }}>
            <Icon.eye size={18}/>
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--coral)', marginTop: 6, fontWeight: 600 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 6 }}>{hint}</div>}
    </div>
  )
}

// Skeleton
interface SkeletonProps { w?: string | number; h?: number; r?: number; style?: CSSProperties }
export const Skeleton = ({ w = '100%', h = 16, r = 8, style }: SkeletonProps) => (
  <div style={{ width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, var(--cream-warm) 0%, var(--sage-soft) 50%, var(--cream-warm) 100%)', backgroundSize: '200% 100%', animation: 'skel 1.4s infinite ease-in-out', ...style }}/>
)

// Toast
interface ToastProps { tone?: 'sage' | 'gold' | 'coral'; children: React.ReactNode; onClose: () => void }
export const Toast = ({ tone = 'sage', children, onClose }: ToastProps) => {
  useEffect(() => { const t = setTimeout(onClose, 2400); return () => clearTimeout(t) }, [onClose])
  const tones: Record<string, CSSProperties> = {
    sage:  { background: 'var(--sage)', color: '#fff' },
    gold:  { background: 'var(--gold)', color: 'var(--charcoal)' },
    coral: { background: 'var(--coral)', color: '#fff' },
  }
  return (
    <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 200, ...tones[tone], padding: '12px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13, boxShadow: 'var(--shadow-pop)', animation: 'toastIn 280ms cubic-bezier(.34,1.56,.64,1)', whiteSpace: 'nowrap' }}>
      {children}
    </div>
  )
}

// BlobBg
interface BlobBgProps { tone?: 'sage' | 'gold' | 'turquoise' | 'coral'; size?: number; top?: number; right?: number; opacity?: number }
export const BlobBg = ({ tone = 'sage', size = 220, top = -60, right = -60, opacity = 0.5 }: BlobBgProps) => {
  const tones: Record<string, string> = { sage: 'var(--sage-soft)', gold: 'var(--gold-soft)', turquoise: 'var(--turquoise-soft)', coral: 'var(--coral-soft)' }
  return <div style={{ position: 'absolute', top, right, width: size, height: size, borderRadius: '50%', background: tones[tone], opacity, pointerEvents: 'none', filter: 'blur(2px)' }}/>
}
