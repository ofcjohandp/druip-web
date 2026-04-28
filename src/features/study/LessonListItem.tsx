import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';
import type { Database } from '@/types/database';

type LessonsRow = Database['public']['Tables']['lessons']['Row'];

type LessonState = 'locked' | 'completed' | 'current' | 'unlocked';

interface LessonListItemProps {
  lesson: LessonsRow;
  state: LessonState;
  onPress: () => void;
}

export function LessonListItem({ lesson, state, onPress }: LessonListItemProps) {
  const isLocked = state === 'locked';
  const isCompleted = state === 'completed';
  const isCurrent = state === 'current';

  return (
    <TouchableOpacity
      style={[
        styles.item,
        isLocked && styles.itemLocked,
        isCurrent && styles.itemCurrent,
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.name,
          (isLocked || isCompleted) && styles.nameMuted,
        ]}
      >
        {lesson.name}
      </Text>
      {isLocked && (
        <Ionicons name="lock-closed" size={18} color={COLORS.textMuted} />
      )}
      {isCompleted && (
        <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: 48,
  },
  itemLocked: {
    opacity: 0.5,
  },
  itemCurrent: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.xs,
  },
  nameMuted: {
    color: COLORS.textMuted,
  },
});
