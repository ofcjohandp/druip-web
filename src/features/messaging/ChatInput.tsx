import { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

interface ChatInputProps {
  onSend: (text: string) => void;
  isSending: boolean;
}

export function ChatInput({ onSend, isSending }: ChatInputProps) {
  const [text, setText] = useState('');

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={2000}
          returnKeyType="send"
          accessibilityLabel="Message input"
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || isSending}
          style={styles.sendButton}
          accessibilityLabel="Send message"
          accessibilityRole="button"
        >
          <Ionicons
            name="send"
            size={20}
            color={!text.trim() || isSending ? COLORS.textMuted : COLORS.accent}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.text,
    maxHeight: 72,
  },
  sendButton: {
    marginLeft: SPACING.xs,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
