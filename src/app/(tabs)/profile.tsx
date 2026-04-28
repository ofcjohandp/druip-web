import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, RADII } from '@/features/ui/theme';
import { Button } from '@/features/ui/Button';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useProfile } from '@/features/study/useProfile';
import { useStudentProfile } from '@/features/onboarding/useStudentProfile';
import { useClassroom } from '@/features/tutor/useClassroom';
import { supabase } from '@/lib/supabase';

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function AvatarBlock({ photoUrl, firstName, lastName }: { photoUrl?: string | null; firstName?: string | null; lastName?: string | null }) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join('') || '?';

  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={styles.avatarImage} />;
  }

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>{initials}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);
  const userEmail = useAuthStore((s) => s.session?.user?.email);
  const { data: profile } = useProfile(userId);
  const { data: studentProfile } = useStudentProfile();
  const { data: classroom } = useClassroom();

  const isTutor = profile?.is_tutor;
  const fullName = [studentProfile?.first_name, studentProfile?.last_name].filter(Boolean).join(' ');
  const testDate = studentProfile?.upcoming_test_date;
  const daysUntil = testDate ? getDaysUntil(testDate) : null;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Student card */}
        <View style={styles.card}>
          <AvatarBlock
            photoUrl={studentProfile?.photo_url}
            firstName={studentProfile?.first_name}
            lastName={studentProfile?.last_name}
          />

          <Text style={styles.name}>{fullName || userEmail || 'Student'}</Text>

          {(studentProfile?.university || studentProfile?.degree) && (
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center', marginTop: 2 }]}>
              {[studentProfile.university, studentProfile.degree].filter(Boolean).join(' · ')}
            </Text>
          )}

          {isTutor && (
            <View style={styles.tutorBadge}>
              <Text style={styles.tutorBadgeText}>Tutor</Text>
            </View>
          )}

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{profile?.streak_count ?? 0}</Text>
              <Text style={styles.statLabel}>streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={styles.statValue}>{profile?.total_xp ?? 0}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📅</Text>
              <Text style={styles.statValue}>
                {daysUntil !== null ? (daysUntil <= 0 ? 'Today' : `${daysUntil}d`) : '—'}
              </Text>
              <Text style={styles.statLabel}>test</Text>
            </View>
          </View>
        </View>

        {/* Tutor classroom shortcut */}
        {isTutor && classroom && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MY CLASSROOM</Text>
            <View style={styles.settingsCard}>
              <Button
                title={classroom.name}
                variant="ghost"
                icon="school-outline"
                onPress={() => router.push('/(tabs)/manage-classroom')}
              />
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.settingsCard}>
            <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textMuted, paddingHorizontal: SPACING.md, paddingTop: SPACING.sm }]}>
              {userEmail}
            </Text>
            <Button
              title="Sign out"
              variant="ghost"
              icon="log-out-outline"
              onPress={handleSignOut}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xl },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.card,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: SPACING.md,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarInitials: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 32,
    color: COLORS.textOnAccent,
  },
  name: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
  },
  tutorBadge: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.accent + '26',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
  },
  tutorBadgeText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: COLORS.accent,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statValue: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 22,
    color: COLORS.text,
  },
  statLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },

  section: { marginBottom: SPACING.md },
  sectionLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    paddingHorizontal: 4,
  },
  settingsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.card,
    overflow: 'hidden',
  },
});
