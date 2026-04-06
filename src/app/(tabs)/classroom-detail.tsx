import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useClassroomDetail } from '@/features/student/useClassroomDetail';
import { useMySubscriptions } from '@/features/student/useMySubscriptions';
import { LockedContentOverlay } from '@/features/student/LockedContentOverlay';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Classroom</Text>
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
          <Text style={styles.classroomName}>{classroom.name}</Text>

          {/* Tutor — using tutor_id as fallback display until join is confirmed */}
          <Text style={styles.tutorName}>by {classroom.tutor_id}</Text>

          {/* Subject tags */}
          <View style={styles.tagsRow}>
            {classroom.subjects.map((subject) => (
              <View key={subject} style={styles.tag}>
                <Text style={styles.tagText}>{subject}</Text>
              </View>
            ))}
          </View>

          {/* Bio */}
          {classroom.bio ? (
            <Text style={styles.bio}>{classroom.bio}</Text>
          ) : null}

          {/* Price */}
          <Text style={styles.price}>R{classroom.price_cents / 100}/month</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Sections heading */}
          <Text style={styles.sectionsHeading}>Sections</Text>

          {/* Section list — D-07: lock icon for non-subscribers */}
          {(classroom.classroom_sections ?? []).map((section) =>
            isSubscribed ? (
              <View key={section.id} style={styles.sectionRow}>
                <Text style={styles.sectionName}>{section.name}</Text>
              </View>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginLeft: SPACING.sm },
  loader: { marginTop: SPACING.xl },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  errorText: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  classroomName: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  tutorName: { fontSize: 14, color: COLORS.textMuted, marginTop: SPACING.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm },
  tag: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADII.button, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, marginRight: SPACING.xs, marginBottom: SPACING.xs },
  tagText: { fontSize: 14, color: COLORS.textMuted },
  bio: { fontSize: 16, color: COLORS.text, marginTop: SPACING.sm, lineHeight: 24 },
  price: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: SPACING.sm },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  sectionsHeading: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: SPACING.sm },
  sectionRow: { backgroundColor: COLORS.surface, borderRadius: RADII.button, padding: SPACING.sm, marginBottom: SPACING.xs },
  sectionName: { fontSize: 14, color: COLORS.text },
  subscribedIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  subscribedText: { fontSize: 14, color: COLORS.textMuted },
});
