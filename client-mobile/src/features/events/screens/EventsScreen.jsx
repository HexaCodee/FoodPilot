// client-mobile/src/features/events/screens/EventsScreen.jsx
import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, Modal, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getEvents } from '../../../shared/api/eventsClient.js';
import { EmptyState, LoadingSpinner } from '../../../shared/components/Common.jsx';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }) : null;

const fmtPrice = (price) =>
  price > 0 ? `$${Number(price).toFixed(2)}` : 'Gratis';

// El backend (event.model.js) guarda { restaurant: { id, name, category }, date,
// startTime, endTime, maxCapacity, currentReservations, price, status, resources }.
// No existen los campos `restaurantName`, `title` ni `location`.
const EventCard = ({ event, onPress }) => {
  const spotsLeft = event.maxCapacity != null
    ? Math.max(event.maxCapacity - (event.currentReservations ?? 0), 0)
    : null;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>{event.name ?? 'Evento'}</Text>
          {event.price != null && <Text style={styles.cardPrice}>{fmtPrice(event.price)}</Text>}
        </View>
        {event.restaurant?.name && (
          <View style={styles.restaurantRow}>
            <MaterialIcons name='restaurant' size={12} color={COLORS.textSubtle} />
            <Text style={styles.restaurantName}>{event.restaurant.name}</Text>
          </View>
        )}
        {event.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>{event.description}</Text>
        )}
        <View style={styles.cardFooter}>
          {event.date && (
            <View style={styles.footerItem}>
              <MaterialIcons name='event' size={13} color={COLORS.primary} />
              <Text style={styles.footerText}>{fmtDate(event.date)}</Text>
            </View>
          )}
          {(event.startTime || event.endTime) && (
            <View style={styles.footerItem}>
              <MaterialIcons name='schedule' size={13} color={COLORS.textSubtle} />
              <Text style={styles.footerText}>
                {[event.startTime, event.endTime].filter(Boolean).join(' - ')}
              </Text>
            </View>
          )}
          {spotsLeft != null && (
            <View style={styles.footerItem}>
              <MaterialIcons name='groups' size={13} color={COLORS.textSubtle} />
              <Text style={styles.footerText}>
                {spotsLeft > 0 ? `${spotsLeft} cupos disponibles` : 'Agotado'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Detalle Modal ─────────────────────────────────────────────────────────────
const EventDetailModal = ({ event, visible, onClose }) => {
  if (!event) return null;
  const spotsLeft = event.maxCapacity != null
    ? Math.max(event.maxCapacity - (event.currentReservations ?? 0), 0)
    : null;

  return (
    <Modal visible={visible} animationType='slide' presentationStyle='pageSheet'>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name='close' size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.modalTitle} numberOfLines={1}>{event.name ?? 'Evento'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalBody}>
          <View style={styles.detailIconWrap}>
            <MaterialIcons name='celebration' size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.detailName}>{event.name ?? 'Evento'}</Text>

          {event.price != null && (
            <View style={styles.detailRow}>
              <MaterialIcons name='attach-money' size={18} color={COLORS.primary} />
              <Text style={styles.detailValue}>{fmtPrice(event.price)}</Text>
            </View>
          )}
          {event.restaurant?.name && (
            <View style={styles.detailRow}>
              <MaterialIcons name='restaurant' size={18} color={COLORS.primary} />
              <Text style={styles.detailValue}>
                {event.restaurant.name}
                {event.restaurant.category ? ` · ${event.restaurant.category}` : ''}
              </Text>
            </View>
          )}
          {event.date && (
            <View style={styles.detailRow}>
              <MaterialIcons name='event' size={18} color={COLORS.primary} />
              <Text style={styles.detailValue}>{fmtDate(event.date)}</Text>
            </View>
          )}
          {(event.startTime || event.endTime) && (
            <View style={styles.detailRow}>
              <MaterialIcons name='schedule' size={18} color={COLORS.primary} />
              <Text style={styles.detailValue}>
                {[event.startTime, event.endTime].filter(Boolean).join(' - ')}
              </Text>
            </View>
          )}
          {spotsLeft != null && (
            <View style={styles.detailRow}>
              <MaterialIcons name='groups' size={18} color={COLORS.primary} />
              <Text style={styles.detailValue}>
                {spotsLeft > 0 ? `${spotsLeft} cupos disponibles de ${event.maxCapacity}` : 'Sin cupos disponibles'}
              </Text>
            </View>
          )}
          {event.description && (
            <View style={styles.detailDescBox}>
              <Text style={styles.detailDescLabel}>DESCRIPCIÓN</Text>
              <Text style={styles.detailDesc}>{event.description}</Text>
            </View>
          )}
          {Array.isArray(event.resources) && event.resources.length > 0 && (
            <View style={[styles.detailDescBox, styles.resourcesBox]}>
              <Text style={styles.detailDescLabel}>INCLUYE</Text>
              {event.resources.map((res, idx) => (
                <View key={idx} style={styles.resourceRow}>
                  <MaterialIcons name='check-circle' size={14} color={COLORS.primary} />
                  <Text style={styles.resourceText}>
                    {res.quantity > 1 ? `${res.quantity}x ` : ''}{res.resourceType}
                    {res.description ? ` — ${res.description}` : ''}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export const EventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getEvents({ limit: 50 });
      const list = res.data?.data ?? res.data ?? [];
      // El event-service no filtra por status en el backend; igual que en la web
      // (ClientEventsPage), solo mostramos eventos activos al cliente.
      setEvents(Array.isArray(list) ? list.filter((e) => e.status === 'ACTIVO') : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Eventos</Text>
        <Text style={styles.subtitle}>Descubre lo que está pasando</Text>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id ?? String(Math.random())}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon='event-note'
              title='Sin eventos'
              subtitle='No hay eventos próximos por ahora. Vuelve a revisar más tarde.'
            />
          }
          renderItem={({ item }) => (
            <EventCard event={item} onPress={() => setSelected(item)} />
          )}
        />
      )}

      <EventDetailModal
        event={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.md },
  title: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 },

  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  cardAccent: { width: 4, backgroundColor: COLORS.primary },
  cardBody: { flex: 1, padding: SPACING.md },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm, marginBottom: 4 },
  cardName: { flex: 1, color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold },
  cardPrice: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  restaurantName: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs },
  cardDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18, marginBottom: SPACING.sm },
  cardFooter: { gap: 4 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs },

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
  modalTitle: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, flex: 1, textAlign: 'center', marginHorizontal: SPACING.sm },
  modalBody: { padding: SPACING.lg, alignItems: 'center' },
  detailIconWrap: {
    width: 96,
    height: 96,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  detailName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    alignSelf: 'stretch',
  },
  detailValue: { color: COLORS.textMuted, fontSize: FONT_SIZE.base, flex: 1 },
  detailDescBox: {
    backgroundColor: COLORS.elevated,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignSelf: 'stretch',
    marginTop: SPACING.sm,
  },
  detailDescLabel: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: SPACING.sm },
  detailDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 22 },
  resourcesBox: { gap: SPACING.xs },
  resourceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 2 },
  resourceText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, flex: 1 },
});
