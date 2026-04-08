import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';
import { Input } from '@/features/ui/Input';
import { Button } from '@/features/ui/Button';
import { SubjectTagInput } from '@/features/tutor/SubjectTagInput';
import { useClassroom } from '@/features/tutor/useClassroom';
import { useUpdateClassroom } from '@/features/tutor/useUpdateClassroom';

export default function ClassroomSettingsScreen() {
  const { data: classroom } = useClassroom();
  const updateClassroom = useUpdateClassroom();

  const [name, setName] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (classroom) {
      setName(classroom.name);
      setSubjects(classroom.subjects);
      setBio(classroom.bio || '');
      setPrice((classroom.price_cents / 100).toString());
    }
  }, [classroom]);

  const isDisabled = !name.trim() || subjects.length === 0 || !price.trim();

  const handleSave = async () => {
    if (!classroom || isDisabled) return;
    setError('');
    try {
      await updateClassroom.mutateAsync({
        classroomId: classroom.id,
        name: name.trim(),
        subjects,
        bio: bio.trim(),
        price_cents: parseInt(price, 10) * 100,
      });
      router.back();
    } catch {
      setError("Changes didn't save. Check your connection and try again.");
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
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Classroom settings</Text>
          </View>

          {/* Classroom name */}
          <View style={styles.fieldGroup}>
            <Input
              label="Classroom name"
              placeholder="e.g. Physio Year 2 — Cardiopulmonary"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Subjects */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Subjects</Text>
            <SubjectTagInput subjects={subjects} onSubjectsChange={setSubjects} />
          </View>

          {/* Bio */}
          <View style={styles.fieldGroup}>
            <Input
              label="Bio (optional)"
              placeholder="Tell students what you cover and how you teach"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Monthly price */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Monthly price</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currencyPrefix}>R</Text>
              <View style={styles.priceInputWrapper}>
                <Input
                  placeholder="180"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* CTA */}
          <Button
            title="Save changes"
            variant="primary"
            onPress={handleSave}
            disabled={isDisabled}
            loading={updateClassroom.isPending}
            style={styles.ctaButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.text,
  },
  fieldGroup: { marginBottom: SPACING.lg },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  currencyPrefix: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  priceInputWrapper: { flex: 1 },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  ctaButton: {
    marginTop: SPACING.xs,
  },
});
