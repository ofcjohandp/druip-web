import { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';
import { Button } from '@/features/ui/Button';

export default function TutorProfileScreen() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!fullName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const userId =
        useAuthStore.getState().session?.user?.id ||
        useAuthStore.getState().pendingUserId;
      if (!userId) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() } as any)
        .eq('id', userId);
      if (updateError) throw updateError;

      router.replace('/(auth)/create-classroom');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>This is how students will see you</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={COLORS.textMuted}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          autoComplete="name"
          autoFocus
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={styles.loader} />
        ) : (
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={!fullName.trim()}
            style={styles.button}
          />
        )}
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
  loader: { marginTop: SPACING.sm },
  button: { marginTop: SPACING.sm },
});
