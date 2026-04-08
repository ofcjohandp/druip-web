import { Pressable, ActivityIndicator, Text, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from './theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const variantStyle =
    variant === 'primary'
      ? styles.primary
      : variant === 'secondary'
      ? styles.secondary
      : styles.ghost;

  const textColor =
    variant === 'primary' ? COLORS.textOnAccent : variant === 'secondary' ? COLORS.text : COLORS.textMuted;

  const textStyle = [styles.text, { color: textColor }];

  const indicatorColor = variant === 'primary' ? COLORS.textOnAccent : COLORS.accent;

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Animated.View style={[styles.base, variantStyle, (disabled || loading) && styles.disabled, animatedStyle, style]}>
        {loading ? (
          <ActivityIndicator size="small" color={indicatorColor} />
        ) : icon ? (
          <View style={styles.iconRow}>
            <Ionicons name={icon} size={16} color={textColor} style={{ marginRight: 6 }} />
            <Text style={textStyle}>{title}</Text>
          </View>
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  secondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
