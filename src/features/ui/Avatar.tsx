import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from './theme';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, circleStyle]} />;
  }

  const initials = name ? name.trim().charAt(0).toUpperCase() : '?';

  return (
    <View style={[styles.fallback, circleStyle]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: COLORS.textOnAccent,
    fontWeight: '600',
  },
});
