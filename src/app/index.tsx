import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>Druip</Text>
        <Text style={styles.tagline}>Study smarter, not harder</Text>
      </View>
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/(auth)/sign-in')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpLink} onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.signUpText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  logo: { fontSize: 48, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  tagline: { fontSize: 18, color: COLORS.textMuted, textAlign: 'center' },
  ctaContainer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  ctaButton: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    minHeight: 48,
  },
  ctaText: { color: COLORS.textOnAccent, fontSize: 18, fontWeight: '600' },
  signUpLink: { marginTop: SPACING.md, alignItems: 'center' },
  signUpText: { color: COLORS.textMuted, fontSize: 14 },
});
