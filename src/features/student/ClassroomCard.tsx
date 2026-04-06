import { TouchableOpacity, View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

interface ClassroomCardProps {
  id: string;
  name: string;
  tutorEmail: string;
  subjects: string[];
  bio: string | null;
  priceCents: number;
}

export function ClassroomCard({ id, name, tutorEmail, subjects, bio, priceCents }: ClassroomCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      accessibilityRole="button"
      onPress={() => router.push(`/(tabs)/classroom-detail?id=${id}`)}
    >
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.tutorEmail}>{tutorEmail}</Text>
      {subjects.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsContent}
        >
          {subjects.map((subject) => (
            <View key={subject} style={styles.tag}>
              <Text style={styles.tagText}>{subject}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      {bio != null && (
        <Text style={styles.bio} numberOfLines={2}>
          {bio}
        </Text>
      )}
      <Text style={styles.price}>R{priceCents / 100}/month</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  tutorEmail: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  tagsScroll: {
    marginTop: SPACING.xs,
  },
  tagsContent: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.button,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.xs,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  bio: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
});
