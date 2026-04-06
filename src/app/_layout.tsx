import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppProviders } from '@/providers/AppProviders';
import { useAuthStore } from '@/features/auth/useAuthStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* PUBLIC screens — accessible to all users */}
      <Stack.Screen name="index" />

      {/* UNAUTHENTICATED only — authenticated users redirect to (tabs) */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="sample-lesson" />
        <Stack.Screen name="sign-up-prompt" />
      </Stack.Protected>

      {/* AUTHENTICATED users only */}
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* UNAUTHENTICATED users only */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
