import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useUpsertStudentProfile } from '@/features/onboarding/useUpsertStudentProfile';
import { OnboardingProgress } from '@/features/onboarding/OnboardingProgress';
import { TagBubbleSelect } from '@/features/onboarding/TagBubbleSelect';
import { HELP_TYPES } from '@/features/onboarding/helpTypes';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function Step5HelpTypeScreen() {
  const [selectedHelpTypes, setSelectedHelpTypes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const upsertStudentProfile = useUpsertStudentProfile();

  const handleToggle = (id: string) => {
    setSelectedHelpTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedHelpTypes.length === 0) return;
    setError(null);
    try {
      await upsertStudentProfile.mutateAsync({
        help_types: selectedHelpTypes,
        onboarding_complete: true,
      });
      useAuthStore.getState().setPendingStudentOnboarding(false);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const options = HELP_TYPES.map((h) => ({ id: h.id, label: h.label }));
  const canContinue = selectedHelpTypes.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <OnboardingProgress currentStep={5} totalSteps={5} />
        <Text style={styles.title}>How can tutors help?</Text>
        <Text style={styles.subtitle}>Choose what kind of support you're looking for</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <TagBubbleSelect
          options={options}
          selected={selectedHelpTypes}
          onToggle={handleToggle}
        />
      </ScrollView>

      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {upsertStudentProfile.isPending ? (
          <ActivityIndicator color={COLORS.accent} />
        ) : (
          <Button title="Continue" onPress={handleContinue} variant="primary" disabled={!canContinue} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.md },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
});
