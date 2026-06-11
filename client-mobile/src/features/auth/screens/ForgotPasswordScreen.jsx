// client-mobile/src/features/auth/screens/ForgotPasswordScreen.jsx
import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../../../shared/components/Input.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { ErrorMessage } from '../../../shared/components/Common.jsx';
import { forgotPassword } from '../../../shared/api/authClient.js';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }) => {
    setServerError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      // Por seguridad, el backend devuelve 200 aunque el correo no exista.
      // Un error real aquí sería 500 o problemas de red.
      const msg =
        err?.response?.data?.message ??
        'Error al conectar con el servidor. Intenta de nuevo.';
      setServerError(msg);
    }
  };

  if (sent) {
    return (
      <View style={styles.sentContainer}>
        <View style={styles.sentIcon}>
          <MaterialIcons name='send' size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.sentTitle}>Instrucciones enviadas</Text>
        <Text style={styles.sentText}>
          Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
          Revisa también tu carpeta de spam.
        </Text>
        <Button onPress={() => navigation.navigate('Login')} style={styles.sentBtn}>
          Volver al inicio de sesión
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name='arrow-back' size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </Text>
        </View>

        <View style={styles.form}>
          <ErrorMessage message={serverError} />

          <Controller
            control={control}
            name='email'
            rules={{
              required: 'El correo es obligatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label='Correo electrónico'
                placeholder='correo@ejemplo.com'
                autoCapitalize='none'
                keyboardType='email-address'
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
                leftIcon={<MaterialIcons name='email' size={18} color={COLORS.textSubtle} />}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            size='lg'
            style={styles.submitBtn}
          >
            Enviar instrucciones
          </Button>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backToLogin}
          >
            <Text style={styles.backToLoginText}>← Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
  },
  header: { marginBottom: SPACING.lg },
  backBtn: { marginBottom: SPACING.md },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  submitBtn: { marginTop: SPACING.sm },
  backToLogin: { alignItems: 'center', marginTop: SPACING.lg },
  backToLoginText: { color: COLORS.primary, fontSize: FONT_SIZE.sm },

  // Sent state
  sentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  sentIcon: {
    width: 88,
    height: 88,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  sentTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  sentText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  sentBtn: { width: '100%' },
});
