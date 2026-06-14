// client-mobile/src/features/profile/screens/ProfileScreen.jsx
import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore, getRefreshToken } from '../../../shared/store/authStore.js';
import { useNotificationStore } from '../../../shared/store/notificationStore.js';
import { updateProfile, uploadProfilePicture, logoutRequest } from '../../../shared/api/authClient.js';
import { GoldDivider, ErrorMessage } from '../../../shared/components/Common.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import { Input } from '../../../shared/components/Input.jsx';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

const ROLE_LABEL = {
  CLIENT: 'Cliente',
  RESTAURANT_ADMIN: 'Administrador de restaurante',
  PLATFORM_ADMIN: 'Administrador de plataforma',
};

const MenuRow = ({ icon, label, onPress, danger = false, rightElement }) => (
  <TouchableOpacity onPress={onPress} style={styles.menuRow} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <MaterialIcons name={icon} size={20} color={danger ? COLORS.error : COLORS.primary} />
    </View>
    <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
    {rightElement ?? <MaterialIcons name='chevron-right' size={20} color={COLORS.textSubtle} />}
  </TouchableOpacity>
);

const NOTIFICATION_OPTIONS = [
  { key: 'orderUpdates', icon: 'receipt-long', label: 'Estado de pedidos', description: 'Avisos cuando tu pedido cambia de estado' },
  { key: 'reservationReminders', icon: 'event', label: 'Recordatorios de reservas', description: 'Avisos antes de la hora de tu reserva' },
  { key: 'promotions', icon: 'local-offer', label: 'Promociones', description: 'Ofertas y novedades de restaurantes' },
];

export const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuthStore();
  const notificationPrefs = useNotificationStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [pickedImage, setPickedImage] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username ?? '',
    },
  });

  // Mantener el formulario sincronizado si el usuario cambia (ej. tras refresh)
  useEffect(() => {
    if (!editing) {
      reset({ username: user?.username ?? '' });
    }
  }, [user, editing, reset]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          await logoutRequest(refreshToken);
        } catch {
          // Si falla la revocación en el servidor, igual cerramos sesión localmente
        }
      }
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  // Elegir una foto de la galería del dispositivo
  const handlePickImage = async () => {
    setServerError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setServerError('Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0]);
    }
  };

  // Editar perfil: sube la foto (si se eligió una) y actualiza username -> actualiza el store
  const onSubmit = async (values) => {
    setServerError('');
    setSaving(true);
    try {
      if (pickedImage) {
        const extension = pickedImage.uri.split('.').pop();
        const formData = new FormData();
        formData.append('ProfilePicture', {
          uri: pickedImage.uri,
          name: `profile.${extension}`,
          type: pickedImage.mimeType ?? `image/${extension}`,
        });
        await uploadProfilePicture(formData);
      }

      const { data } = await updateProfile({ username: values.username.trim() });
      updateUser(data?.userDetails ?? { username: values.username.trim() });
      setPickedImage(null);
      setEditing(false);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        'No se pudo actualizar el perfil. Intenta de nuevo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setServerError('');
    setPickedImage(null);
    reset({ username: user?.username ?? '' });
    setEditing(false);
  };

  // Avatar: muestra la imagen recién elegida (si hay), si no la guardada (debe ser "http..."),
  // de lo contrario se usa el ícono por defecto
  const avatarUri = pickedImage?.uri
    ?? (typeof user?.profilePicture === 'string' && user.profilePicture.startsWith('http')
      ? user.profilePicture
      : null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name='person' size={48} color={COLORS.primary} />
            </View>
          )}
          <Text style={styles.username}>@{user?.username ?? '—'}</Text>
          <View style={styles.roleBadge}>
            <MaterialIcons name='verified-user' size={14} color={COLORS.primary} />
            <Text style={styles.roleText}>{ROLE_LABEL[user?.role] ?? user?.role ?? 'Usuario'}</Text>
          </View>
        </View>

        <GoldDivider style={styles.divider} />

        {editing ? (
          // ── Formulario de edición ───────────────────────────────────────────
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Editar perfil</Text>
            <View style={styles.editCard}>
              <ErrorMessage message={serverError} />

              <Controller
                control={control}
                name='username'
                rules={{
                  required: 'El nombre de usuario es obligatorio',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  maxLength: { value: 25, message: 'Máximo 25 caracteres' },
                }}
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label='Nombre de usuario'
                    placeholder='usuario123'
                    autoCapitalize='none'
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.username?.message}
                    leftIcon={<MaterialIcons name='alternate-email' size={18} color={COLORS.textSubtle} />}
                  />
                )}
              />

              <Text style={styles.fieldLabel}>Foto de perfil</Text>
              <TouchableOpacity
                onPress={handlePickImage}
                style={styles.pickImageBtn}
                activeOpacity={0.8}
              >
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.pickImagePreview} />
                ) : (
                  <View style={styles.pickImagePlaceholder}>
                    <MaterialIcons name='person' size={28} color={COLORS.primary} />
                  </View>
                )}
                <View style={styles.pickImageTextWrap}>
                  <MaterialIcons name='photo-library' size={18} color={COLORS.primary} />
                  <Text style={styles.pickImageText}>Elegir foto de la galería</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.editActions}>
                <Button
                  variant='secondary'
                  onPress={handleCancelEdit}
                  disabled={saving}
                  style={styles.editActionBtn}
                >
                  Cancelar
                </Button>
                <Button
                  onPress={handleSubmit(onSubmit)}
                  loading={saving}
                  style={styles.editActionBtn}
                >
                  Guardar
                </Button>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Actividad rápida */}
            <View style={styles.statsRow}>
              {[
                { icon: 'receipt-long', label: 'Pedidos', nav: () => navigation.navigate('Orders') },
                { icon: 'event', label: 'Reservas', nav: () => navigation.navigate('Reservations') },
                { icon: 'restaurant', label: 'Explorar', nav: () => navigation.navigate('Restaurants') },
              ].map((item) => (
                <TouchableOpacity key={item.label} onPress={item.nav} style={styles.statBtn} activeOpacity={0.8}>
                  <MaterialIcons name={item.icon} size={24} color={COLORS.primary} />
                  <Text style={styles.statLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Menú */}
            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Mi cuenta</Text>
              <View style={styles.menuCard}>
                <MenuRow
                  icon='person-outline'
                  label='Editar perfil'
                  onPress={() => setEditing(true)}
                />
                <View style={styles.menuSep} />
                <MenuRow
                  icon='lock-outline'
                  label='Cambiar contraseña'
                  onPress={() =>
                    Alert.alert(
                      'Cambiar contraseña',
                      'Para cambiar tu contraseña, cierra sesión y usa la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.'
                    )
                  }
                />
                <View style={styles.menuSep} />
                <MenuRow
                  icon='notifications-none'
                  label='Notificaciones'
                  onPress={() => setShowNotifications((prev) => !prev)}
                  rightElement={
                    <MaterialIcons
                      name={showNotifications ? 'expand-less' : 'expand-more'}
                      size={20}
                      color={COLORS.textSubtle}
                    />
                  }
                />
              </View>
              {showNotifications && (
                <View style={styles.notifCard}>
                  {NOTIFICATION_OPTIONS.map((opt, index) => (
                    <View key={opt.key}>
                      {index > 0 && <View style={styles.menuSep} />}
                      <View style={styles.notifRow}>
                        <View style={styles.menuIcon}>
                          <MaterialIcons name={opt.icon} size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.notifTextWrap}>
                          <Text style={styles.menuLabel}>{opt.label}</Text>
                          <Text style={styles.notifDescription}>{opt.description}</Text>
                        </View>
                        <Switch
                          value={notificationPrefs[opt.key]}
                          onValueChange={(value) => notificationPrefs.setPreference(opt.key, value)}
                          trackColor={{ false: COLORS.border, true: COLORS.primaryDim }}
                          thumbColor={notificationPrefs[opt.key] ? COLORS.primary : COLORS.textSubtle}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>Soporte</Text>
              <View style={styles.menuCard}>
                <MenuRow
                  icon='help-outline'
                  label='Ayuda y soporte'
                  onPress={() =>
                    Alert.alert(
                      'Ayuda y soporte',
                      '¿Tienes alguna duda o problema? Escríbenos a soporte@foodpilot.com y te responderemos en menos de 24 horas.\n\n' +
                      'Preguntas frecuentes:\n' +
                      '• ¿Cómo cancelo un pedido? Ve a "Mis pedidos" y selecciona la opción de cancelar antes de que el restaurante lo confirme.\n' +
                      '• ¿Cómo cambio mi contraseña? Cierra sesión y usa "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.\n' +
                      '• ¿Cómo hago una reserva? Entra al restaurante que te interese y selecciona "Reservar mesa".'
                    )
                  }
                />
                <View style={styles.menuSep} />
                <MenuRow
                  icon='info-outline'
                  label='Acerca de FoodPilot'
                  onPress={() =>
                    Alert.alert(
                      'Acerca de FoodPilot',
                      'FoodPilot v1.0.0\n\nTu app para descubrir restaurantes, hacer pedidos y reservar mesas, todo en un solo lugar.\n\n© 2026 FoodPilot'
                    )
                  }
                />
              </View>
            </View>

            <View style={[styles.menuSection, styles.lastSection]}>
              <View style={styles.menuCard}>
                <MenuRow
                  icon='logout'
                  label='Cerrar sesión'
                  onPress={handleLogout}
                  danger
                  rightElement={
                    loggingOut
                      ? <MaterialIcons name='hourglass-empty' size={16} color={COLORS.error} />
                      : undefined
                  }
                />
              </View>
            </View>
          </>
        )}

        {/* App version */}
        <Text style={styles.version}>FoodPilot · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 2,
    borderColor: COLORS.primary + '60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.md,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryDim,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  roleText: { color: COLORS.primaryLight, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium },

  divider: { marginHorizontal: SPACING.lg },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  statBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statLabel: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },

  // Menu
  menuSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md, marginTop: SPACING.md },
  lastSection: { marginBottom: SPACING.xl },
  menuSectionTitle: {
    color: COLORS.textSubtle,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: COLORS.errorDim },
  menuLabel: { flex: 1, color: COLORS.text, fontSize: FONT_SIZE.base },
  menuLabelDanger: { color: COLORS.error },

  // Panel de preferencias de notificaciones
  notifCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  notifTextWrap: { flex: 1 },
  notifDescription: {
    color: COLORS.textSubtle,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  menuSep: { height: 1, backgroundColor: COLORS.borderSubtle, marginLeft: SPACING.md + 36 + SPACING.md },

  // Edit form card
  editCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  editActionBtn: { flex: 1 },

  // Picker de imagen de perfil
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.sm,
  },
  pickImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pickImagePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  pickImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickImageTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pickImageText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
  },

  version: {
    color: COLORS.textSubtle,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    paddingBottom: SPACING.xl,
  },
});
