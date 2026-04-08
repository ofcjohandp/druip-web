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
import { useSubjectTags } from '@/features/onboarding/useSubjectTags';
import { useSaveStudentSubjectTags } from '@/features/onboarding/useStudentSubjectTags';
import { OnboardingProgress } from '@/features/onboarding/OnboardingProgress';
import { TagBubbleSelect } from '@/features/onboarding/TagBubbleSelect';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function Step4SubjectsScreen() {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: tags, isLoading: tagsLoading } = useSubjectTags();
  const saveSubjectTags = useSaveStudentSubjectTags();

  const handleToggle = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedTagIds.length === 0) return;
    setError(null);
    try {
      await saveSubjectTags.mutateAsync(selectedTagIds);
      router.push('/(auth)/onboarding/step-5-help-type');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const options = (tags ?? []).map((tag) => ({ id: tag.id, label: tag.name }));
  const canContinue = selectedTagIds.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <OnboardingProgress currentStep={4} totalSteps={6} />
        <Text style={styles.title}>Which subjects?</Text>
        <Text style={styles.subtitle}>Select the subjects you need help with</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {tagsLoading ? (
          <ActivityIndicator color={COLORS.accent} style={styles.loader} />
        ) : (
          <TagBubbleSelect
            options={options}
            selected={selectedTagIds}
            onToggle={handleToggle}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {saveSubjectTags.isPending ? (
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
  loader: { marginTop: SPACING.lg },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
});
