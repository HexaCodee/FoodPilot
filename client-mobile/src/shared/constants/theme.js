// client-mobile/src/shared/constants/theme.js
// Paleta FoodPilot — tomada directamente del index.css del cliente web
export const COLORS = {
  // ── Fondos ────────────────────────────────────────────────────────────────
  background: '#100F0C',    // fp-bg        fondo principal de la app
  surface: '#1F1A15',       // fp-surface   tarjetas, paneles
  elevated: '#2B241D',      // fp-elevated  inputs, chips
  overlay: '#3F3528',       // fp-overlay   modales, overlays
  sidebar: '#141209',       // fp-sidebar   barra de tabs

  // ── Bordes ────────────────────────────────────────────────────────────────
  border: '#4C3E2F',        // fp-border
  borderSubtle: '#3E372D',  // fp-border-subtle

  // ── Oro (acento principal) ────────────────────────────────────────────────
  primary: '#B7853C',       // fp-gold
  primaryLight: '#EDBC81',  // fp-gold-hover
  primaryDim: '#813D26',    // fp-gold-dim

  // ── Texto ─────────────────────────────────────────────────────────────────
  text: '#F3E9DD',          // fp-text
  textMuted: '#C5B7AA',     // fp-muted
  textSubtle: '#9B8D79',    // fp-subtle

  // ── Semánticos ────────────────────────────────────────────────────────────
  error: '#D96B5A',         // fp-danger
  errorDim: '#4F1F16',      // fp-danger-dim
  success: '#7CB87C',       // verde legible en oscuro
  successDim: '#2D301D',    // fp-success-dim
  warning: '#D4A843',       // ámbar

  // ── Estáticos ─────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,
};

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  gold: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
};
