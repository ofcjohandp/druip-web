import { SafeAreaView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SampleLessonEngine } from '@/features/onboarding/SampleLessonEngine';
import { COLORS } from '@/features/ui/theme';

export default function SampleLessonScreen() {
  const handleComplete = (score: number, total: number) => {
    router.replace({ pathname: '/sign-up-prompt', params: { score: String(score), total: String(total) } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <SampleLessonEngine onComplete={handleComplete} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});
