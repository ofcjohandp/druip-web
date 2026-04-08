import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUpsertStudentProfile } from '@/features/onboarding/useUpsertStudentProfile';
import { OnboardingProgress } from '@/features/onboarding/OnboardingProgress';
import { UNIVERSITIES } from '@/features/onboarding/universities';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/features/ui/Button';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

export default function Step2UniversityScreen() {
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upsertStudentProfile = useUpsertStudentProfile();

  const campuses = UNIVERSITIES.find((u) => u.university === selectedUniversity)?.campuses ?? [];

  const handleSelectUniversity = (university: string) => {
    setSelectedUniversity(university);
    setSelectedCampus(null);
  };

  const handleContinue = async () => {
    if (!selectedUniversity || !selectedCampus) return;
    setError(null);
    try {
      await upsertStudentProfile.mutateAsync({
        university: selectedUniversity,
        campus: selectedCampus,
      });
      router.push('/(auth)/onboarding/step-3-degree');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const canContinue = !!selectedUniversity && !!selectedCampus;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <OnboardingProgress currentStep={2} totalSteps={5} />
        <Text style={[TYPOGRAPHY.heading, { color: COLORS.text, marginBottom: SPACING.xs }]}>Your university</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: SPACING.md }]}>Select your university and campus</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>University</Text>
        {UNIVERSITIES.map((u) => (
          <TouchableOpacity
            key={u.university}
            style={[styles.listItem, selectedUniversity === u.university && styles.listItemSelected]}
            onPress={() => handleSelectUniversity(u.university)}
            activeOpacity={0.7}
          >
            <Text style={[TYPOGRAPHY.body, { color: selectedUniversity === u.university ? COLORS.accent : COLORS.text, flex: 1 }]}>
              {u.university}
            </Text>
            {selectedUniversity === u.university && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
            )}
          </TouchableOpacity>
        ))}

        {campuses.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, styles.sectionLabelMargin]}>Campus</Text>
            {campuses.map((campus) => (
              <TouchableOpacity
                key={campus}
                style={[styles.listItem, selectedCampus === campus && styles.listItemSelected]}
                onPress={() => setSelectedCampus(campus)}
                activeOpacity={0.7}
              >
                <Text style={[TYPOGRAPHY.body, { color: selectedCampus === campus ? COLORS.accent : COLORS.text, flex: 1 }]}>
                  {campus}
                </Text>
                {selectedCampus === campus && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLabelMargin: { marginTop: SPACING.lg },
  listItem: {
    padding: SPACING.md,
    borderRadius: RADII.button,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemSelected: {
    backgroundColor: COLORS.accent + '1A',
    borderColor: COLORS.accent,
  },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
});
