// client-mobile/src/features/auth/screens/RegisterScreen.jsx
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
import { useAuth } from '../hooks/useAuth.js';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

export const RegisterScreen = ({ navigation }) => {
  const { handleRegister, loading, error, clearError } = useAuth();
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '', surname: '', username: '', email: '', phone: '', password: '', confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (values) => {
    clearError();
    const form = new FormData();
    form.append('name', values.name);
    form.append('surname', values.surname);
    form.append('username', values.username);
    form.append('email', values.email);
    form.append('phone', values.phone);
    form.append('password', values.password);

    const result = await handleRegister(form);
    if (result.ok) setSuccess(true);
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <MaterialIcons name='mark-email-read' size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.successTitle}>¡Cuenta creada!</Text>
        <Text style={styles.successText}>
          Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.
        </Text>
        <Button onPress={() => navigation.navigate('Login')} style={styles.successBtn}>
          Ir al inicio de sesión
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
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a la plataforma FoodPilot</Text>
        </View>

        <View style={styles.form}>
          <ErrorMessage message={error} />

          <View style={styles.row}>
            <Controller
              control={control}
              name='name'
              rules={{ required: 'Requerido' }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label='Nombre'
                  placeholder='Juan'
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                  containerStyle={styles.halfField}
                />
              )}
            />
            <Controller
              control={control}
              name='surname'
              rules={{ required: 'Requerido' }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label='Apellido'
                  placeholder='Pérez'
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.surname?.message}
                  containerStyle={styles.halfField}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name='username'
            rules={{
              required: 'El usuario es obligatorio',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label='Nombre de usuario'
                placeholder='juanperez99'
                autoCapitalize='none'
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.username?.message}
                leftIcon={<MaterialIcons name='alternate-email' size={18} color={COLORS.textSubtle} />}
              />
            )}
          />

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

          <Controller
            control={control}
            name='phone'
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label='Teléfono (opcional)'
                placeholder='+502 1234 5678'
                keyboardType='phone-pad'
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                leftIcon={<MaterialIcons name='phone' size={18} color={COLORS.textSubtle} />}
              />
            )}
          />

          <Controller
            control={control}
            name='password'
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label='Contraseña'
                placeholder='••••••••'
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
                leftIcon={<MaterialIcons name='lock' size={18} color={COLORS.textSubtle} />}
              />
            )}
          />

          <Controller
            control={control}
            name='confirmPassword'
            rules={{
              required: 'Confirma tu contraseña',
              validate: (v) => v === password || 'Las contraseñas no coinciden',
            }}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label='Confirmar contraseña'
                placeholder='••••••••'
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.confirmPassword?.message}
                leftIcon={<MaterialIcons name='lock-outline' size={18} color={COLORS.textSubtle} />}
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size='lg'
            style={styles.submitBtn}
          >
            Crear cuenta
          </Button>

          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  header: { marginBottom: SPACING.lg },
  backBtn: { marginBottom: SPACING.md },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  row: { flexDirection: 'row', gap: SPACING.md },
  halfField: { flex: 1 },
  submitBtn: { marginTop: SPACING.sm },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  loginHint: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  loginLink: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },

  // Success
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
  },
  successText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  successBtn: { width: '100%' },
});
