import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/features/ui/theme';

interface SubscriberRowProps {
  studentName: string;
  hasUnread: boolean;
  onPress: () => void;
}

export function SubscriberRow({ studentName, hasUnread, onPress }: SubscriberRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${studentName}, tap to open messages`}
      accessibilityRole="button"
    >
      <Text style={styles.name}>{studentName}</Text>
      {hasUnread && (
        <View
          style={styles.unreadDot}
          accessibilityLabel="Unread messages"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  name: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: SPACING.md,
  },
});
