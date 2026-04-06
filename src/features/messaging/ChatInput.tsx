import { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Button } from '@/features/ui/Button';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';

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
    <View style={styles.container}>
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
      <Button
        title="Send"
        variant="primary"
        onPress={handleSend}
        disabled={!text.trim() || isSending}
        style={styles.sendButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.button,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 72,
    marginRight: SPACING.xs,
  },
  sendButton: {
    minWidth: 44,
    minHeight: 44,
  },
});
