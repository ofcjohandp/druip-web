import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
import { Button } from '@/features/ui/Button';

interface SubjectTagInputProps {
  subjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
}

export function SubjectTagInput({ subjects, onSubjectsChange }: SubjectTagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      onSubjectsChange([...subjects, trimmed]);
      setInputValue('');
    }
  };

  const handleRemove = (idx: number) => {
    onSubjectsChange(subjects.filter((_, i) => i !== idx));
  };

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add subject"
          placeholderTextColor={COLORS.textMuted}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Button title="Add" onPress={handleAdd} variant="ghost" style={styles.addButton} />
      </View>
      {subjects.length > 0 && (
        <View style={styles.chipsRow}>
          {subjects.map((subject, idx) => (
            <View key={idx} style={styles.chip}>
              <Text style={styles.chipText}>{subject}</Text>
              <TouchableOpacity
                onPress={() => handleRemove(idx)}
                style={styles.removeButton}
                activeOpacity={0.8}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    minHeight: 48,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.button,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  removeButton: {
    marginLeft: 4,
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
