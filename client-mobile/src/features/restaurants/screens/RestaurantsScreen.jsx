// client-mobile/src/features/restaurants/screens/RestaurantsScreen.jsx
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  RefreshControl, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getRestaurants } from '../../../shared/api/adminClient.js';
import { EmptyState, LoadingSpinner } from '../../../shared/components/Common.jsx';
import {
  COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS,
} from '../../../shared/constants/theme.js';

const CATEGORIES = ['Todos', 'Comida Rápida', 'Italiana', 'Japonesa', 'Mexicana', 'Saludable', 'Mariscos', 'Panadería'];

const RestaurantCard = ({ restaurant, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.cardIconWrap}>
        <MaterialIcons name='restaurant' size={24} color={COLORS.primary} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.cardCategory}>{restaurant.category}</Text>
      </View>
      <View style={styles.cardRight}>
        {restaurant.rating > 0 && (
          <View style={styles.ratingRow}>
            <MaterialIcons name='star' size={14} color={COLORS.primary} />
            <Text style={styles.ratingText}>{Number(restaurant.rating).toFixed(1)}</Text>
          </View>
        )}
        <View style={[styles.activeDot, { backgroundColor: restaurant.isActive ? COLORS.success : COLORS.textSubtle }]} />
      </View>
    </View>
    {restaurant.address && (
      <View style={styles.addressRow}>
        <MaterialIcons name='location-on' size={12} color={COLORS.textSubtle} />
        <Text style={styles.address} numberOfLines={1}>{restaurant.address}</Text>
      </View>
    )}
    {restaurant.description && (
      <Text style={styles.description} numberOfLines={2}>{restaurant.description}</Text>
    )}
  </TouchableOpacity>
);

export const RestaurantsScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = { isActive: true, limit: 50 };
      if (search.trim()) params.search = search.trim();
      if (category !== 'Todos') params.category = category;
      const res = await getRestaurants(params);
      setRestaurants(res.data?.data ?? []);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Restaurantes</Text>
        <Text style={styles.subtitle}>Descubre los mejores sabores</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <MaterialIcons name='search' size={18} color={COLORS.textSubtle} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder='Buscar restaurante...'
          placeholderTextColor={COLORS.textSubtle}
          value={search}
          onChangeText={setSearch}
          returnKeyType='search'
          onSubmitEditing={() => load()}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name='close' size={18} color={COLORS.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setCategory(item)}
            style={[styles.catChip, category === item && styles.catChipActive]}
          >
            <Text style={[styles.catChipText, category === item && styles.catChipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.catFlatList}
      />

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon='restaurant'
              title='Sin resultados'
              subtitle={search ? 'Prueba con otra búsqueda' : 'No hay restaurantes disponibles'}
            />
          }
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => navigation.navigate('RestaurantDetail', { id: item._id, name: item.name })}
            />
          )}
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

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    paddingVertical: SPACING.sm + 2,
  },

  // Categories
  catFlatList: { maxHeight: 44 },
  catList: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, paddingBottom: SPACING.sm },
  catChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  catChipText: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm },
  catChipTextActive: { color: COLORS.primaryLight, fontWeight: FONT_WEIGHT.semibold },

  // Card
  list: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardInfo: { flex: 1 },
  cardName: { color: COLORS.text, fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold },
  cardCategory: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: SPACING.xs },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  address: { color: COLORS.textSubtle, fontSize: FONT_SIZE.xs, flex: 1 },
  description: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 18 },
});
