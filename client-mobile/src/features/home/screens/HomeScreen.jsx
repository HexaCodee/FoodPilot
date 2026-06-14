// client-mobile/src/features/home/screens/HomeScreen.jsx
import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { getRestaurants } from '../../../shared/api/adminClient.js';
import { getOrders } from '../../../shared/api/ordersClient.js';
import { getReservations } from '../../../shared/api/ordersClient.js';
import { Card, StatusBadge, EmptyState, LoadingSpinner } from '../../../shared/components/Common.jsx';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.statCard}>
    <View style={styles.statIconWrap}>
      <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.statValue}>{value ?? '—'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

// ── RestaurantChip ────────────────────────────────────────────────────────────
const RestaurantChip = ({ restaurant, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.chip}>
    <View style={styles.chipHeader}>
      <Text style={styles.chipName} numberOfLines={1}>{restaurant.name}</Text>
      {restaurant.rating > 0 && (
        <View style={styles.chipRating}>
          <MaterialIcons name='star' size={12} color={COLORS.primary} />
          <Text style={styles.chipRatingText}>{Number(restaurant.rating).toFixed(1)}</Text>
        </View>
      )}
    </View>
    <Text style={styles.chipCategory}>{restaurant.category}</Text>
    {restaurant.address && (
      <Text style={styles.chipAddress} numberOfLines={1}>
        📍 {restaurant.address}
      </Text>
    )}
  </TouchableOpacity>
);

// ── Screen ────────────────────────────────────────────────────────────────────
export const HomeScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const [restaurants, setRestaurants] = useState([]);
  const [stats, setStats] = useState({ orders: null, reservations: null, restaurants: null });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [ordersRes, reservationsRes, restaurantsRes] = await Promise.allSettled([
        getOrders({ userId: user?.id, limit: 100 }),
        getReservations({ userId: user?.id, limit: 100 }),
        getRestaurants({ isActive: true, limit: 6 }),
      ]);

      const orderList = Array.isArray(ordersRes.value?.data) ? ordersRes.value.data : [];
      const resList = Array.isArray(reservationsRes.value?.data)
        ? reservationsRes.value.data
        : [];

      setStats({
        orders: orderList.length,
        reservations: resList.filter((r) => r.status === 'ACTIVA').length,
        restaurants: restaurantsRes.value?.data?.pagination?.totalRecords ?? null,
      });

      setRestaurants(restaurantsRes.value?.data?.data ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const avatarUri = typeof user?.profilePicture === 'string' && user.profilePicture.startsWith('http')
    ? user.profilePicture
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hola, {user?.username ?? 'usuario'} 👋
            </Text>
            <Text style={styles.greetingSub}>Explora restaurantes y gestiona tus pedidos</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarBtn}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <MaterialIcons name='person' size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {loading ? (
          <LoadingSpinner style={styles.loader} />
        ) : (
          <View style={styles.statsRow}>
            <StatCard
              icon='receipt-long'
              label='Pedidos'
              value={stats.orders}
              onPress={() => navigation.navigate('Orders')}
            />
            <StatCard
              icon='event'
              label='Reservas activas'
              value={stats.reservations}
              onPress={() => navigation.navigate('Reservations')}
            />
            <StatCard
              icon='restaurant'
              label='Restaurantes'
              value={stats.restaurants}
              onPress={() => navigation.navigate('Restaurants')}
            />
          </View>
        )}

        {/* Accesos rápidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceso rápido</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: 'restaurant-menu', label: 'Explorar', nav: () => navigation.navigate('Restaurants') },
              { icon: 'receipt-long', label: 'Mis pedidos', nav: () => navigation.navigate('Orders') },
              { icon: 'event', label: 'Mis reservas', nav: () => navigation.navigate('Reservations') },
              { icon: 'celebration', label: 'Eventos', nav: () => navigation.navigate('Events') },
              { icon: 'person', label: 'Mi perfil', nav: () => navigation.navigate('Profile') },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.nav}
                style={styles.quickBtn}
                activeOpacity={0.8}
              >
                <MaterialIcons name={item.icon} size={22} color={COLORS.primary} />
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Restaurantes destacados */}
        <View style={[styles.section, styles.sectionLast]}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Restaurantes disponibles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Restaurants')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? null : restaurants.length === 0 ? (
            <EmptyState icon='restaurant' title='Sin restaurantes' subtitle='No hay restaurantes disponibles por ahora' />
          ) : (
            restaurants.map((r) => (
              <RestaurantChip
                key={r._id}
                restaurant={r}
                onPress={() =>
                  navigation.navigate('Home', {
                    screen: 'RestaurantDetail',
                    params: { id: r._id, name: r.name },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  loader: { height: 80 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  greetingSub: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
    marginTop: 2,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 42,
    height: 42,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    textAlign: 'center',
    marginTop: 2,
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionLast: { paddingBottom: SPACING.xl },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.md,
  },
  seeAll: { color: COLORS.primary, fontSize: FONT_SIZE.sm },

  // Quick access
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickBtn: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickLabel: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.sm,
  },

  // Restaurant chip
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  chipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chipName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    flex: 1,
  },
  chipRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  chipRatingText: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold },
  chipCategory: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs },
  chipAddress: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs, marginTop: 4 },
});
