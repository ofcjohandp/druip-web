// Theme constants — single source of truth for all design tokens.
// All UI components MUST import from here. No hardcoded colors elsewhere.

export const COLORS = {
  // Primary surfaces
  background: '#FBF8F4',       // warm off-white/cream
  surface: '#F5F0E8',          // warmer surface
  card: '#FFFFFF',             // white cards pop against cream background

  // Brand
  primary: '#C4622D',          // deep terracotta
  accent: '#FF4D30',           // electric coral
  accentSecondary: '#FFB347',  // warm amber gold for celebrations

  // Text
  text: '#1A1110',             // warm near-black
  textMuted: '#8A7E78',        // warm grey
  textOnAccent: '#FFFFFF',     // text on accent-colored backgrounds

  // UI
  border: '#E8DDD5',           // warm-tinted border
  error: '#D32F2F',            // error states
  success: '#388E3C',          // success states
} as const;

// TYPOGRAPHY usage: do NOT spread inside StyleSheet.create.
// Use as array styles: [TYPOGRAPHY.display, { color: COLORS.text }]
export const TYPOGRAPHY = {
  display: { fontFamily: 'Syne_800ExtraBold', fontSize: 32, lineHeight: 38 },
  heading: { fontFamily: 'Syne_800ExtraBold', fontSize: 24, lineHeight: 30 },
  subheading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
} as const;

export const RADII = {
  button: 12,
  card: 16,
  modal: 24,
} as const;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
