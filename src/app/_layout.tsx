import { Stack, useRouter, useSegments } from 'expo-router';
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
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const inTabs = segments[0] === '(tabs)';
    if (session && !inTabs) {
      router.replace('/(tabs)');
    } else if (!session && inTabs) {
      router.replace('/');
    }
  }, [session, isLoading, segments]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sample-lesson" />
      <Stack.Screen name="sign-up-prompt" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="lesson/[lessonId]" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-complete" options={{ headerShown: false }} />
    </Stack>
  );
}
