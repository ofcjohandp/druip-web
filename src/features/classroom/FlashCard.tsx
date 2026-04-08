// src/features/classroom/FlashCard.tsx
// Reanimated v4 flip card — RICH-01
// Source: https://docs.swmansion.com/react-native-reanimated/examples/flipCard/
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';

interface FlashCardProps {
  front: string;
  back: string;
}

export function FlashCard({ front, back }: FlashCardProps) {
  const isFlipped = useSharedValue(false);

  const frontAnim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: withTiming(
          `${interpolate(Number(isFlipped.value), [0, 1], [0, 180])}deg`,
          { duration: 400 }
        ),
      },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backAnim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: withTiming(
          `${interpolate(Number(isFlipped.value), [0, 1], [180, 360])}deg`,
          { duration: 400 }
        ),
      },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        // Toggle outside animated style — never mutate isFlipped.value inside useAnimatedStyle
        isFlipped.value = !isFlipped.value;
      }}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Flashcard — tap to flip"
    >
      <View style={styles.container}>
        <Animated.View style={[styles.face, frontAnim]}>
          <Text style={styles.text}>{front}</Text>
          <Text style={styles.hint}>Tap to flip</Text>
        </Animated.View>
        <Animated.View style={[styles.face, styles.backFace, backAnim]}>
          <Text style={styles.text}>{back}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 160,
    position: 'relative',
  },
  face: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backFace: {
    backgroundColor: COLORS.accent,
  },
  text: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
});
