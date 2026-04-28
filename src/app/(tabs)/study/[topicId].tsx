import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING } from '@/features/ui/theme';
import { WindowedFlatList } from '@/features/ui/WindowedFlatList';
import { LessonListItem } from '@/features/study/LessonListItem';
import { useLessons } from '@/features/study/useLessons';
import { useUserLessonProgress } from '@/features/study/useUserLessonProgress';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type LessonsRow = Database['public']['Tables']['lessons']['Row'];

type LessonState = 'locked' | 'completed' | 'current' | 'unlocked';

function getLessonState(
  lesson: LessonsRow,
  index: number,
  lessons: LessonsRow[],
  completedIds: Set<string>
): LessonState {
  if (completedIds.has(lesson.id)) return 'completed';
  // First lesson is always unlocked/current
  if (index === 0) return 'current';
  // Check if previous lesson is completed
  const prevLesson = lessons[index - 1];
  if (!completedIds.has(prevLesson.id)) return 'locked';
  // First non-completed lesson after a completed sequence = current
  return 'current';
}

export default function LessonListScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;

  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(topicId);
  const lessonIds = lessons.map((l) => l.id);
  const { data: progressRows = [], isLoading: progressLoading } = useUserLessonProgress(
    userId,
    lessonIds
  );

  const isLoading = lessonsLoading || progressLoading;

  // Build a set of completed lesson IDs
  const completedIds = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.lesson_id)
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (lessons.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyHeading}>No published lessons yet</Text>
          <Text style={styles.emptyBody}>This topic has no published lessons yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item, index }: { item: LessonsRow; index: number }) => {
    const state = getLessonState(item, index, lessons, completedIds);
    return (
      <LessonListItem
        lesson={item}
        state={state}
        onPress={() => {
          if (state !== 'locked') {
            router.push(`/lesson/${item.id}?topicId=${topicId}`);
          }
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <WindowedFlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  emptyHeading: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  emptyBody: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  list: { padding: SPACING.md },
});
