import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts, Syne_800ExtraBold } from '@expo-google-fonts/syne';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
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
  const [fontsLoaded] = useFonts({ Syne_800ExtraBold, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const pendingTutorOnboarding = useAuthStore((s) => s.pendingTutorOnboarding);
  const pendingStudentOnboarding = useAuthStore((s) => s.pendingStudentOnboarding);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    const inTabs = segments[0] === '(tabs)';
    const inAuth = segments[0] === '(auth)';

    if (session && !inTabs && !pendingTutorOnboarding && !pendingStudentOnboarding) {
      router.replace('/(tabs)');
    } else if (session && pendingTutorOnboarding && !inAuth) {
      router.replace('/(auth)/tutor-profile');
    } else if (session && pendingStudentOnboarding && !pendingTutorOnboarding && !inAuth) {
      router.replace('/(auth)/onboarding/step-1-profile');
    } else if (!session && inTabs) {
      router.replace('/');
    }
  }, [session, isLoading, segments, pendingTutorOnboarding, pendingStudentOnboarding]);

  if (!fontsLoaded || isLoading) return null;

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
