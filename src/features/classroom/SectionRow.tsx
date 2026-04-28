import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING } from '@/features/ui/theme';
import { Card } from '@/features/ui/Card';
import type { Database } from '@/types/database';
import { useRenameSection, useDeleteSection } from './useClassroomSections';

type SectionRow_DB = Database['public']['Tables']['classroom_sections']['Row'];

interface SectionRowProps {
  section: SectionRow_DB;
  index: number;
  totalSections: number;
  classroomId: string;
  onAddCard: (sectionId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children?: React.ReactNode;
}

export function SectionRow({
  section,
  index,
  totalSections,
  classroomId,
  onAddCard,
  onMoveUp,
  onMoveDown,
  children,
}: SectionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(section.name);
  const [renameError, setRenameError] = useState('');
  const inputRef = useRef<TextInput>(null);

  const renameMutation = useRenameSection(classroomId);
  const deleteMutation = useDeleteSection(classroomId);

  // Android autoFocus workaround per Research Pitfall 6
  useEffect(() => {
    if (isEditing && Platform.OS === 'android') {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isEditing]);

  function handleStartEdit() {
    setDraftName(section.name);
    setRenameError('');
    setIsEditing(true);
  }

  async function handleConfirmRename() {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === section.name) {
      setIsEditing(false);
      setDraftName(section.name);
      return;
    }
    setRenameError('');
    try {
      await renameMutation.mutateAsync({ sectionId: section.id, name: trimmed });
      setIsEditing(false);
    } catch {
      setRenameError("Couldn't save. Try again.");
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete section?',
      'This will also delete all cards inside it. This cannot be undone.',
      [
        { text: 'Keep Section', style: 'cancel' },
        {
          text: 'Delete Section',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(section.id),
        },
      ]
    );
  }

  const isFirst = index === 0;
  const isLast = index === totalSections - 1;
  const hasChildren = !!children && (Array.isArray(children) ? children.length > 0 : true);

  return (
    <Card style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        {isEditing ? (
          <View style={styles.editingContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.nameInput,
                renameMutation.isPending && styles.inputDisabled,
                !!renameError && styles.inputError,
              ]}
              value={draftName}
              onChangeText={setDraftName}
              onSubmitEditing={handleConfirmRename}
              onBlur={handleConfirmRename}
              autoFocus={Platform.OS !== 'android'}
              editable={!renameMutation.isPending}
              returnKeyType="done"
            />
            {renameMutation.isPending && (
              <ActivityIndicator size="small" color={COLORS.accent} style={styles.editSpinner} />
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={handleStartEdit} style={styles.nameTouchable} activeOpacity={0.7}>
            <Text style={styles.sectionName}>{section.name}</Text>
          </TouchableOpacity>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, isFirst && styles.iconButtonDisabled]}
            onPress={onMoveUp}
            disabled={isFirst}
            accessibilityLabel="Move section up"
            accessibilityRole="button"
            accessibilityState={{ disabled: isFirst }}
          >
            <Ionicons
              name="chevron-up"
              size={20}
              color={isFirst ? COLORS.textMuted : COLORS.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, isLast && styles.iconButtonDisabled]}
            onPress={onMoveDown}
            disabled={isLast}
            accessibilityLabel="Move section down"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLast }}
          >
            <Ionicons
              name="chevron-down"
              size={20}
              color={isLast ? COLORS.textMuted : COLORS.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleDelete}
            accessibilityLabel="Delete section"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {!!renameError && <Text style={styles.errorText}>{renameError}</Text>}

      {/* Card children */}
      {hasChildren ? (
        <View style={styles.cardList}>{children}</View>
      ) : (
        <Text style={styles.emptyText}>No material yet. Add your first card.</Text>
      )}

      {/* Add card ghost button */}
      <TouchableOpacity
        style={styles.addCardButton}
        onPress={() => onAddCard(section.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.addCardText}>+ Add card</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  editingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameTouchable: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  sectionName: {
    fontSize: 20,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.text,
  },
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
    minHeight: 44,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputError: {
    borderBottomColor: COLORS.error,
  },
  editSpinner: {
    marginLeft: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.4,
  },
  cardList: {
    marginTop: SPACING.xs,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  addCardButton: {
    marginTop: SPACING.xs,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  addCardText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
});
