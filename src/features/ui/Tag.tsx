import { Pressable, Text, View, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from './theme';

export interface TagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Tag({ label, selected = false, onPress }: TagProps) {
  const containerStyle = [
    styles.pill,
    selected ? styles.pillSelected : styles.pillDefault,
  ];

  const textStyle = [
    TYPOGRAPHY.caption,
    { color: selected ? COLORS.accent : COLORS.textMuted },
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={containerStyle}>
        <Text style={textStyle}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillDefault: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  pillSelected: {
    backgroundColor: COLORS.accent + '1A',
    borderColor: COLORS.accent,
  },
});
