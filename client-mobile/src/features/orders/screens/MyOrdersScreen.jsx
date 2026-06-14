// client-mobile/src/features/orders/screens/MyOrdersScreen.jsx
import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  RefreshControl, StyleSheet, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { getOrders, cancelOrder } from '../../../shared/api/ordersClient.js';
import { StatusBadge, EmptyState, LoadingSpinner } from '../../../shared/components/Common.jsx';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

const STATUS_FILTERS = ['Todos', 'PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
const STATUS_LABEL = { Todos: 'Todos', PENDIENTE: 'Pendiente', ENVIADO: 'En camino', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' };

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const OrderCard = ({ order, onCancel }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardProduct}>
        <MaterialIcons name='shopping-bag' size={16} color={COLORS.primary} />
        <Text style={styles.productName} numberOfLines={1}>{order.product}</Text>
      </View>
      <StatusBadge status={order.status} />
    </View>

    <View style={styles.cardMeta}>
      <Text style={styles.metaItem}>👤 {order.customerName}</Text>
      <Text style={styles.metaItem}>× {order.quantity}</Text>
      {order.price != null && (
        <Text style={[styles.metaItem, styles.price]}>${Number(order.price).toFixed(2)}</Text>
      )}
    </View>

    <View style={styles.cardFooter}>
      <Text style={styles.date}>{fmtDate(order.createdAt)}</Text>
      {order.status === 'PENDIENTE' && (
        <TouchableOpacity onPress={() => onCancel(order._id)} style={styles.cancelBtn}>
          <MaterialIcons name='cancel' size={14} color={COLORS.error} />
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export const MyOrdersScreen = () => {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('Todos');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const params = { userId: user?.id, limit: 100 };
      if (filter !== 'Todos') params.status = filter;
      const res = await getOrders(params);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleCancel = (id) => {
    Alert.alert(
      'Cancelar pedido',
      '¿Seguro que deseas cancelar este pedido? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(id);
              load();
            } catch {
              Alert.alert('Error', 'No se pudo cancelar el pedido');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis pedidos</Text>
        <Text style={styles.subtitle}>Historial y estado de tus pedidos</Text>
      </View>

      {/* Filtros */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUS_FILTERS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filters}
        style={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item)}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {STATUS_LABEL[item] ?? item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon='receipt-long'
              title='Sin pedidos'
              subtitle={filter !== 'Todos' ? 'Sin pedidos con este estado' : 'Aún no has realizado ningún pedido'}
            />
          }
          renderItem={({ item }) => <OrderCard order={item} onCancel={handleCancel} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { color: COLORS.text, fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold },
  subtitle: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, marginTop: 2 },

  filterList: { maxHeight: 44 },
  filters: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  filterTextActive: { color: COLORS.primaryLight, fontWeight: FONT_WEIGHT.semibold },

  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  cardProduct: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  productName: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.medium, flex: 1 },
  cardMeta: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  metaItem: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  price: { color: COLORS.primary, fontWeight: FONT_WEIGHT.semibold, marginLeft: 'auto' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cancelText: { color: COLORS.error, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.medium },
});
