import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useStudentProfile } from '@/features/onboarding/useStudentProfile';
import { useProfile } from '@/features/study/useProfile';
import { useMySubscriptions } from '@/features/student/useMySubscriptions';
import { COLORS, SPACING, TYPOGRAPHY, RADII } from '@/features/ui/theme';

const TIPS = [
  'Short study sessions beat marathon cramming every time.',
  'Teaching a concept out loud is the fastest way to find gaps in your knowledge.',
  'Sleep is when your brain actually consolidates what you studied.',
  'Active recall beats re-reading by a mile — close your notes and test yourself.',
  'Review yesterday\'s work before starting today\'s. That gap is what makes it stick.',
  'One focused hour beats three distracted ones.',
  'Your test date is a deadline, not a surprise. Plan backwards from it.',
];

function getDailyTip() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return TIPS[dayOfYear % TIPS.length];
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getGreeting(name?: string | null) {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  return name ? `${prefix}, ${name}` : prefix;
}

export default function HomeScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);
  const { data: studentProfile } = useStudentProfile();
  const { data: profile } = useProfile(userId);
  const { data: subscriptions = [] } = useMySubscriptions();

  const activeSubscription = subscriptions.find((s) => s.status === 'active');
  const testDate = studentProfile?.upcoming_test_date;
  const daysUntil = testDate ? getDaysUntil(testDate) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={styles.header}>
          <Text style={[TYPOGRAPHY.display, { color: COLORS.text }]}>
            {getGreeting(studentProfile?.first_name)}
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 4 }]}>
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[TYPOGRAPHY.heading, { color: COLORS.text }]}>{profile?.streak_count ?? 0}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>day streak</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={[TYPOGRAPHY.heading, { color: COLORS.text }]}>{profile?.total_xp ?? 0}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>total XP</Text>
          </View>
        </View>

        {/* Test countdown */}
        {daysUntil !== null ? (
          <View style={styles.countdownCard}>
            <Text style={styles.sectionLabel}>TEST COMING UP</Text>
            <View style={styles.countdownRow}>
              <Text style={styles.countdownNumber}>{Math.max(0, daysUntil)}</Text>
              <Text style={[TYPOGRAPHY.subheading, { color: COLORS.textMuted, marginLeft: SPACING.sm, alignSelf: 'flex-end', marginBottom: 6 }]}>
                {daysUntil === 1 ? 'day left' : 'days left'}
              </Text>
            </View>
            {daysUntil <= 0 && (
              <Text style={[TYPOGRAPHY.label, { color: COLORS.accent }]}>Today is the day. You've got this.</Text>
            )}
            {daysUntil > 0 && daysUntil <= 7 && (
              <Text style={[TYPOGRAPHY.label, { color: COLORS.accent }]}>This week. Study every day.</Text>
            )}
          </View>
        ) : (
          <Pressable style={styles.countdownCard} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.sectionLabel}>NO TEST DATE SET</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.text, marginTop: 4 }]}>
              Tap to add your upcoming test date →
            </Text>
          </Pressable>
        )}

        {/* Tip of the day */}
        <View style={styles.tipCard}>
          <Text style={[styles.sectionLabel, { color: COLORS.accent }]}>TIP OF THE DAY</Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.text, marginTop: SPACING.xs }]}>
            {getDailyTip()}
          </Text>
        </View>

        {/* CTA */}
        <Pressable
          style={styles.ctaButton}
          onPress={() => {
            if (activeSubscription) {
              router.push(`/(tabs)/classroom-detail?id=${activeSubscription.classroom_id}`);
            } else {
              router.push('/(tabs)/study');
            }
          }}
        >
          <Text style={[TYPOGRAPHY.subheading, { color: COLORS.textOnAccent, fontSize: 17 }]}>
            {activeSubscription ? 'Go to my classroom →' : 'Find a tutor →'}
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  header: { marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.card,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: { fontSize: 24, marginBottom: 2 },
  countdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  countdownRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: SPACING.xs },
  countdownNumber: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 56,
    lineHeight: 64,
    color: COLORS.text,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  sectionLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.button,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
});
