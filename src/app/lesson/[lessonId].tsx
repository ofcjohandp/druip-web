import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LessonEngine } from '@/features/study/LessonEngine';
import { COLORS } from '@/features/ui/theme';
import { supabase } from '@/lib/supabase';

export default function LessonScreen() {
  const { lessonId, topicId } = useLocalSearchParams<{ lessonId: string; topicId: string }>();

  // Fetch lesson record for xpReward
  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons')
        .select('xp_reward, topic_id')
        .eq('id', lessonId)
        .single()
        .throwOnError();
      return data;
    },
    enabled: !!lessonId,
  });

  const resolvedTopicId = topicId || lesson?.topic_id || '';

  if (!lesson) return null; // Loading — LessonEngine handles its own loading state for questions

  return (
    <View style={styles.container}>
      <LessonEngine
        lessonId={lessonId}
        topicId={resolvedTopicId}
        xpReward={lesson.xp_reward}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});
