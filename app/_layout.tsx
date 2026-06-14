import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#050505" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="fuel/add-food" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="fuel/scan" options={{ headerShown: false }} />
        <Stack.Screen name="fuel/custom-food" options={{ headerShown: false }} />
        <Stack.Screen name="fuel/confirm-food" options={{ headerShown: false }} />
        <Stack.Screen name="fuel/food-detail" options={{ headerShown: false }} />
        <Stack.Screen name="fuel/settings" options={{ headerShown: false }} />
        <Stack.Screen name="fuel/sync" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
