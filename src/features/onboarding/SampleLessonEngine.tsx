import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';
import { SAMPLE_QUESTIONS } from './sampleQuestions';

interface SampleLessonEngineProps {
  onComplete: (score: number, total: number) => void;
}

export function SampleLessonEngine({ onComplete }: SampleLessonEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);

  const question = SAMPLE_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === SAMPLE_QUESTIONS.length - 1;

  const handleOptionPress = useCallback(
    (optionIndex: number) => {
      if (isLocked) return;
      setSelectedOption(optionIndex);
      setIsLocked(true);
      if (optionIndex === question.correctOptionIndex) {
        setScore((s) => s + 1);
      }
    },
    [isLocked, question.correctOptionIndex]
  );

  const handleContinue = useCallback(() => {
    if (isLastQuestion) {
      // score was already incremented in handleOptionPress
      onComplete(score, SAMPLE_QUESTIONS.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsLocked(false);
    }
  }, [isLastQuestion, onComplete, score]);

  const getOptionStyle = (index: number) => {
    if (!isLocked || selectedOption === null) return styles.option;
    if (index === question.correctOptionIndex) return [styles.option, styles.optionCorrect];
    if (index === selectedOption && index !== question.correctOptionIndex)
      return [styles.option, styles.optionWrong];
    return styles.option;
  };

  const progress = (currentIndex + (isLocked ? 1 : 0)) / SAMPLE_QUESTIONS.length;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Question */}
      <Text style={styles.questionText}>{question.questionText}</Text>

      {/* Options */}
      {question.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={getOptionStyle(index)}
          onPress={() => handleOptionPress(index)}
          disabled={isLocked}
          activeOpacity={0.7}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      {/* Feedback + Continue */}
      {isLocked && (
        <View style={styles.feedbackContainer}>
          {selectedOption !== question.correctOptionIndex && (
            <Text style={styles.explanationText}>{question.explanation}</Text>
          )}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>{isLastQuestion ? 'See results' : 'Continue'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: COLORS.accent, borderRadius: 3 },
  questionText: { fontSize: 20, fontFamily: 'Nunito_600SemiBold', color: COLORS.text, marginBottom: SPACING.lg, lineHeight: 28 },
  option: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.card,
    marginBottom: SPACING.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  optionCorrect: { backgroundColor: COLORS.successSurface, borderWidth: 2, borderColor: COLORS.success },
  optionWrong: { backgroundColor: COLORS.errorSurface, borderWidth: 2, borderColor: COLORS.error },
  optionText: { fontSize: 16, color: COLORS.text },
  feedbackContainer: { marginTop: SPACING.lg },
  explanationText: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.md, lineHeight: 20 },
  continueButton: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    minHeight: 48,
  },
  continueButtonText: { color: COLORS.textOnAccent, fontSize: 16, fontFamily: 'Nunito_600SemiBold' },
});
