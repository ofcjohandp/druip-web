'use client'

import React from 'react'

export interface IconProps {
  size?: number
  sw?: number
  fill?: string
}

const I = ({ d, size = 20, sw = 1.75, fill = 'none' }: IconProps & { d: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)

export const Icon = {
  home:     (p: IconProps = {}) => <I {...p} d={<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/>}/>,
  browse:   (p: IconProps = {}) => <I {...p} d={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2"/></>}/>,
  sell:     (p: IconProps = {}) => <I {...p} d={<path d="M12 5v14M5 12h14"/>}/>,
  earn:     (p: IconProps = {}) => <I {...p} d={<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>}/>,
  user:     (p: IconProps = {}) => <I {...p} d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>}/>,
  search:   (p: IconProps = {}) => <I {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>}/>,
  bell:     (p: IconProps = {}) => <I {...p} d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>}/>,
  flame:    (p: IconProps = {}) => <I {...p} d={<path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c2 0 3-1 3-3 0-1.5-1-2-1-4 2 0 4 2 4 5a6 6 0 0 1-12 0c0-3 2-5.5 4-7 0 2 1 3 1 4z"/>}/>,
  heart:    (p: IconProps = {}) => <I {...p} d={<path d="M19 14c1.5-1.5 3-3.5 3-6a4 4 0 0 0-7.5-2A4 4 0 0 0 7 6c0 2.5 1.5 4.5 3 6l4 4z"/>}/>,
  arrow:    (p: IconProps = {}) => <I {...p} d={<><path d="M5 12h14M13 5l7 7-7 7"/></>}/>,
  chevron:  (p: IconProps = {}) => <I {...p} d={<path d="m9 6 6 6-6 6"/>}/>,
  back:     (p: IconProps = {}) => <I {...p} d={<><path d="M19 12H5M12 19l-7-7 7-7"/></>}/>,
  star:     (p: IconProps = {}) => <I {...p} d={<path d="m12 2 3 7 7 .6-5.5 4.7 1.7 7-6.2-3.7L5.8 21l1.7-6.7L2 9.6 9 9z"/>}/>,
  check:    (p: IconProps = {}) => <I {...p} d={<path d="M20 6 9 17l-5-5"/>}/>,
  card:     (p: IconProps = {}) => <I {...p} d={<><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/></>}/>,
  shield:   (p: IconProps = {}) => <I {...p} d={<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/>}/>,
  upload:   (p: IconProps = {}) => <I {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></>}/>,
  doc:      (p: IconProps = {}) => <I {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></>}/>,
  logout:   (p: IconProps = {}) => <I {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>}/>,
  close:    (p: IconProps = {}) => <I {...p} d={<path d="M18 6 6 18M6 6l12 12"/>}/>,
  edit:     (p: IconProps = {}) => <I {...p} d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}/>,
  trash:    (p: IconProps = {}) => <I {...p} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></>}/>,
  mail:     (p: IconProps = {}) => <I {...p} d={<><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></>}/>,
  lock:     (p: IconProps = {}) => <I {...p} d={<><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>}/>,
  eye:      (p: IconProps = {}) => <I {...p} d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/></>}/>,
  paper:    (p: IconProps = {}) => <I {...p} d={<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>}/>,
  zap:      (p: IconProps = {}) => <I {...p} d={<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>}/>,
  sparkle:  (p: IconProps = {}) => <I {...p} d={<path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M5.6 18.4l3.5-3.5M14.9 9.1l3.5-3.5"/>}/>,
  download: (p: IconProps = {}) => <I {...p} d={<><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>}/>,
  trending: (p: IconProps = {}) => <I {...p} d={<><path d="m3 17 6-6 4 4 8-8M14 7h7v7"/></>}/>,
  more:     (p: IconProps = {}) => <I {...p} d={<><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>}/>,
  filter:   (p: IconProps = {}) => <I {...p} d={<path d="M3 6h18M7 12h10M11 18h2"/>}/>,
  bookmark: (p: IconProps = {}) => <I {...p} d={<path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-4z"/>}/>,
  help:     (p: IconProps = {}) => <I {...p} d={<><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/></>}/>,
  settings: (p: IconProps = {}) => <I {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>}/>,
  google:   (p: IconProps = {}) => <I {...p} sw={2} d={<path d="M21 11.5h-9v3h5.2c-.5 2.4-2.6 4-5.2 4a5.5 5.5 0 1 1 3.5-9.7l2.1-2.1A8.5 8.5 0 1 0 20.5 13c0-.5 0-1-.1-1.5z"/>}/>,
  whatsapp: (p: IconProps = {}) => <I {...p} d={<><path d="M21 12a9 9 0 1 1-3.5-7.1L21 4l-1 3.6A9 9 0 0 1 21 12z"/><path d="M9 9c0 4 2 6 6 6l1-2-2-1-1 1c-1-.5-1.5-1-2-2l1-1-1-2z"/></>}/>,
}
