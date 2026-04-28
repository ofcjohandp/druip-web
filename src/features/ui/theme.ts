// Theme constants — single source of truth for all design tokens.
// All UI components MUST import from here. No hardcoded colors elsewhere.

export const COLORS = {
  // Primary surfaces — Duolingo dark navy
  background: '#0D1B26',       // dark navy canvas
  surface: '#152232',          // slightly lighter panel / input bg
  card: '#1C2F42',             // card background — pops against background

  // Brand — vivid orange
  primary: '#FF6B2B',          // vivid orange (hero zones, avatars, price badges)
  accent: '#FF6B2B',           // vivid orange (buttons, active states, progress)
  accentSecondary: '#58CC02',  // Duolingo green for celebrations / confetti

  // Text
  text: '#FFFFFF',             // white
  textMuted: '#8B9BB4',        // cool blue-grey
  textOnAccent: '#FFFFFF',     // text on orange buttons

  // UI
  border: '#2A3F52',           // subtle dark blue-grey border
  error: '#FF4B4B',            // error states
  success: '#58CC02',          // success states
  successSurface: '#0D2A0D',   // dark green tint for correct answer backgrounds
  errorSurface: '#2D0D0D',     // dark red tint for wrong answer backgrounds
} as const;

// TYPOGRAPHY usage: do NOT spread inside StyleSheet.create.
// Use as array styles: [TYPOGRAPHY.display, { color: COLORS.text }]
export const TYPOGRAPHY = {
  display: { fontFamily: 'Syne_800ExtraBold', fontSize: 32, lineHeight: 38 },
  heading: { fontFamily: 'Syne_800ExtraBold', fontSize: 24, lineHeight: 30 },
  subheading: { fontFamily: 'Nunito_700Bold', fontSize: 20, lineHeight: 26 },
  body: { fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  label: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 16 },
} as const;

export const RADII = {
  button: 16,
  card: 20,
  modal: 28,
} as const;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
