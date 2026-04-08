import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

interface QuestionCardProps {
  questionText: string;
  options: string[]; // already sliced to max 4 by caller
  correctIndex: number;
  isLocked: boolean;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  progress: number; // 0-1 fraction for progress bar
  totalQuestions: number;
}

export function QuestionCard({
  questionText,
  options,
  correctIndex,
  isLocked,
  selectedOption,
  onSelectOption,
  progress,
}: QuestionCardProps) {
  const getOptionStyle = (index: number) => {
    if (!isLocked) return styles.option;
    if (index === correctIndex) return [styles.option, styles.optionCorrect];
    if (index === selectedOption && index !== correctIndex) return [styles.option, styles.optionWrong];
    return styles.option;
  };

  const getTrailingIcon = (index: number) => {
    if (!isLocked) return null;
    if (index === correctIndex) {
      return <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />;
    }
    if (index === selectedOption && index !== correctIndex) {
      return <Ionicons name="close-circle" size={20} color={COLORS.error} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Question text */}
      <Text style={styles.questionText}>{questionText}</Text>

      {/* Answer options */}
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          testID={`option-${index}`}
          style={getOptionStyle(index)}
          onPress={() => onSelectOption(index)}
          disabled={isLocked}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.optionText}>{option}</Text>
          {getTrailingIcon(index)}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  option: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.card,
    marginBottom: SPACING.sm,
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionCorrect: {
    backgroundColor: COLORS.successSurface,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  optionWrong: {
    backgroundColor: COLORS.errorSurface,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    flex: 1,
  },
});
