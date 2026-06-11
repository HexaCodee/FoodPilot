// client-mobile/src/shared/components/Input.jsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../constants/theme.js';

/**
 * Input — soporta: label, error, secureTextEntry (con toggle), leftIcon, multiline
 */
export const Input = ({
  label,
  error,
  secureTextEntry = false,
  leftIcon,
  style,
  containerStyle,
  labelStyle,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}

      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        )}

        <TextInput
          placeholderTextColor={COLORS.textSubtle}
          secureTextEntry={secureTextEntry && !visible}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            secureTextEntry && styles.inputWithRightIcon,
            style,
          ]}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setVisible((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={visible ? 'visibility' : 'visibility-off'}
              size={20}
              color={COLORS.textSubtle}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorRow}>
          <MaterialIcons name='error-outline' size={13} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  leftIconContainer: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.xl + SPACING.sm,
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.md,
    padding: SPACING.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    flex: 1,
  },
});
