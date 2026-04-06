import { SafeAreaView, ScrollView, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAllClassrooms } from '@/features/student/useAllClassrooms';
import { useMySubscriptions } from '@/features/student/useMySubscriptions';
import { ClassroomCard } from '@/features/student/ClassroomCard';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function HomeScreen() {
  const { data: classrooms = [], isLoading, isError } = useAllClassrooms();
  const { data: subscriptions = [] } = useMySubscriptions();

  // Compute subscribed and unsubscribed classroom lists
  const subscribedIds = new Set(subscriptions.filter(s => s.status === 'active').map(s => s.classroom_id));
  const subscribedClassrooms = classrooms.filter(c => subscribedIds.has(c.id));
  const browseClassrooms = classrooms.filter(c => !subscribedIds.has(c.id));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* "Your Classrooms" section — D-02, D-05 — only shown when subscriptions exist */}
        {subscribedClassrooms.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccentBar} />
              <Text style={styles.sectionLabel}>Your Classrooms</Text>
            </View>
            {subscribedClassrooms.map(c => (
              <ClassroomCard
                key={c.id}
                id={c.id}
                name={c.name}
                tutorEmail={c.tutors?.profiles?.email ?? ''}
                subjects={c.subjects}
                bio={c.bio}
                priceCents={c.price_cents}
              />
            ))}
            <View style={styles.divider} />
          </>
        )}

        {/* "Browse Classrooms" section — D-04 */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionAccentBar} />
          <Text style={styles.sectionLabel}>Browse Classrooms</Text>
        </View>

        {isLoading && (
          <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
        )}

        {isError && !isLoading && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateBody}>Couldn't load classrooms. Pull down to refresh.</Text>
          </View>
        )}

        {!isLoading && !isError && browseClassrooms.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateHeading}>No classrooms yet</Text>
            <Text style={styles.stateBody}>Check back soon — tutors are setting up their classrooms.</Text>
          </View>
        )}

        {!isLoading && !isError && browseClassrooms.map(c => (
          <ClassroomCard
            key={c.id}
            id={c.id}
            name={c.name}
            tutorEmail={c.tutors?.profiles?.email ?? ''}
            subjects={c.subjects}
            bio={c.bio}
            priceCents={c.price_cents}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, marginBottom: SPACING.sm },
  sectionAccentBar: { width: 4, height: 16, backgroundColor: COLORS.accent, marginRight: SPACING.xs, borderRadius: 2 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  loader: { marginTop: SPACING.xl },
  stateContainer: { alignItems: 'center', marginTop: SPACING.xl, paddingHorizontal: SPACING.lg },
  stateHeading: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  stateBody: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
});
