import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Your readiness and stats will appear here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  title: { fontSize: 24, fontFamily: 'Syne_800ExtraBold', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center' },
});
