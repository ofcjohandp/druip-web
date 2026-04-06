import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

interface FeedbackPanelProps {
  isVisible: boolean;
  isCorrect: boolean;
  correctOptionText: string; // the text of the correct answer
  explanation: string | null; // CONT-06 guarantees this exists for published questions
  onContinue: () => void;
}

export function FeedbackPanel({
  isVisible,
  isCorrect,
  correctOptionText,
  explanation,
  onContinue,
}: FeedbackPanelProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [isVisible, slideAnim]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}>
      {isCorrect ? (
        <Text style={styles.correctText}>Correct!</Text>
      ) : (
        <View>
          <Text style={styles.wrongHeader}>Correct answer: {correctOptionText}</Text>
          {explanation ? (
            <Text style={styles.explanationText}>{explanation}</Text>
          ) : null}
        </View>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: RADII.modal,
    borderTopRightRadius: RADII.modal,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
  },
  correctText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
  },
  wrongHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  explanationText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  continueButton: {
    backgroundColor: COLORS.accent,
    minHeight: 48,
    borderRadius: RADII.button,
    marginTop: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textOnAccent,
    textAlign: 'center',
  },
});
