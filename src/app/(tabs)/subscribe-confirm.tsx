import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSubscribe } from '@/features/student/useSubscribe';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function SubscribeConfirmScreen() {
  const { id, name, price } = useLocalSearchParams<{ id: string; name: string; price: string }>();
  const mutation = useSubscribe();

  const priceCents = parseInt(price ?? '0', 10);
  const priceDisplay = `R${priceCents / 100}/month`;
  const classroomName = decodeURIComponent(name ?? '');

  function handleSubscribe() {
    if (!id) return;
    mutation.mutate(
      { classroomId: id },
      {
        onSuccess: () => {
          // D-10: navigate back to detail screen after subscribing
          router.back();
        },
      }
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — back button + title */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscribe</Text>
      </View>

      {/* Centred content — D-09 layout */}
      <View style={styles.body}>
        <Text style={styles.classroomName}>{classroomName}</Text>
        <Text style={styles.price}>{priceDisplay}</Text>
        {/* D-11: calm copy, no exclamation marks, no urgency */}
        <Text style={styles.copy}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginLeft: SPACING.sm },
  body: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.lg },
  classroomName: { fontSize: 28, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  price: { fontSize: 20, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  copy: { fontSize: 16, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 24 },
});
