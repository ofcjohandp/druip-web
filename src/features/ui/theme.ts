// Theme constants — D-10 through D-14 from CONTEXT.md
// All UI components MUST import from here. No hardcoded colors elsewhere.

export const COLORS = {
  background: '#FFFFFF',       // D-10: white background
  surface: '#FAFAF8',          // D-10: warm off-white for cards
  accent: '#FF6B6B',           // D-11: soft coral/peach
  text: '#1A1A1A',             // primary text
  textMuted: '#9E9E9E',        // secondary/muted text
  textOnAccent: '#FFFFFF',     // text on accent-colored backgrounds
  border: '#EBEBEB',           // subtle borders
  error: '#D32F2F',            // error/incorrect states
  success: '#388E3C',          // success/correct states
} as const;

export const RADII = {
  button: 12,                  // D-12: 12px for buttons
  card: 16,                    // D-12: 16px for cards
  modal: 24,                   // D-12: 24px for bottom sheets/modals
} as const;

export const SPACING = {
  xs: 8,                       // tight spacing
  sm: 12,                      // small gaps
  md: 16,                      // D-14: minimum padding inside cards
  lg: 24,                      // D-14: between major sections
  xl: 32,                      // large gaps
} as const;

// D-13: System fonts — SF Pro on iOS, Roboto on Android. No custom font import for MVP.
// React Native uses system fonts by default — no fontFamily needed.
