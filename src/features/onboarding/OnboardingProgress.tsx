import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/features/ui/theme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i + 1 <= currentStep && styles.segmentActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4, marginBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  segmentActive: { backgroundColor: COLORS.accent },
});
