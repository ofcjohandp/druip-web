import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUpsertStudentProfile } from '@/features/onboarding/useUpsertStudentProfile';
import { OnboardingProgress } from '@/features/onboarding/OnboardingProgress';
import { Button } from '@/features/ui/Button';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

const YEARS = [1, 2, 3, 4, 5, 6];

export default function Step3DegreeScreen() {
  const [degree, setDegree] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upsertStudentProfile = useUpsertStudentProfile();

  const handleContinue = async () => {
    if (!degree.trim() || !yearOfStudy) return;
    setError(null);
    try {
      await upsertStudentProfile.mutateAsync({
        degree: degree.trim(),
        year_of_study: yearOfStudy,
      });
      router.push('/(auth)/onboarding/step-4-subjects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const canContinue = degree.trim().length > 0 && yearOfStudy !== null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <OnboardingProgress currentStep={3} totalSteps={6} />
        <Text style={styles.title}>Your degree</Text>
        <Text style={styles.subtitle}>What are you studying and which year are you in?</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. BSc Physiotherapy"
          placeholderTextColor={COLORS.textMuted}
          value={degree}
          onChangeText={setDegree}
          autoCapitalize="words"
        />

        <Text style={styles.yearLabel}>Year of study</Text>
        <View style={styles.yearsRow}>
          {YEARS.map((year) => (
            <TouchableOpacity
              key={year}
              style={[styles.yearBubble, yearOfStudy === year && styles.yearBubbleSelected]}
              onPress={() => setYearOfStudy(year)}
              activeOpacity={0.7}
            >
              <Text style={[styles.yearText, yearOfStudy === year && styles.yearTextSelected]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {upsertStudentProfile.isPending ? (
          <ActivityIndicator color={COLORS.accent} style={styles.loader} />
        ) : (
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={!canContinue}
            style={styles.button}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.xl },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  yearLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  yearsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  yearBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearBubbleSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  yearText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  yearTextSelected: { color: COLORS.textOnAccent },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
  loader: { marginTop: SPACING.sm },
  button: { marginTop: SPACING.sm },
});
