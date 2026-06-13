// client-mobile/src/navigation/AppNavigator.jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../shared/store/authStore.js';
import { AuthNavigator } from './AuthNavigator.jsx';
import { MainNavigator } from './MainNavigator.jsx';
import { FullScreenLoader } from '../shared/components/Common.jsx';

const RootStack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Esperar a que Zustand hidrate desde AsyncStorage
  if (!_hasHydrated) return <FullScreenLoader />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name='Main' component={MainNavigator} />
        ) : (
          <RootStack.Screen name='Auth' component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
