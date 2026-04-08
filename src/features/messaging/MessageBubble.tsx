import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

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
    maxWidth: '78%',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: 16,
  },
  outgoing: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    ...TYPOGRAPHY.body,
  },
  textOutgoing: {
    color: COLORS.textOnAccent,
  },
  textIncoming: {
    color: COLORS.text,
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
