import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

interface LockedContentOverlayProps {
  sectionName: string;
}

export function LockedContentOverlay({ sectionName }: LockedContentOverlayProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="lock-closed-outline"
        size={16}
        color={COLORS.textMuted}
        style={styles.icon}
        accessibilityLabel="Locked — subscribe to access"
      />
      <Text style={styles.sectionName}>{sectionName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.button,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  sectionName: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textMuted,
    flex: 1,
  },
});
