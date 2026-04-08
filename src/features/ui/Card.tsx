import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, RADII, SPACING } from './theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  pressable?: boolean;
  onPress?: () => void;
}

export function Card({ children, style, elevated = false, pressable = false, onPress }: CardProps) {
  // Hooks must be unconditional — always create, only attach when pressable
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    style,
  ];

  if (pressable) {
    return (
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
      >
        <Animated.View style={[cardStyle, animatedStyle]}>{children}</Animated.View>
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.card,
    padding: SPACING.md,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
});
