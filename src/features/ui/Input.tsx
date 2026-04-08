import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from './theme';

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  multiline,
  numberOfLines,
  editable,
}: InputProps) {
  return (
    <View>
      {label && (
        <Text style={[TYPOGRAPHY.bodySmall, styles.label]}>{label}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete as any}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={editable}
        style={[styles.input, error ? styles.inputError : styles.inputDefault]}
      />
      {error && (
        <Text style={[TYPOGRAPHY.caption, styles.errorText]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.text,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  inputDefault: {
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    marginTop: -4,
    marginBottom: SPACING.xs,
  },
});
