// client-mobile/src/shared/components/Button.jsx
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, SHADOWS } from '../constants/theme.js';

/**
 * Button — variantes: primary | secondary | outline | ghost | danger
 * Props: variant, size (sm|md|lg), loading, disabled, leftIcon, rightIcon
 */
export const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  style,
  textStyle,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size='small'
          color={variant === 'primary' ? COLORS.background : COLORS.primary}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              styles[`text_${variant}`],
              styles[`textSize_${size}`],
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: { marginRight: SPACING.sm },
  iconRight: { marginLeft: SPACING.sm },

  // ── Variantes ──────────────────────────────────────────────────────────────
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.gold,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: COLORS.transparent,
  },
  danger: {
    backgroundColor: COLORS.error,
  },

  // ── Tamaños ───────────────────────────────────────────────────────────────
  size_sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, minHeight: 36 },
  size_md: { paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg, minHeight: 48 },
  size_lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, minHeight: 56 },

  // ── Estado deshabilitado ──────────────────────────────────────────────────
  disabled: { opacity: 0.45 },

  // ── Texto por variante ────────────────────────────────────────────────────
  text: {
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'center',
  },
  text_primary: { color: COLORS.background },
  text_secondary: { color: COLORS.text },
  text_outline: { color: COLORS.primary },
  text_ghost: { color: COLORS.primary },
  text_danger: { color: COLORS.white },

  // ── Tamaño de texto ───────────────────────────────────────────────────────
  textSize_sm: { fontSize: FONT_SIZE.sm },
  textSize_md: { fontSize: FONT_SIZE.base },
  textSize_lg: { fontSize: FONT_SIZE.md },
});
