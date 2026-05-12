import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../lib/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1E24' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: '#111' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Sign In', presentation: 'modal' }} />
        <Stack.Screen name="register" options={{ title: 'Join KULL 1', presentation: 'modal' }} />
        <Stack.Screen name="tournament/[id]" options={{ title: 'Tournament' }} />
        <Stack.Screen name="catch/submit" options={{ title: 'Submit Catch', presentation: 'fullScreenModal' }} />
      </Stack>
    </AuthProvider>
  );
}
