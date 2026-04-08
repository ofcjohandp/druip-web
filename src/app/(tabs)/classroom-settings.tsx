import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Classroom settings</Text>
          </View>

          {/* Classroom name */}
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

          {/* Subjects */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Subjects</Text>
            <SubjectTagInput subjects={subjects} onSubjectsChange={setSubjects} />
          </View>

          {/* Bio */}
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

          {/* Monthly price */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Monthly price</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currencyPrefix}>R</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="180"
                placeholderTextColor={COLORS.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Error */}
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaButton, (isDisabled || updateClassroom.isPending) && styles.ctaDisabled]}
            onPress={handleSave}
            disabled={isDisabled || updateClassroom.isPending}
            activeOpacity={0.85}
          >
            {updateClassroom.isPending ? (
              <ActivityIndicator size="small" color={COLORS.textOnAccent} />
            ) : (
              <Text style={styles.ctaText}>Save changes</Text>
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
  content: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  fieldGroup: { marginBottom: SPACING.lg },
  label: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    color: COLORS.text,
  },
  bioInput: { minHeight: 96 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  currencyPrefix: { fontSize: 16, color: COLORS.textMuted },
  priceInput: { flex: 1 },
  errorText: { fontSize: 14, color: COLORS.error, marginBottom: SPACING.md },
  ctaButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.button,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { fontSize: 16, fontWeight: '600', color: COLORS.textOnAccent },
});
