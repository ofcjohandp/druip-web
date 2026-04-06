import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPACING } from '@/features/ui/theme';
import { WindowedFlatList } from '@/features/ui/WindowedFlatList';
import { TopicCard } from '@/features/study/TopicCard';
import { useTopics } from '@/features/study/useTopics';
import { useModuleLessonCounts } from '@/features/study/useModuleLessonCounts';
import { useUserLessonProgress } from '@/features/study/useUserLessonProgress';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type TopicsRow = Database['public']['Tables']['topics']['Row'];

function useFirstModule() {
  return useQuery({
    queryKey: ['first-module'],
    queryFn: async () => {
      const { data } = await supabase
        .from('modules')
        .select('id')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .throwOnError();
      return data?.[0]?.id ?? null;
    },
    staleTime: 60 * 60 * 1000,
  });
}

export default function StudyScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;

  const { data: moduleId, isLoading: moduleLoading } = useFirstModule();
  const { data: topics = [], isLoading: topicsLoading } = useTopics(moduleId ?? '');
  const { data: lessonCountsMap = {} } = useModuleLessonCounts(moduleId ?? '');

  // Gather all lesson IDs for this module to fetch user progress in one query
  const allLessonIds = Object.values(lessonCountsMap).flat();
  const { data: progressRows = [] } = useUserLessonProgress(userId, allLessonIds);

  const isLoading = moduleLoading || topicsLoading;

  // Build a set of completed lesson IDs
  const completedLessonIds = new Set(
    progressRows.filter((p) => p.completed).map((p) => p.lesson_id)
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading topics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (topics.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyHeading}>Study content is being prepared</Text>
          <Text style={styles.emptyBody}>Check back soon.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: TopicsRow }) => {
    const topicLessonIds = lessonCountsMap[item.id] ?? [];
    const lessonsTotal = topicLessonIds.length;
    const lessonsDone = topicLessonIds.filter((id) => completedLessonIds.has(id)).length;

    return (
      <TopicCard
        topic={item}
        lessonsDone={lessonsDone}
        lessonsTotal={lessonsTotal}
        onPress={() => router.push(`/(tabs)/study/${item.id}`)}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <WindowedFlatList
        data={topics}
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
  loadingText: { fontSize: 14, color: COLORS.textMuted, marginTop: SPACING.xs },
  emptyHeading: { fontSize: 16, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  emptyBody: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  list: { padding: SPACING.md },
});
