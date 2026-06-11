// client-mobile/src/features/restaurants/screens/RestaurantDetailScreen.jsx
import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Modal, TextInput, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../shared/store/authStore.js';
import {
  getRestaurantById, getMenus, getPromotions, getRatings, createRating, deleteRating,
} from '../../../shared/api/adminClient.js';
import { createOrder } from '../../../shared/api/ordersClient.js';
import { getEvents } from '../../../shared/api/eventsClient.js';
import { EmptyState, LoadingSpinner, ErrorMessage, Badge } from '../../../shared/components/Common.jsx';
import { Button } from '../../../shared/components/Button.jsx';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

const TABS = ['Menú', 'Eventos', 'Promociones', 'Reseñas', 'Info'];

const fmtShortDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

// ── Modal de valoración ────────────────────────────────────────────────────────
// POST /ratings (restaurant-admin) — requiere { restaurantId, userId, rating } y
// recalcula el promedio del restaurante automáticamente.
const RatingModal = ({ visible, onClose, onSubmit, submitting, error, existing }) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (visible) {
      setStars(existing?.rating ?? 0);
      setComment(existing?.comment ?? '');
    }
  }, [visible, existing]);

  return (
    <Modal visible={visible} animationType='fade' transparent>
      <View style={styles.ratingOverlay}>
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>
            {existing ? 'Edita tu calificación' : 'Califica tu experiencia'}
          </Text>
          <ErrorMessage message={error} />
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setStars(n)} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                <MaterialIcons
                  name={n <= stars ? 'star' : 'star-border'}
                  size={36}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.ratingInput}
            placeholder='Comentario (opcional)'
            placeholderTextColor={COLORS.textSubtle}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
          <View style={styles.ratingActions}>
            <Button variant='secondary' onPress={onClose} style={styles.ratingActionBtn} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              onPress={() => onSubmit({ rating: stars, comment })}
              loading={submitting}
              disabled={stars === 0}
              style={styles.ratingActionBtn}
            >
              {existing ? 'Actualizar' : 'Enviar'}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MenuItemCard = ({ item, onOrder }) => (
  <View style={styles.menuCard}>
    <View style={styles.menuInfo}>
      <Text style={styles.menuName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.menuDesc} numberOfLines={2}>{item.description}</Text>
      )}
      <Text style={styles.menuPrice}>
        {item.price != null ? `$${Number(item.price).toFixed(2)}` : 'Consultar'}
      </Text>
    </View>
    <Button size='sm' onPress={() => onOrder(item)} style={styles.orderBtn}>
      Pedir
    </Button>
  </View>
);

export const RestaurantDetailScreen = ({ route, navigation }) => {
  const { id, name } = route.params ?? {};
  const user = useAuthStore((s) => s.user);

  const [tab, setTab] = useState('Menú');
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [events, setEvents] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [deletingRating, setDeletingRating] = useState(false);

  const load = async () => {
    try {
      const [restRes, menuRes, eventsRes, promoRes, ratingsRes] = await Promise.allSettled([
        getRestaurantById(id),
        getMenus({ restaurant: id }),
        getEvents({ restaurantId: id }),
        getPromotions({ restaurantId: id }),
        getRatings({ restaurantId: id }),
      ]);
      // GET /restaurants/:id responde { success, data: {...restaurante} }
      setRestaurant(restRes.value?.data?.data ?? null);
      setMenu(menuRes.value?.data?.data ?? menuRes.value?.data ?? []);
      // El event-service no filtra por restaurante (devuelve TODOS los eventos),
      // así que filtramos en el cliente por restaurant.id y solo activos.
      const allEvents = eventsRes.value?.data?.data ?? eventsRes.value?.data ?? [];
      setEvents(
        Array.isArray(allEvents)
          ? allEvents.filter((e) => e.restaurant?.id === id && e.status === 'ACTIVO')
          : []
      );
      setPromotions(promoRes.value?.data?.data ?? promoRes.value?.data ?? []);
      setRatings(ratingsRes.value?.data?.data ?? ratingsRes.value?.data ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const myRating = ratings.find((r) => r.userId === user?.id) ?? null;
  const othersRatings = ratings.filter((r) => r.userId !== user?.id);

  const handleOrder = async (item) => {
    if (!user?.id) return;
    setOrdering(true);
    try {
      await createOrder({
        customerName: user.username ?? 'Cliente',
        product: item.name,
        quantity: 1,
        price: item.price ?? 0,
        userId: user.id,
        restaurantId: id,
      });
      // Pequeña confirmación visual — en una app real usaría un modal/toast nativo
      navigation.navigate('Orders');
    } catch {
      // manejar error
    } finally {
      setOrdering(false);
    }
  };

  const handleRateSubmit = async ({ rating, comment }) => {
    if (!user?.id) return;
    setSubmittingRating(true);
    setRatingError('');
    try {
      // POST /ratings hace upsert: si ya existe una valoración del usuario para
      // este restaurante, la actualiza en lugar de crear una nueva.
      await createRating({
        restaurantId: id,
        userId: user.id,
        userName: user.username,
        rating,
        comment: comment?.trim() || undefined,
      });
      setRatingModalVisible(false);
      load();
    } catch (err) {
      setRatingError(err?.response?.data?.message ?? 'No se pudo enviar tu valoración. Intenta de nuevo.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDeleteRating = () => {
    if (!myRating) return;
    Alert.alert(
      'Eliminar calificación',
      '¿Seguro que deseas eliminar tu calificación de este restaurante?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeletingRating(true);
            try {
              await deleteRating(myRating._id);
              load();
            } catch {
              // ignorar — el usuario puede reintentar
            } finally {
              setDeletingRating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.primary} />
      }
    >
      {/* Hero info */}
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <MaterialIcons name='restaurant' size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.heroName}>{restaurant?.name ?? name}</Text>
        <Text style={styles.heroCategory}>{restaurant?.category}</Text>

        <View style={styles.heroMeta}>
          {restaurant?.rating > 0 && (
            <View style={styles.metaChip}>
              <MaterialIcons name='star' size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>{Number(restaurant.rating).toFixed(1)}</Text>
            </View>
          )}
          {restaurant?.address && (
            <View style={styles.metaChip}>
              <MaterialIcons name='location-on' size={14} color={COLORS.textSubtle} />
              <Text style={styles.metaText} numberOfLines={1}>{restaurant.address}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.heroActions}>
          <Button
            variant='outline'
            size='sm'
            onPress={() => navigation.navigate('Reservations')}
            leftIcon={<MaterialIcons name='event' size={16} color={COLORS.primary} />}
          >
            Reservar
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onPress={() => setRatingModalVisible(true)}
            leftIcon={<MaterialIcons name='star-outline' size={16} color={COLORS.primary} />}
          >
            {myRating ? 'Editar valoración' : 'Valorar'}
          </Button>
        </View>
      </View>

      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleRateSubmit}
        submitting={submittingRating}
        error={ratingError}
        existing={myRating}
      />

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {tab === 'Menú' && (
          menu.length === 0 ? (
            <EmptyState icon='restaurant-menu' title='Sin ítems' subtitle='Este restaurante no ha publicado su menú aún' />
          ) : (
            menu.map((item) => (
              <MenuItemCard key={item._id} item={item} onOrder={handleOrder} />
            ))
          )
        )}

        {tab === 'Eventos' && (
          events.length === 0 ? (
            <EmptyState icon='event' title='Sin eventos' subtitle='No hay eventos próximos en este restaurante' />
          ) : (
            events.map((ev) => {
              const spotsLeft = ev.maxCapacity != null
                ? Math.max(ev.maxCapacity - (ev.currentReservations ?? 0), 0)
                : null;
              return (
                <View key={ev._id} style={styles.eventCard}>
                  <View style={styles.eventTopRow}>
                    <Text style={styles.eventName}>{ev.name}</Text>
                    {ev.price != null && (
                      <Text style={styles.eventPrice}>{ev.price > 0 ? `$${Number(ev.price).toFixed(2)}` : 'Gratis'}</Text>
                    )}
                  </View>
                  {ev.description && <Text style={styles.eventDesc}>{ev.description}</Text>}
                  <View style={styles.eventFooter}>
                    {ev.date && <Text style={styles.eventDate}>📅 {new Date(ev.date).toLocaleDateString('es-ES')}</Text>}
                    {(ev.startTime || ev.endTime) && (
                      <Text style={styles.eventDate}>🕒 {[ev.startTime, ev.endTime].filter(Boolean).join(' - ')}</Text>
                    )}
                    {spotsLeft != null && (
                      <Text style={styles.eventDate}>{spotsLeft > 0 ? `${spotsLeft} cupos disponibles` : 'Agotado'}</Text>
                    )}
                  </View>
                </View>
              );
            })
          )
        )}

        {tab === 'Promociones' && (
          promotions.length === 0 ? (
            <EmptyState icon='local-offer' title='Sin promociones' subtitle='No hay promociones activas en este momento' />
          ) : (
            promotions.map((p) => {
              const expired = p.validTo && new Date(p.validTo) < new Date();
              return (
                <View key={p._id} style={[styles.promoCard, expired && styles.promoCardExpired]}>
                  <View style={styles.promoHeader}>
                    <MaterialIcons name='local-offer' size={18} color={COLORS.primary} />
                    <Text style={styles.promoTitle}>{p.title}</Text>
                    {expired && <Badge label='Expirada' color={COLORS.errorDim} textColor={COLORS.error} />}
                  </View>
                  {p.description && <Text style={styles.promoDesc}>{p.description}</Text>}
                  {!!p.discount && (
                    <Text style={styles.promoDiscount}>{p.discount}% de descuento</Text>
                  )}
                  {p.code && (
                    <View style={styles.promoCodeRow}>
                      <Text style={styles.promoCodeLabel}>Código:</Text>
                      <Text style={styles.promoCode}>{p.code}</Text>
                    </View>
                  )}
                  {(p.validFrom || p.validTo) && (
                    <Text style={styles.promoValidity}>
                      {p.validFrom && `Desde ${fmtShortDate(p.validFrom)}`}
                      {p.validFrom && p.validTo && ' · '}
                      {p.validTo && `Hasta ${fmtShortDate(p.validTo)}`}
                    </Text>
                  )}
                </View>
              );
            })
          )
        )}

        {tab === 'Reseñas' && (
          <View>
            {/* Tu reseña */}
            <View style={styles.myRatingCard}>
              <Text style={styles.myRatingTitle}>
                {myRating ? 'Tu calificación' : 'Aún no has calificado este restaurante'}
              </Text>
              {myRating ? (
                <>
                  <View style={styles.myRatingStars}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <MaterialIcons
                        key={n}
                        name={n <= myRating.rating ? 'star' : 'star-border'}
                        size={20}
                        color={COLORS.primary}
                      />
                    ))}
                  </View>
                  {myRating.comment && <Text style={styles.myRatingComment}>{myRating.comment}</Text>}
                  <View style={styles.myRatingActions}>
                    <Button
                      variant='secondary'
                      size='sm'
                      onPress={() => setRatingModalVisible(true)}
                      style={styles.myRatingActionBtn}
                    >
                      Editar
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onPress={handleDeleteRating}
                      loading={deletingRating}
                      style={styles.myRatingActionBtn}
                      textStyle={{ color: COLORS.error }}
                    >
                      Eliminar
                    </Button>
                  </View>
                </>
              ) : (
                <Button size='sm' onPress={() => setRatingModalVisible(true)} style={styles.myRatingActionBtn}>
                  Calificar
                </Button>
              )}
            </View>

            {/* Reseñas de otros usuarios */}
            <Text style={styles.sectionLabel}>
              Reseñas de otros usuarios {othersRatings.length > 0 ? `(${othersRatings.length})` : ''}
            </Text>
            {othersRatings.length === 0 ? (
              <EmptyState icon='star-outline' title='Sin reseñas' subtitle='Aún no hay reseñas de otros usuarios' />
            ) : (
              othersRatings.map((rt) => (
                <View key={rt._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.myRatingStars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <MaterialIcons
                          key={n}
                          name={n <= rt.rating ? 'star' : 'star-border'}
                          size={14}
                          color={COLORS.primary}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewDate}>{fmtShortDate(rt.createdAt)}</Text>
                  </View>
                  {rt.comment && <Text style={styles.myRatingComment}>{rt.comment}</Text>}
                  <Text style={styles.reviewAuthor}>{rt.userName || 'Usuario anónimo'}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {tab === 'Info' && restaurant && (
          <View style={styles.infoSection}>
            {[
              { icon: 'location-on', label: 'Dirección', value: restaurant.address },
              { icon: 'phone', label: 'Teléfono', value: restaurant.phone },
              { icon: 'access-time', label: 'Horario', value: restaurant.schedule ?? restaurant.hours },
              { icon: 'info', label: 'Descripción', value: restaurant.description },
            ]
              .filter((f) => f.value)
              .map((f) => (
                <View key={f.label} style={styles.infoRow}>
                  <MaterialIcons name={f.icon} size={18} color={COLORS.primary} style={styles.infoIcon} />
                  <View style={styles.infoTextWrap}>
                    <Text style={styles.infoLabel}>{f.label}</Text>
                    <Text style={styles.infoValue}>{f.value}</Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Hero
  hero: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primaryDim,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  heroCategory: {
    color: COLORS.textSubtle,
    fontSize: FONT_SIZE.sm,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  heroMeta: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, flexWrap: 'wrap', justifyContent: 'center' },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  metaText: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  heroActions: { flexDirection: 'row', gap: SPACING.md },

  // Tabs
  tabsWrap: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabs: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  tabTextActive: { color: COLORS.primaryLight, fontWeight: FONT_WEIGHT.semibold },

  // Tab content
  tabContent: { padding: SPACING.lg },

  // Menu
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  menuInfo: { flex: 1 },
  menuName: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium },
  menuDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: 2 },
  menuPrice: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, marginTop: 4 },
  orderBtn: { minWidth: 64 },

  // Events
  eventCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  eventTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  eventName: { flex: 1, color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold },
  eventPrice: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold },
  eventDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 4 },
  eventFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginTop: SPACING.sm },
  eventDate: { color: COLORS.primary, fontSize: FONT_SIZE.xs },

  // Promotions
  promoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  promoCardExpired: { opacity: 0.6 },
  promoHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  promoTitle: { flex: 1, color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium },
  promoDesc: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  promoDiscount: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, marginTop: SPACING.sm },
  promoCodeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  promoCodeLabel: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs },
  promoCode: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 1,
    backgroundColor: COLORS.elevated,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  promoValidity: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs, marginTop: SPACING.sm },

  // Reseñas
  myRatingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  myRatingTitle: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, marginBottom: SPACING.sm },
  myRatingStars: { flexDirection: 'row', gap: 2, marginBottom: SPACING.xs },
  myRatingComment: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm },
  myRatingActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  myRatingActionBtn: { flex: 1 },
  sectionLabel: {
    color: COLORS.textSubtle,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  reviewDate: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs },
  reviewAuthor: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium, marginTop: SPACING.xs },

  // Info
  infoSection: { gap: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  infoIcon: { marginTop: 2 },
  infoTextWrap: { flex: 1 },
  infoLabel: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  infoValue: { color: COLORS.text, fontSize: FONT_SIZE.sm },

  // Rating modal
  ratingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  ratingCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  ratingTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  ratingInput: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    padding: SPACING.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  ratingActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  ratingActionBtn: { flex: 1 },
});
