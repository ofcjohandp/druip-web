import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useClassroomDetail } from '@/features/student/useClassroomDetail';
import { useMySubscriptions } from '@/features/student/useMySubscriptions';
import { LockedContentOverlay } from '@/features/student/LockedContentOverlay';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING, RADII, TYPOGRAPHY } from '@/features/ui/theme';
import { Tag } from '@/features/ui/Tag';
import { useClassroomCards } from '@/features/classroom/useClassroomCards';
import { StudentCardRenderer } from '@/features/classroom/StudentCardRenderer';
import type { Database } from '@/types/database';

type SectionRow_DB = Database['public']['Tables']['classroom_sections']['Row'];

function SectionWithStudentCards({ section }: { section: SectionRow_DB }) {
  const { data: cards = [], isPending } = useClassroomCards(section.id);
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionName}>{section.name}</Text>
      {isPending ? (
        <ActivityIndicator size="small" color={COLORS.accent} style={{ marginTop: SPACING.xs }} />
      ) : (
        cards.map((card) => (
          <StudentCardRenderer key={card.id} card={card} />
        ))
      )}
    </View>
  );
}

export default function ClassroomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: classroom, isLoading, isError } = useClassroomDetail(id);
  const { data: subscriptions = [] } = useMySubscriptions();

  // D-18: client-side subscription check
  const isSubscribed = subscriptions.some(
    (s) => s.classroom_id === id && s.status === 'active'
  );

  const priceLabel = classroom
    ? `Subscribe · R${classroom.price_cents / 100}/month`
    : 'Subscribe';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header row — back button + title */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.heading, { color: COLORS.text }]}>Classroom</Text>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
      )}

      {isError && !isLoading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Couldn't load this classroom. Go back and try again.</Text>
        </View>
      )}

      {classroom && !isLoading && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Classroom name */}
          <Text style={[TYPOGRAPHY.display, { color: COLORS.text, marginBottom: SPACING.xs }]}>{classroom.name}</Text>

          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginBottom: SPACING.sm }]}>by {(classroom as any).tutors?.profiles?.full_name ?? (classroom as any).tutors?.profiles?.email ?? 'Tutor'}</Text>

          {/* Subject tags */}
          <View style={styles.tagsRow}>
            {classroom.subjects.map((subject) => (
              <Tag key={subject} label={subject} />
            ))}
          </View>

          {/* Bio */}
          {classroom.bio ? (
            <Text style={[TYPOGRAPHY.body, { color: COLORS.text, marginTop: SPACING.sm, lineHeight: 24 }]}>{classroom.bio}</Text>
          ) : null}

          {/* Price */}
          <Text style={[TYPOGRAPHY.subheading, { color: COLORS.primary, marginTop: SPACING.sm }]}>R{classroom.price_cents / 100}/month</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Sections heading */}
          <Text style={[TYPOGRAPHY.subheading, { color: COLORS.text, marginBottom: SPACING.sm }]}>Sections</Text>

          {/* Section list — D-07: lock icon for non-subscribers */}
          {(classroom.classroom_sections ?? []).map((section) =>
            isSubscribed ? (
              <SectionWithStudentCards key={section.id} section={section} />
            ) : (
              <LockedContentOverlay key={section.id} sectionName={section.name} />
            )
          )}

          <View style={{ height: SPACING.xl }} />

          {/* Subscribe CTA — D-08 — or subscribed indicator — D-10 */}
          {isSubscribed ? (
            <>
              <View style={styles.subscribedIndicator}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.subscribedText}>You're subscribed</Text>
              </View>
              <Button
                variant="secondary"
                title="Message tutor"
                onPress={() => router.push(`/(tabs)/dm-chat?classroomId=${id}`)}
                style={{ marginTop: SPACING.sm }}
              />
            </>
          ) : (
            <Button
              variant="primary"
              title={priceLabel}
              onPress={() =>
                router.push(`/(tabs)/subscribe-confirm?id=${id}&name=${encodeURIComponent(classroom.name)}&price=${classroom.price_cents}`)
              }
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  loader: { marginTop: SPACING.xl },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  errorText: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm, gap: SPACING.xs },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  sectionRow: { backgroundColor: COLORS.surface, borderRadius: RADII.button, padding: SPACING.sm, marginBottom: SPACING.xs },
  sectionName: { fontSize: 14, color: COLORS.text },
  subscribedIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  subscribedText: { fontSize: 14, color: COLORS.textMuted },
});
