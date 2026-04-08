import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

interface TagBubbleSelectProps {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function TagBubbleSelect({ options, selected, onToggle }: TagBubbleSelectProps) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onToggle(opt.id)}
            style={[styles.bubble, isSelected && styles.bubbleSelected]}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  bubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADII.button,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bubbleSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  text: { fontSize: 14, color: COLORS.text },
  textSelected: { color: COLORS.textOnAccent },
});
