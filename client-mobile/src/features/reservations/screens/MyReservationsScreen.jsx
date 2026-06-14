// client-mobile/src/features/reservations/screens/MyReservationsScreen.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, ScrollView,
  RefreshControl, StyleSheet, Alert, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { getReservations, createReservation, cancelReservation } from '../../../shared/api/ordersClient.js';
import { getRestaurants, getTables } from '../../../shared/api/adminClient.js';
import { StatusBadge, Badge, EmptyState, LoadingSpinner, ErrorMessage } from '../../../shared/components/Common.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Nueva Reserva Modal ───────────────────────────────────────────────────────
// Backend (order-tracking-api): POST /reservations exige { tableNumber, reservedAt (ISO,
// futuro) } y opcionalmente { tableId, restaurantId, userId }. Por eso el flujo pide
// restaurante → mesa disponible → fecha/hora (con DateTimePicker nativo).
const fmtSelectedDate = (d) =>
  d.toLocaleString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });

const defaultReservationDate = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
};

const NewReservationModal = ({ visible, onClose, onSuccess }) => {
  const user = useAuthStore((s) => s.user);
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [reservedAt, setReservedAt] = useState(null);
  const [tempDate, setTempDate] = useState(defaultReservationDate);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState('date'); // 'date' | 'time' (Android, dos pasos)
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedRestaurant(null);
      setSelectedTable(null);
      setTables([]);
      setReservedAt(null);
      setServerError('');
      getRestaurants({ isActive: true, limit: 50 })
        .then((r) => setRestaurants(r.data?.data ?? []))
        .catch(() => setRestaurants([]));
    }
  }, [visible]);

  const loadTables = async (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    setSelectedTable(null);
    setReservedAt(null);
    setLoadingTables(true);
    try {
      const res = await getTables({ restaurant: restaurantId });
      const all = res.data?.data ?? res.data ?? [];
      setTables(all.filter((t) => t.status === 'DISPONIBLE' || t.isAvailable));
    } catch {
      setTables([]);
    } finally {
      setLoadingTables(false);
    }
  };

  const openDateTimePicker = () => {
    setTempDate(reservedAt ?? defaultReservationDate());
    setPickerStep('date');
    setShowPicker(true);
  };

  const handlePickerChange = (event, selected) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed' || !selected) return;
      if (pickerStep === 'date') {
        setTempDate(selected);
        setPickerStep('time');
        setShowPicker(true);
      } else {
        const combined = new Date(tempDate);
        combined.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        setReservedAt(combined);
      }
    } else if (selected) {
      setTempDate(selected);
    }
  };

  const confirmIosPicker = () => {
    setReservedAt(tempDate);
    setShowPicker(false);
  };

  const onSubmit = async () => {
    if (!selectedRestaurant) { setServerError('Selecciona un restaurante'); return; }
    if (!selectedTable) { setServerError('Selecciona una mesa'); return; }
    if (!reservedAt) { setServerError('Selecciona la fecha y hora de la reserva'); return; }
    if (reservedAt <= new Date()) { setServerError('La fecha y hora deben ser futuras'); return; }

    setServerError('');
    setSubmitting(true);
    try {
      await createReservation({
        userId: user?.id,
        restaurantId: selectedRestaurant,
        tableId: selectedTable._id,
        tableNumber: selectedTable.tableNumber,
        reservedAt: reservedAt.toISOString(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg = Array.isArray(apiErrors) && apiErrors.length > 0
        ? apiErrors[0].msg
        : (err?.response?.data?.message ?? 'Error al crear la reserva');
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType='slide' presentationStyle='pageSheet'>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Nueva reserva</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name='close' size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps='handled'>
          <ErrorMessage message={serverError} />

          <Text style={styles.pickerLabel}>RESTAURANTE</Text>
          {restaurants.length === 0 ? (
            <Text style={styles.helperText}>Cargando restaurantes…</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerList}>
              {restaurants.map((r) => (
                <TouchableOpacity
                  key={r._id}
                  onPress={() => loadTables(r._id)}
                  style={[styles.pickerChip, selectedRestaurant === r._id && styles.pickerChipActive]}
                >
                  <Text style={[styles.pickerChipText, selectedRestaurant === r._id && styles.pickerChipTextActive]}>
                    {r.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {selectedRestaurant && (
            <>
              <Text style={styles.pickerLabel}>MESA</Text>
              {loadingTables ? (
                <Text style={styles.helperText}>Cargando mesas…</Text>
              ) : tables.length === 0 ? (
                <Text style={styles.helperText}>Este restaurante no tiene mesas disponibles.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerList}>
                  {tables.map((t) => (
                    <TouchableOpacity
                      key={t._id}
                      onPress={() => { setSelectedTable(t); setReservedAt(null); }}
                      style={[styles.pickerChip, selectedTable?._id === t._id && styles.pickerChipActive]}
                    >
                      <Text style={[styles.pickerChipText, selectedTable?._id === t._id && styles.pickerChipTextActive]}>
                        Mesa {t.tableNumber} · {t.capacity}p{t.location ? ` · ${t.location}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}

          {selectedTable && (
            <>
              <Text style={styles.pickerLabel}>FECHA Y HORA</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={openDateTimePicker}>
                <MaterialIcons name='event' size={18} color={COLORS.primary} />
                <Text style={styles.dateBtnText}>
                  {reservedAt ? fmtSelectedDate(reservedAt) : 'Seleccionar fecha y hora'}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={tempDate}
                  mode={Platform.OS === 'ios' ? 'datetime' : pickerStep}
                  minimumDate={new Date()}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handlePickerChange}
                />
              )}
              {showPicker && Platform.OS === 'ios' && (
                <Button size='sm' onPress={confirmIosPicker} style={styles.iosPickerConfirm}>
                  Listo
                </Button>
              )}
            </>
          )}

          <Button
            onPress={onSubmit}
            loading={submitting}
            size='lg'
            style={styles.modalSubmit}
          >
            Confirmar reserva
          </Button>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── ReservationCard ───────────────────────────────────────────────────────────
const ReservationCard = ({ reservation, onCancel }) => {
  const cancelledByAdmin = reservation.status === 'CANCELADA' && reservation.cancelledByAdmin;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialIcons name='event' size={18} color={COLORS.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardDate}>{fmtDate(reservation.reservedAt)}</Text>
          <Text style={styles.cardGuests}>🪑 Mesa {reservation.tableNumber ?? '—'}</Text>
        </View>
        {cancelledByAdmin
          ? <Badge label='Cancelada por restaurante' color={COLORS.errorDim} textColor={COLORS.error} />
          : <StatusBadge status={reservation.status} />}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.createdAt}>Creada: {fmtDate(reservation.createdAt)}</Text>
        {reservation.status === 'ACTIVA' && (
          <TouchableOpacity onPress={() => onCancel(reservation._id)} style={styles.cancelBtn}>
            <MaterialIcons name='cancel' size={14} color={COLORS.error} />
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export const MyReservationsScreen = () => {
  const user = useAuthStore((s) => s.user);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getReservations({ userId: user?.id, limit: 100 });
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleCancel = (id) => {
    Alert.alert(
      'Cancelar reserva',
      '¿Seguro que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try { await cancelReservation(id); load(); }
            catch { Alert.alert('Error', 'No se pudo cancelar la reserva'); }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mis reservas</Text>
          <Text style={styles.subtitle}>Gestiona tus reservaciones</Text>
        </View>
        <Button size='sm' onPress={() => setModalVisible(true)}
          leftIcon={<MaterialIcons name='add' size={18} color={COLORS.background} />}
        >
          Nueva
        </Button>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon='event-busy'
              title='Sin reservas'
              subtitle='Haz tu primera reservación tocando el botón Nueva'
            />
          }
          renderItem={({ item }) => <ReservationCard reservation={item} onCancel={handleCancel} />}
        />
      )}

      <NewReservationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => load()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  title: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 },

  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardDate: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium },
  cardGuests: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  notes: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  createdAt: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cancelText: { color: COLORS.error, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium },

  // Modal
  modal: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.text, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold },
  modalBody: { padding: SPACING.lg },
  modalSubmit: { marginTop: SPACING.md },

  pickerLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  pickerList: { marginBottom: SPACING.md },
  pickerChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  pickerChipActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  pickerChipText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  pickerChipTextActive: { color: COLORS.primaryLight, fontWeight: FONT_WEIGHT.semibold },

  helperText: { color: COLORS.textSubtle, fontSize: FONT_SIZE.sm, marginBottom: SPACING.md },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  dateBtnText: { color: COLORS.text, fontSize: FONT_SIZE.base, textTransform: 'capitalize' },
  iosPickerConfirm: { marginBottom: SPACING.md },
});
