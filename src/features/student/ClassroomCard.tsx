import { Pressable, View, Text, ScrollView, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Avatar } from '@/features/ui/Avatar';
import { Tag } from '@/features/ui/Tag';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

interface ClassroomCardProps {
  id: string;
  name: string;
  tutorEmail: string;
  subjects: string[];
  bio: string | null;
  priceCents: number;
}

export function ClassroomCard({ id, name, tutorEmail, subjects, bio, priceCents }: ClassroomCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={() => router.push(`/(tabs)/classroom-detail?id=${id}`)}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Avatar + name row */}
        <View style={styles.avatarRow}>
          <Avatar name={tutorEmail} size={40} />
          <View style={styles.nameStack}>
            <Text style={[TYPOGRAPHY.subheading, { color: COLORS.text }]}>{name}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: COLORS.textMuted }]}>{tutorEmail}</Text>
          </View>
        </View>

        {/* Subject tag pills */}
        {subjects.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsScroll}
            contentContainerStyle={styles.tagsContent}
          >
            {subjects.map((subject) => (
              <Tag key={subject} label={subject} />
            ))}
          </ScrollView>
        )}

        {/* Bio */}
        {bio != null && (
          <Text style={[TYPOGRAPHY.bodySmall, { color: COLORS.textMuted, marginTop: SPACING.xs }]} numberOfLines={2}>
            {bio}
          </Text>
        )}

        {/* Price badge */}
        <View style={styles.priceBadge}>
          <Text style={[TYPOGRAPHY.caption, { color: COLORS.textOnAccent, fontWeight: '600' }]}>
            R{priceCents / 100}/mo
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nameStack: {
    flex: 1,
  },
  tagsScroll: {
    marginTop: SPACING.xs,
  },
  tagsContent: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADII.button,
  },
});
