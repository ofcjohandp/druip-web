import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';
import { useCreateClassroom } from '@/features/tutor/useCreateClassroom';
import { SubjectTagInput } from '@/features/tutor/SubjectTagInput';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function CreateClassroomScreen() {
  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [price, setPrice] = useState('180');
  const [error, setError] = useState<string | null>(null);

  const createClassroom = useCreateClassroom();

  const isDisabled =
    !name.trim() || subjects.length === 0 || !price.trim() || createClassroom.isPending;

  const handleCreate = async () => {
    setError(null);
    try {
      await createClassroom.mutateAsync({
        name: name.trim(),
        subjects,
        bio: bio.trim(),
        price_cents: parseInt(price, 10) * 100,
      });
      useAuthStore.getState().setPendingTutorOnboarding(false);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e);
      setError(msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Create your classroom</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Classroom name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Physio Year 2 — Cardiopulmonary"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Subjects</Text>
            <SubjectTagInput subjects={subjects} onSubjectsChange={setSubjects} />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bio (optional)</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell students what you cover and how you teach"
              placeholderTextColor={COLORS.textMuted}
              value={bio}
              onChangeText={setBio}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Monthly price</Text>
            <View style={styles.priceRow}>
              <Text style={styles.pricePrefix}>R</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            {createClassroom.isPending ? (
              <ActivityIndicator size="small" color={COLORS.textOnAccent} />
            ) : (
              <Text style={styles.buttonText}>Create classroom</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bioInput: {
    minHeight: 96,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pricePrefix: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  priceInput: {
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: SPACING.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.textOnAccent, fontSize: 16, fontFamily: 'Nunito_600SemiBold' },
});
