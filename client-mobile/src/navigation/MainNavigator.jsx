// client-mobile/src/navigation/MainNavigator.jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../shared/constants/theme.js';

// Screens
import { HomeScreen } from '../features/home/screens/HomeScreen.jsx';
import { RestaurantsScreen } from '../features/restaurants/screens/RestaurantsScreen.jsx';
import { RestaurantDetailScreen } from '../features/restaurants/screens/RestaurantDetailScreen.jsx';
import { MyOrdersScreen } from '../features/orders/screens/MyOrdersScreen.jsx';
import { MyReservationsScreen } from '../features/reservations/screens/MyReservationsScreen.jsx';
import { EventsScreen } from '../features/events/screens/EventsScreen.jsx';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen.jsx';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Stacks internos ───────────────────────────────────────────────────────────
const headerStyle = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.primary,
  headerTitleStyle: { color: COLORS.text, fontWeight: FONT_WEIGHT.semibold },
  headerBackTitle: '',
};

const RestaurantsStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen
      name='RestaurantsList'
      component={RestaurantsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name='RestaurantDetail'
      component={RestaurantDetailScreen}
      options={({ route }) => ({
        title: route.params?.name ?? 'Restaurante',
        headerShown: true,
      })}
    />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={headerStyle}>
    <Stack.Screen
      name='HomeMain'
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    {/* Detalle de restaurante también accesible desde Home */}
    <Stack.Screen
      name='RestaurantDetail'
      component={RestaurantDetailScreen}
      options={({ route }) => ({ title: route.params?.name ?? 'Restaurante' })}
    />
  </Stack.Navigator>
);

// ── Tab Navigator ─────────────────────────────────────────────────────────────
export const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: COLORS.sidebar,
        borderTopColor: COLORS.border,
        borderTopWidth: 1,
        height: 62,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textSubtle,
      // Con 6 tabs el espacio horizontal es más justo; un punto menos que
      // FONT_SIZE.xs evita que "Restaurantes" se corte en pantallas angostas.
      tabBarLabelStyle: {
        fontSize: FONT_SIZE.xs - 1,
        fontWeight: FONT_WEIGHT.medium,
      },
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home',
          Restaurants: 'restaurant',
          Orders: 'receipt-long',
          Reservations: 'event',
          Events: 'celebration',
          Profile: 'person',
        };
        return (
          <MaterialIcons
            name={icons[route.name] ?? 'circle'}
            size={size}
            color={color}
          />
        );
      },
    })}
  >
    <Tab.Screen name='Home' component={HomeStack} options={{ title: 'Inicio' }} />
    <Tab.Screen name='Restaurants' component={RestaurantsStack} options={{ title: 'Restaurantes' }} />
    <Tab.Screen name='Orders' component={MyOrdersScreen} options={{ title: 'Pedidos' }} />
    <Tab.Screen name='Reservations' component={MyReservationsScreen} options={{ title: 'Reservas' }} />
    <Tab.Screen name='Events' component={EventsScreen} options={{ title: 'Eventos' }} />
    <Tab.Screen
      name='Profile'
      component={ProfileScreen}
      options={{
        title: 'Perfil',
        headerShown: true,
        headerTitle: 'Mi perfil',
        ...headerStyle,
      }}
    />
  </Tab.Navigator>
);
