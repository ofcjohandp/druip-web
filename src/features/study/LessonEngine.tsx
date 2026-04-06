import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useStudySessionStore } from '@/features/study/useStudySessionStore';
import { useLessonQuestions } from '@/features/study/useLessonQuestions';
import { QuestionCard } from '@/features/study/QuestionCard';
import { FeedbackPanel } from '@/features/study/FeedbackPanel';
import { COLORS, SPACING } from '@/features/ui/theme';

interface LessonEngineProps {
  lessonId: string;
  topicId: string; // threaded for lesson-complete CTA navigation
  xpReward: number; // from lesson record
}

export function LessonEngine({ lessonId, topicId, xpReward }: LessonEngineProps) {
  const router = useRouter();
  const { data: questions, isLoading, isError } = useLessonQuestions(lessonId);

  const { currentIndex, answers, score, isLocked, questions: sessionQuestions, initSession, clearSession } =
    useStudySessionStore();

  useEffect(() => {
    if (questions && questions.length > 0) {
      initSession(lessonId, questions);
    }
    return () => {
      clearSession();
    };
  }, [questions, lessonId]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (isError || !questions || questions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Couldn't load this lesson. Check your connection and try again.
        </Text>
      </View>
    );
  }

  const question = sessionQuestions[currentIndex];

  if (!question) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const options = (question.options as string[]).slice(0, 4);
  const selectedOption = answers[currentIndex] ?? null;
  const progress = (currentIndex + (isLocked ? 1 : 0)) / sessionQuestions.length;

  const handleAnswer = (selectedIndex: number) => {
    // CRITICAL: synchronous lock BEFORE any async work (STUDY-04 — 150ms contract)
    const isCorrect = selectedIndex === question.correct_option_index;
    useStudySessionStore.getState().lockAnswer(selectedIndex, isCorrect);
  };

  const handleContinue = () => {
    const isLastQuestion = currentIndex >= sessionQuestions.length - 1;
    if (isLastQuestion) {
      // Navigate to lesson-complete — router.replace prevents back-swipe to completed session (D-09)
      router.replace({
        pathname: '/lesson-complete',
        params: {
          score: String(score),
          total: String(sessionQuestions.length),
          lessonId,
          topicId,
          xpReward: String(xpReward),
        },
      });
    } else {
      useStudySessionStore.getState().advance();
    }
  };

  return (
    <View style={styles.container}>
      <QuestionCard
        questionText={question.question_text}
        options={options}
        correctIndex={question.correct_option_index}
        isLocked={isLocked}
        selectedOption={selectedOption}
        onSelectOption={handleAnswer}
        progress={progress}
        totalQuestions={sessionQuestions.length}
      />
      <FeedbackPanel
        isVisible={isLocked}
        isCorrect={selectedOption === question.correct_option_index}
        correctOptionText={options[question.correct_option_index] ?? ''}
        explanation={question.explanation}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
