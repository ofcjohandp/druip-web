import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
import { Button } from '@/features/ui/Button';
import { useClassroom } from '@/features/tutor/useClassroom';
import {
  useClassroomSections,
  useCreateSection,
  useReorderSections,
} from '@/features/classroom/useClassroomSections';
import { SectionRow } from '@/features/classroom/SectionRow';
import { AddCardBottomSheet } from '@/features/classroom/AddCardBottomSheet';
import { CardListItem } from '@/features/classroom/CardListItem';
import { useClassroomCards, useDeleteCard } from '@/features/classroom/useClassroomCards';
import type { Database } from '@/types/database';

type SectionRow_DB = Database['public']['Tables']['classroom_sections']['Row'];

// SectionWithCards combines SectionRow + card hooks so hooks aren't called inside .map()
interface SectionWithCardsProps {
  section: SectionRow_DB;
  index: number;
  totalSections: number;
  classroomId: string;
  onAddCard: (sectionId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SectionWithCards({
  section,
  index,
  totalSections,
  classroomId,
  onAddCard,
  onMoveUp,
  onMoveDown,
}: SectionWithCardsProps) {
  const { data: cards = [], isPending: isCardsPending } = useClassroomCards(section.id);
  const deleteCard = useDeleteCard(section.id);
  const createFileCard_pending = false; // tracked inside AddCardBottomSheet directly

  return (
    <SectionRow
      section={section}
      index={index}
      totalSections={totalSections}
      classroomId={classroomId}
      onAddCard={onAddCard}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      {isCardsPending ? (
        <ActivityIndicator size="small" color={COLORS.accent} style={styles.cardsSpinner} />
      ) : (
        cards.map((card) => (
          <CardListItem
            key={card.id}
            card={card}
            sectionId={section.id}
            onDelete={(cardId, storagePath) =>
              deleteCard.mutate({ cardId, storagePath })
            }
          />
        ))
      )}
    </SectionRow>
  );
}

export default function ManageClassroomScreen() {
  const { data: classroom } = useClassroom();
  const classroomId = classroom?.id;

  const { data: sections = [], isLoading, isError, refetch } = useClassroomSections(classroomId);
  const createSection = useCreateSection(classroomId ?? '');
  const reorderSections = useReorderSections(classroomId ?? '');

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [activeSheetSectionId, setActiveSheetSectionId] = useState<string | null>(null);

  function computeNextSortOrder() {
    if (sections.length === 0) return 1000;
    return Math.max(...sections.map((s) => s.sort_order), 0) + 1000;
  }

  async function handleAddSection() {
    const name = newSectionName.trim();
    if (!name) return;
    await createSection.mutateAsync({ name, sort_order: computeNextSortOrder() });
    setNewSectionName('');
    setIsAddingSection(false);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const sectionA = sections[index];
    const sectionB = sections[index - 1];
    reorderSections.mutate({
      sectionAId: sectionA.id,
      sectionBId: sectionB.id,
      sortOrderA: sectionA.sort_order,
      sortOrderB: sectionB.sort_order,
    });
  }

  function handleMoveDown(index: number) {
    if (index === sections.length - 1) return;
    const sectionA = sections[index];
    const sectionB = sections[index + 1];
    reorderSections.mutate({
      sectionAId: sectionA.id,
      sectionBId: sectionB.id,
      sortOrderA: sectionA.sort_order,
      sortOrderB: sectionB.sort_order,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Classroom</Text>
          <TouchableOpacity
            style={styles.gearButton}
            onPress={() => router.push('/(tabs)/classroom-settings')}
            accessibilityLabel="Classroom settings"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Couldn't load classroom. Pull down to refresh.</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              sections.length === 0 && !isAddingSection && styles.scrollContentCentered,
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {sections.length === 0 && !isAddingSection ? (
              /* Empty state */
              <View style={styles.emptyState}>
                <Text style={styles.emptyHeading}>Build your classroom</Text>
                <Text style={styles.emptyBody}>
                  Add your first section to organise your material.
                </Text>
                <Button
                  title="Add your first section"
                  variant="primary"
                  onPress={() => setIsAddingSection(true)}
                  style={styles.emptyButton}
                />
              </View>
            ) : (
              <>
                {sections.map((section, index) => (
                  <SectionWithCards
                    key={section.id}
                    section={section}
                    index={index}
                    totalSections={sections.length}
                    classroomId={classroomId ?? ''}
                    onAddCard={(sectionId) => setActiveSheetSectionId(sectionId)}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                  />
                ))}

                {isAddingSection && (
                  <View style={styles.addSectionForm}>
                    <TextInput
                      style={styles.addSectionInput}
                      placeholder="Section name"
                      placeholderTextColor={COLORS.textMuted}
                      value={newSectionName}
                      onChangeText={setNewSectionName}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleAddSection}
                    />
                    <View style={styles.addSectionActions}>
                      <Button
                        title="Add"
                        variant="primary"
                        onPress={handleAddSection}
                        disabled={!newSectionName.trim() || createSection.isPending}
                        style={styles.addButton}
                      />
                      <Button
                        title="Cancel"
                        variant="ghost"
                        onPress={() => {
                          setIsAddingSection(false);
                          setNewSectionName('');
                        }}
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}

        {/* Add Section pinned button — only when sections exist and not already adding */}
        {!isLoading && !isError && sections.length > 0 && !isAddingSection && (
          <View style={styles.footer}>
            <Button
              title="Add Section"
              variant="secondary"
              onPress={() => setIsAddingSection(true)}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Add Card Bottom Sheet */}
      <AddCardBottomSheet
        visible={!!activeSheetSectionId}
        sectionId={activeSheetSectionId ?? ''}
        classroomId={classroom?.id ?? ''}
        onClose={() => setActiveSheetSectionId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  gearButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    padding: SPACING.sm,
  },
  retryText: {
    fontSize: 16,
    color: COLORS.accent,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  scrollContentCentered: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    width: '100%',
  },
  addSectionForm: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addSectionInput: {
    fontSize: 16,
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  addSectionActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  addButton: {
    flex: 1,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  cardsSpinner: {
    marginVertical: SPACING.xs,
  },
});
