import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

export default function SignUpPromptScreen() {
  const { score, total } = useLocalSearchParams<{ score: string; total: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.celebration}>Nice work!</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreText}>
            You scored {score}/{total}
          </Text>
        </View>
        <Text style={styles.subtitle}>Create an account to save your progress and keep learning</Text>
      </View>
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(auth)/sign-up')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryLink} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.secondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  celebration: { fontSize: 32, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  scoreCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADII.card,
    marginBottom: SPACING.lg,
    width: '100%',
    alignItems: 'center',
  },
  scoreText: { fontSize: 24, fontWeight: '600', color: COLORS.accent },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  ctaContainer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  ctaButton: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    minHeight: 48,
  },
  ctaText: { color: COLORS.textOnAccent, fontSize: 18, fontWeight: '600' },
  secondaryLink: { marginTop: SPACING.sm, alignItems: 'center' },
  secondaryText: { color: COLORS.textMuted, fontSize: 14 },
});
