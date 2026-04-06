import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';
import type { Database } from '@/types/database';

type TopicsRow = Database['public']['Tables']['topics']['Row'];

export function getReadinessTier(done: number, total: number): string {
  if (total === 0 || done === 0) return 'Not Started';
  const pct = (done / total) * 100;
  if (pct < 50) return 'Learning';
  if (pct < 80) return 'Practicing';
  return 'Ready';
}

interface TopicCardProps {
  topic: TopicsRow;
  lessonsDone: number;
  lessonsTotal: number;
  onPress: () => void;
}

export function TopicCard({ topic, lessonsDone, lessonsTotal, onPress }: TopicCardProps) {
  const tier = getReadinessTier(lessonsDone, lessonsTotal);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.name}>{topic.name}</Text>
      <View style={styles.meta}>
        <Text style={styles.tier}>{tier}</Text>
        <Text style={styles.count}>
          {lessonsDone} of {lessonsTotal} lessons done
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: 48,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tier: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  count: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
