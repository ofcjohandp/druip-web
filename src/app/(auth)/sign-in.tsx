import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { Input } from '@/features/ui/Input';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useAuthStore((s) => s.isOnline);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    }
    // On success, onAuthStateChange fires → session updates → Stack.Protected redirects to (tabs)
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heroZone}>
        <Text style={[TYPOGRAPHY.display, { color: COLORS.textOnAccent }]}>Druip</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textOnAccent, opacity: 0.85, marginTop: SPACING.xs }]}>
          Learn from the best
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.primary }]}>
              You are offline. Sign in requires an internet connection.
            </Text>
          </View>
        )}
        <Text style={[TYPOGRAPHY.heading, { color: COLORS.text, marginBottom: SPACING.xl }]}>Welcome back</Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          autoComplete="password"
        />
        {error && (
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.error, marginBottom: SPACING.sm }]}>{error}</Text>
        )}
        <Button
          title="Sign in"
          onPress={handleSignIn}
          loading={loading}
          disabled={!isOnline}
          style={{ marginTop: SPACING.sm }}
        />
        <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textMuted }]}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroZone: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  content: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
  offlineBanner: {
    backgroundColor: COLORS.accentSecondary + '33',
    padding: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  link: { marginTop: SPACING.lg, alignItems: 'center' },
});
