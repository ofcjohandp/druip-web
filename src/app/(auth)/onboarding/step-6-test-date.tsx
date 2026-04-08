import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUpsertStudentProfile } from '@/features/onboarding/useUpsertStudentProfile';
import { OnboardingProgress } from '@/features/onboarding/OnboardingProgress';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { Button } from '@/features/ui/Button';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

export default function Step6TestDateScreen() {
  const [testDate, setTestDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertStudentProfile = useUpsertStudentProfile();

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

  const finishOnboarding = async (date: Date | null) => {
    setError(null);
    try {
      await upsertStudentProfile.mutateAsync({
        upcoming_test_date: date ? date.toISOString().split('T')[0] : null,
        onboarding_complete: true,
      });
      useAuthStore.getState().setPendingStudentOnboarding(false);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) setTestDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <OnboardingProgress currentStep={6} totalSteps={6} />
        <Text style={[TYPOGRAPHY.heading, { color: COLORS.text, marginBottom: SPACING.xs }]}>Got a test coming up?</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: SPACING.xl }]}>
          Set an upcoming test date and we'll help you prepare. You can skip this if you don't have one yet.
        </Text>

        {testDate ? (
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>{formatDate(testDate)}</Text>
            <TouchableOpacity onPress={() => setTestDate(null)} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.pickDateButton}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pickDateText}>Pick a date</Text>
          </TouchableOpacity>
        )}

        {showPicker && (
          <DateTimePicker
            value={testDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.actions}>
          {upsertStudentProfile.isPending ? (
            <ActivityIndicator color={COLORS.accent} />
          ) : (
            <>
              <Button
                title={testDate ? 'Finish' : 'Set date & finish'}
                onPress={() => finishOnboarding(testDate)}
                variant="primary"
                style={styles.finishButton}
              />
              <Button
                title="Skip for now"
                onPress={() => finishOnboarding(null)}
                variant="secondary"
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  dateText: { flex: 1, fontSize: 16, color: COLORS.text },
  clearButton: { paddingHorizontal: SPACING.sm },
  clearText: { fontSize: 14, color: COLORS.accent, fontWeight: '600' as const },
  pickDateButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center' as const,
    marginBottom: SPACING.lg,
  },
  pickDateText: { fontSize: 16, color: COLORS.textMuted },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
  actions: { gap: SPACING.sm, marginTop: SPACING.sm },
  finishButton: { marginBottom: 0 },
});
