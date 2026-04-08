import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';
import { Card } from '@/features/ui/Card';
import { Avatar } from '@/features/ui/Avatar';
import { Button } from '@/features/ui/Button';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useProfile } from '@/features/study/useProfile';
import { useClassroom } from '@/features/tutor/useClassroom';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);
  const userEmail = useAuthStore((s) => s.session?.user?.email);
  const { data: profile } = useProfile(userId);
  const { data: classroom } = useClassroom();

  const isTutor = profile?.is_tutor;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <Avatar name={userEmail} size={64} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileEmail}>{userEmail ?? ''}</Text>
            {isTutor && (
              <Text style={styles.profileRole}>Tutor</Text>
            )}
          </View>
        </View>

        {isTutor && classroom ? (
          <>
            <Text style={styles.sectionLabel}>My Classroom</Text>
            <Card
              pressable
              onPress={() => router.push('/(tabs)/manage-classroom')}
              style={styles.classroomCard}
            >
              <Ionicons name="school" size={24} color={COLORS.accent} />
              <View style={styles.classroomCardText}>
                <Text style={styles.classroomName}>{classroom.name}</Text>
                <Text style={styles.classroomSubtext}>Manage your classroom</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </Card>
          </>
        ) : (
          <Text style={styles.subtitle}>Your profile and settings will appear here</Text>
        )}

        <Button
          title="Sign out"
          variant="ghost"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: {
    ...TYPOGRAPHY.heading,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  profileRole: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  classroomCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classroomCardText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  sectionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  classroomName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  classroomSubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  signOutButton: {
    marginTop: SPACING.xl,
  },
});
