import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isCurrentUser: boolean;
}

export function MessageBubble({ content, createdAt, isCurrentUser }: MessageBubbleProps) {
  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View
      style={[
        styles.bubble,
        isCurrentUser ? styles.outgoing : styles.incoming,
      ]}
      accessibilityLabel={`${isCurrentUser ? 'You' : 'Other'}: ${content}, ${time}`}
    >
      <Text style={[styles.text, isCurrentUser ? styles.textOutgoing : styles.textIncoming]}>
        {content}
      </Text>
      <Text style={styles.timestamp}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '75%',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
  },
  outgoing: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent,
    borderRadius: RADII.card,
    borderBottomRightRadius: 4,
  },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  textOutgoing: {
    color: COLORS.textOnAccent,
  },
  textIncoming: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
