import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING } from '@/features/ui/theme';
import { Card } from '@/features/ui/Card';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useProfile } from '@/features/study/useProfile';
import { useClassroom } from '@/features/tutor/useClassroom';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const userId = useAuthStore((s) => s.session?.user?.id);
  const { data: profile } = useProfile(userId);
  const { data: classroom } = useClassroom();

  const isTutor = profile?.is_tutor;

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {isTutor && classroom ? (
          <>
            <Text style={styles.sectionLabel}>My Classroom</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/manage-classroom')}
              accessibilityLabel="Open classroom manager"
            >
              <Card style={styles.classroomCard}>
                <Ionicons name="school" size={24} color={COLORS.accent} />
                <View style={styles.classroomCardText}>
                  <Text style={styles.classroomName}>{classroom.name}</Text>
                  <Text style={styles.classroomSubtext}>Manage your classroom</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </Card>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.subtitle}>Your profile and settings will appear here</Text>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.lg },
  classroomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  classroomCardText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginTop: SPACING.lg, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  classroomName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  classroomSubtext: { fontSize: 14, color: COLORS.textMuted },
  signOutButton: { marginTop: SPACING.xl, padding: SPACING.md, alignItems: 'center' },
  signOutText: { fontSize: 16, color: COLORS.textMuted },
});
