// client-mobile/App.jsx
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator.jsx';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style='light' backgroundColor='#100F0C' />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
