import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPACING, TYPOGRAPHY, RADII } from '@/features/ui/theme';
import { WindowedFlatList } from '@/features/ui/WindowedFlatList';
import { TopicCard } from '@/features/study/TopicCard';
import { useTopics } from '@/features/study/useTopics';
import { useModuleLessonCounts } from '@/features/study/useModuleLessonCounts';
import { useUserLessonProgress } from '@/features/study/useUserLessonProgress';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useMySubscriptions } from '@/features/student/useMySubscriptions';
import { useAllClassrooms } from '@/features/student/useAllClassrooms';
import { ClassroomCard } from '@/features/student/ClassroomCard';
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

  // Classrooms
  const { data: subscriptions = [] } = useMySubscriptions();
  const { data: allClassrooms = [], isLoading: classroomsLoading } = useAllClassrooms();

  const subscribedIds = new Set(subscriptions.filter((s) => s.status === 'active').map((s) => s.classroom_id));
  const subscribedClassrooms = allClassrooms.filter((c) => subscribedIds.has(c.id));
  const browseClassrooms = allClassrooms.filter((c) => !subscribedIds.has(c.id));

  // Topics/lessons
  const { data: moduleId, isLoading: moduleLoading } = useFirstModule();
  const { data: topics = [], isLoading: topicsLoading } = useTopics(moduleId ?? '');
  const { data: lessonCountsMap = {} } = useModuleLessonCounts(moduleId ?? '');
  const allLessonIds = Object.values(lessonCountsMap).flat();
  const { data: progressRows = [] } = useUserLessonProgress(userId, allLessonIds);
  const completedLessonIds = new Set(progressRows.filter((p) => p.completed).map((p) => p.lesson_id));

  const isLoading = moduleLoading || topicsLoading || classroomsLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View>
      {/* My Classrooms */}
      {subscribedClassrooms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Classroom</Text>
          {subscribedClassrooms.map((c) => (
            <ClassroomCard
              key={c.id}
              id={c.id}
              name={c.name}
              tutorEmail={c.tutors?.profiles?.email ?? ''}
              subjects={c.subjects}
              bio={c.bio}
              priceCents={c.price_cents}
            />
          ))}
        </View>
      )}

      {/* Browse */}
      {browseClassrooms.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {subscribedClassrooms.length > 0 ? 'More Classrooms' : 'Browse Classrooms'}
          </Text>
          {browseClassrooms.map((c) => (
            <ClassroomCard
              key={c.id}
              id={c.id}
              name={c.name}
              tutorEmail={c.tutors?.profiles?.email ?? ''}
              subjects={c.subjects}
              bio={c.bio}
              priceCents={c.price_cents}
            />
          ))}
        </View>
      )}

      {allClassrooms.length === 0 && (
        <View style={[styles.section, styles.emptyState]}>
          <Text style={[TYPOGRAPHY.subheading, { color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs }]}>
            No classrooms yet
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center' }]}>
            Tutors are setting up their classrooms. Check back soon.
          </Text>
        </View>
      )}

      {/* Topics divider */}
      {topics.length > 0 && (
        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Study Topics</Text>
      )}
    </View>
  );

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
      <View style={styles.screenHeader}>
        <Text style={[TYPOGRAPHY.display, { color: COLORS.text }]}>Study</Text>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, marginTop: 4 }]}>
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>
      <WindowedFlatList
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  section: { marginBottom: SPACING.sm },
  sectionTitle: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.card,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  screenHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
});
