// client-mobile/src/shared/components/Common.jsx
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS,
} from '../constants/theme.js';

// ── LoadingSpinner ────────────────────────────────────────────────────────────
export const LoadingSpinner = ({ size = 'large', color = COLORS.primary, style }) => (
  <View style={[styles.centered, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

// ── FullScreenLoader ──────────────────────────────────────────────────────────
export const FullScreenLoader = () => (
  <View style={styles.fullScreen}>
    <Text style={styles.brandText}>FoodPilot</Text>
    <ActivityIndicator size='large' color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
  </View>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = 'inbox', title, subtitle, children }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrap}>
      <MaterialIcons name={icon} size={36} color={COLORS.primary} />
    </View>
    {title && <Text style={styles.emptyTitle}>{title}</Text>}
    {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    {children && <View style={{ marginTop: SPACING.lg }}>{children}</View>}
  </View>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, style, goldTop = false }) => (
  <View style={[styles.card, goldTop && styles.cardGoldTop, style]}>
    {children}
  </View>
);

// ── Separator ─────────────────────────────────────────────────────────────────
export const Separator = ({ style }) => (
  <View style={[styles.separator, style]} />
);

// ── GoldDivider ───────────────────────────────────────────────────────────────
export const GoldDivider = ({ style }) => (
  <View style={[styles.goldDivider, style]} />
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color = COLORS.primary, textColor = COLORS.background }) => (
  <View style={[styles.badge, { backgroundColor: color }]}>
    <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
  </View>
);

// ── StatusBadge: para estados de pedidos y reservas ───────────────────────────
const STATUS_CONFIG = {
  PENDIENTE:  { bg: '#3D2E10', text: '#D4A843', label: 'Pendiente'  },
  ENVIADO:    { bg: '#0F2940', text: '#60A5FA', label: 'En camino'  },
  ENTREGADO:  { bg: '#1A2E1A', text: '#7CB87C', label: 'Entregado'  },
  CANCELADO:  { bg: '#2E1410', text: '#D96B5A', label: 'Cancelado'  },
  ACTIVA:     { bg: '#1A2E1A', text: '#7CB87C', label: 'Activa'     },
  CANCELADA:  { bg: '#2E1410', text: '#D96B5A', label: 'Cancelada'  },
  COMPLETADA: { bg: '#1C2840', text: '#60A5FA', label: 'Completada' },
};

export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { bg: COLORS.elevated, text: COLORS.textMuted, label: status };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

// ── SectionHeader ─────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

// ── ErrorMessage ──────────────────────────────────────────────────────────────
export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <View style={styles.errorBox}>
      <MaterialIcons name='error-outline' size={16} color={COLORS.error} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 2,
  },

  // EmptyState
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardGoldTop: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: SPACING.md,
  },

  // GoldDivider
  goldDivider: {
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.35,
    marginVertical: SPACING.md,
  },

  // Badge
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    textTransform: 'capitalize',
  },

  // SectionHeader
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },

  // ErrorMessage
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.errorDim,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    flex: 1,
  },
});
