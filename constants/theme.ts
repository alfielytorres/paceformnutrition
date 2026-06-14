export const Colors = {
  background: '#050505',
  surface: '#111111',
  surfaceRaised: '#181818',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  mutedBorder: 'rgba(255, 255, 255, 0.12)',
  accent: '#F05A28',
  accentSoft: 'rgba(240, 90, 40, 0.18)',
  accentBorder: 'rgba(240, 90, 40, 0.45)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#666666',
  white: '#FFFFFF',
  black: '#000000',

  // Meal colors
  breakfast: '#F05A28',
  lunch: '#F05A28',
  dinner: '#F05A28',
  snacks: '#F05A28',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Typography = {
  hero: { fontSize: 48, fontWeight: '700' as const, color: Colors.textPrimary },
  h1: { fontSize: 32, fontWeight: '700' as const, color: Colors.textPrimary },
  h2: { fontSize: 24, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 20, fontWeight: '600' as const, color: Colors.textPrimary },
  h4: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400' as const, color: Colors.textPrimary },
  bodyMd: { fontSize: 15, fontWeight: '400' as const, color: Colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textSecondary },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;
