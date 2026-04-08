import { useState } from 'react';
import {
  Text,
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
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';
import { Card } from '@/features/ui/Card';
import { Input } from '@/features/ui/Input';
import { Button } from '@/features/ui/Button';
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
      router.replace('/(auth)/tutor-profile');
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
      <View style={styles.heroZone}>
        <Text style={[TYPOGRAPHY.display, { color: COLORS.textOnAccent }]}>Druip</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textOnAccent, opacity: 0.85, marginTop: SPACING.xs }]}>
          Join your tutor's classroom
        </Text>
      </View>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={[TYPOGRAPHY.heading, { color: COLORS.text, marginBottom: SPACING.xs }]}>Create your account</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: SPACING.xl }]}>
          Just an email and password — that's it
        </Text>
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
          autoComplete="new-password"
        />
        <Card style={styles.toggleCard}>
          <View>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.text }]}>I want to teach</Text>
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textMuted, marginTop: 2 }]}>
              Create a classroom for your students
            </Text>
          </View>
          <Switch
            value={isTutor}
            onValueChange={setIsTutor}
            trackColor={{ false: COLORS.border, true: COLORS.accent + '4D' }}
            thumbColor={isTutor ? COLORS.accent : '#F4F3F4'}
          />
        </Card>
        {error && (
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.error, marginBottom: SPACING.sm }]}>{error}</Text>
        )}
        <Button
          title="Create account"
          onPress={handleSignUp}
          loading={loading}
          style={{ marginTop: SPACING.sm }}
        />
        <TouchableOpacity style={styles.link} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textMuted }]}>Already have an account? Sign in</Text>
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
  toggleCard: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  link: { marginTop: SPACING.lg, alignItems: 'center' },
});
