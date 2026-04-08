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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUpsertStudentProfile } from '@/features/onboarding/useUpsertStudentProfile';
import { OnboardingProgress } from '@/features/onboarding/OnboardingProgress';
import { Button } from '@/features/ui/Button';
import { DEGREES } from '@/features/onboarding/degrees';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

const YEARS = [1, 2, 3, 4, 5, 6];

export default function Step3DegreeScreen() {
  const [query, setQuery] = useState('');
  const [degree, setDegree] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upsertStudentProfile = useUpsertStudentProfile();

  const suggestions = query.length > 0
    ? DEGREES.filter((d) => d.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  const handleChangeText = (text: string) => {
    setQuery(text);
    setDegree('');
    setShowDropdown(true);
  };

  const handleSelect = (selected: string) => {
    setDegree(selected);
    setQuery(selected);
    setShowDropdown(false);
  };

  const handleContinue = async () => {
    if (!degree || !yearOfStudy) return;
    setError(null);
    try {
      await upsertStudentProfile.mutateAsync({
        degree,
        year_of_study: yearOfStudy,
      });
      router.push('/(auth)/onboarding/step-4-subjects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const canContinue = degree.length > 0 && yearOfStudy !== null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <OnboardingProgress currentStep={3} totalSteps={5} />
        <Text style={styles.title}>Your degree</Text>
        <Text style={styles.subtitle}>What are you studying and which year are you in?</Text>

        <View style={styles.autocompleteWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Search your degree..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={handleChangeText}
            onFocus={() => query.length > 0 && setShowDropdown(true)}
            autoCapitalize="words"
          />
          {showDropdown && suggestions.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

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
  autocompleteWrapper: { zIndex: 10, marginBottom: SPACING.lg },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 220,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownText: { fontSize: 15, color: COLORS.text },
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
  yearBubbleSelected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  yearText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  yearTextSelected: { color: COLORS.textOnAccent },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
  loader: { marginTop: SPACING.sm },
  button: { marginTop: SPACING.sm },
});
