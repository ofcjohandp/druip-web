import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

type GoalOption = { key: 'chill' | 'steady' | 'focused'; label: string; description: string; lessons: number };

const GOALS: GoalOption[] = [
  { key: 'chill', label: 'Chill', description: '1 lesson per day', lessons: 1 },
  { key: 'steady', label: 'Steady', description: '2 lessons per day', lessons: 2 },
  { key: 'focused', label: 'Focused', description: '3 lessons per day', lessons: 3 },
];

export default function GoalSelectionScreen() {
  const session = useAuthStore((s) => s.session);

  const handleSelectGoal = async (goal: GoalOption) => {
    // D-08: Single tap — no confirmation step. Tapping advances immediately.
    // D-09: Store selected goal in profiles table
    if (session?.user?.id) {
      await supabase.from('profiles').update({ daily_goal: goal.key }).eq('id', session.user.id);
    }
    // Navigate to the app shell (tabs)
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set your daily goal</Text>
        <Text style={styles.subtitle}>You can change this anytime</Text>

        {GOALS.map((goal) => (
          <TouchableOpacity
            key={goal.key}
            style={styles.goalCard}
            onPress={() => handleSelectGoal(goal)}
            activeOpacity={0.7}
          >
            <Text style={styles.goalLabel}>{goal.label}</Text>
            <Text style={styles.goalDescription}>{goal.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', padding: SPACING.lg },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.xl, textAlign: 'center' },
  goalCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADII.card,
    marginBottom: SPACING.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  goalLabel: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  goalDescription: { fontSize: 14, color: COLORS.textMuted },
});
