// client-mobile/src/navigation/AppNavigator.jsx
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../shared/store/authStore.js';
import { AuthNavigator } from './AuthNavigator.jsx';
import { MainNavigator } from './MainNavigator.jsx';
import { FullScreenLoader } from '../shared/components/Common.jsx';

export const AppNavigator = () => {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  // Esperar a que Zustand hidrate desde AsyncStorage
  if (!_hasHydrated) return <FullScreenLoader />;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
