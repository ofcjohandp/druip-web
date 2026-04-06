import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADII, SPACING } from './theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,       // D-14: minimum 16px inside cards
  },
});
