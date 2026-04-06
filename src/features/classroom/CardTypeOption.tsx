import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING } from '@/features/ui/theme';

interface CardTypeOptionProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

export function CardTypeOption({ icon, title, description, onPress }: CardTypeOptionProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={COLORS.accent} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
