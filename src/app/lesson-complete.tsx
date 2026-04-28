import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
import { useCompleteLesson } from '@/features/study/useCompleteLesson';
import { useProfile } from '@/features/study/useProfile';
import { useAuthStore } from '@/features/auth/useAuthStore';

export default function LessonCompleteScreen() {
  const router = useRouter();
  const { score, total, lessonId, topicId, xpReward } = useLocalSearchParams<{
    score: string;
    total: string;
    lessonId: string;
    topicId: string;
    xpReward: string;
  }>();

  const session = useAuthStore((s) => s.session);
  const { data: profile } = useProfile(session?.user.id);
  const completeLesson = useCompleteLesson();

  useEffect(() => {
    if (session?.user.id && lessonId && !completeLesson.isSuccess && !completeLesson.isPending) {
      completeLesson.mutate({
        lessonId,
        userId: session.user.id,
        score: parseInt(score, 10),
        total: parseInt(total, 10),
      });
    }
  }, [session?.user.id, lessonId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.xpLabel}>XP earned</Text>
        <Text style={styles.xpValue}>{xpReward}</Text>

        <Text style={styles.scoreText}>
          {score} of {total} correct
        </Text>

        <Text style={styles.streakText}>
          Current streak: {profile?.streak_count ?? 0} days
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.replace(`/(tabs)/study/${topicId}`)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  xpLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textMuted,
  },
  xpValue: {
    fontSize: 28,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  scoreText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  streakText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  continueButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    minHeight: 48,
    borderRadius: RADII.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textOnAccent,
    textAlign: 'center',
  },
});
