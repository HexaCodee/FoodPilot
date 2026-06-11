// client-mobile/src/features/auth/screens/LoginScreen.jsx
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView,
  Platform, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { ErrorMessage } from '../../../shared/components/Common.jsx';
import { useAuth } from '../hooks/useAuth.js';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

export const LoginScreen = ({ navigation }) => {
  const { handleLogin, loading, error, clearError } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { emailOrUsername: '', password: '' },
  });

  const onSubmit = async ({ emailOrUsername, password }) => {
    clearError();
    await handleLogin(emailOrUsername, password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps='handled'
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <MaterialIcons name='restaurant' size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.brandName}>FoodPilot</Text>
          <Text style={styles.brandTagline}>Volamos tu antojo</Text>
          <View style={styles.goldDivider} />
          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>Accede a tu cuenta para continuar</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <ErrorMessage message={error} />

          <Controller
            control={control}
            name='emailOrUsername'
            rules={{ required: 'Este campo es obligatorio' }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label='Correo o usuario'
                placeholder='correo@ejemplo.com'
                autoCapitalize='none'
                keyboardType='email-address'
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.emailOrUsername?.message}
                leftIcon={
                  <MaterialIcons name='person' size={18} color={COLORS.textSubtle} />
                }
              />
            )}
          />

          <Controller
            control={control}
            name='password'
            rules={{ required: 'La contraseña es obligatoria' }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label='Contraseña'
                placeholder='••••••••'
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
                leftIcon={
                  <MaterialIcons name='lock' size={18} color={COLORS.textSubtle} />
                }
              />
            )}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size='lg'
            style={styles.submitBtn}
          >
            Iniciar sesión
          </Button>

          <View style={styles.registerRow}>
            <Text style={styles.registerHint}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },

  // Brand
  brand: { alignItems: 'center', marginBottom: SPACING.xl },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  brandName: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 2,
  },
  brandTagline: {
    color: COLORS.textSubtle,
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 4,
  },
  goldDivider: {
    width: 48,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.4,
    marginVertical: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },

  // Form
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  forgotLink: { alignSelf: 'flex-end', marginTop: -SPACING.xs, marginBottom: SPACING.md },
  forgotText: { color: COLORS.primary, fontSize: FONT_SIZE.sm },
  submitBtn: { marginTop: SPACING.sm },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  registerHint: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  registerLink: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },
});
