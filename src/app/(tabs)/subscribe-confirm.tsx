import { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSubscribe } from '@/features/student/useSubscribe';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

export default function SubscribeConfirmScreen() {
  const { id, name, price } = useLocalSearchParams<{ id: string; name: string; price: string }>();
  const mutation = useSubscribe();
  const [showConfetti, setShowConfetti] = useState(false);
  const { width } = Dimensions.get('window');

  const priceCents = parseInt(price ?? '0', 10);
  const priceDisplay = `R${priceCents / 100}/month`;
  const classroomName = decodeURIComponent(name ?? '');

  function handleSubscribe() {
    if (!id) return;
    mutation.mutate(
      { classroomId: id },
      {
        onSuccess: () => {
          setShowConfetti(true);
          // D-10: navigate back to detail screen after confetti animates out
          router.back();
        },
      }
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — back button + title */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.heading, { color: COLORS.text }]}>Subscribe</Text>
      </View>

      {/* Centred content — D-09 layout */}
      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.heading, { color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs }]}>{classroomName}</Text>
        <Text style={[TYPOGRAPHY.subheading, { color: COLORS.primary, textAlign: 'center', marginBottom: SPACING.md }]}>{priceDisplay}</Text>
        {/* D-11: calm copy, no exclamation marks, no urgency */}
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 24 }]}>
          You'll get full access to all sections and materials in this classroom.
        </Text>

        <Button
          variant="primary"
          title="Subscribe"
          onPress={handleSubscribe}
          disabled={mutation.isPending}
        />

        <Button
          variant="ghost"
          title="Maybe later"
          onPress={() => router.back()}
        />
      </View>

      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: -20 }}
          autoStart
          fadeOut
          colors={[COLORS.accent, COLORS.accentSecondary, COLORS.primary, COLORS.textOnAccent]}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg },
});
