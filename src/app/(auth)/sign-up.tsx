import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';
import { Card } from '@/features/ui/Card';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTutor, setIsTutor] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError(null);
    setLoading(true);
    // AUTH-02: signUp with email and password ONLY — no extra fields
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
    } else if (isTutor) {
      if (signUpData.session) {
        useAuthStore.getState().setSession(signUpData.session);
      }
      // Store userId directly — session may be null if email confirmation is on
      if (signUpData.user?.id) {
        useAuthStore.getState().setPendingUserId(signUpData.user.id);
      }
      useAuthStore.getState().setPendingTutorOnboarding(true);
      router.replace('/(auth)/create-classroom');
    } else {
      // Set session if available — same as tutor branch
      if (signUpData.session) {
        useAuthStore.getState().setSession(signUpData.session);
      }
      // Set pending student onboarding so root guard keeps user in auth flow
      useAuthStore.getState().setPendingStudentOnboarding(true);
      router.replace('/(auth)/onboarding/step-1-profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Just an email and password — that's it</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <Card style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleLabel}>I want to teach</Text>
            <Text style={styles.toggleSubLabel}>Create a classroom for your students</Text>
          </View>
          <Switch
            value={isTutor}
            onValueChange={setIsTutor}
            trackColor={{ false: COLORS.border, true: 'rgba(255, 107, 107, 0.3)' }}
            thumbColor={isTutor ? COLORS.accent : '#FFFFFF'}
          />
        </Card>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create account'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.xl },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
  button: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    minHeight: 48,
    marginTop: SPACING.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.textOnAccent, fontSize: 16, fontWeight: '600' },
  toggleCard: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  toggleLabel: { fontSize: 16, color: COLORS.text },
  toggleSubLabel: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  link: { marginTop: SPACING.lg, alignItems: 'center' },
  linkText: { color: COLORS.textMuted, fontSize: 14 },
});
