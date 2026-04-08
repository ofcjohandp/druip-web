import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING } from '@/features/ui/theme';
import type { Database } from '@/types/database';

type CardRow = Database['public']['Tables']['classroom_cards']['Row'];
type CardRowWithSignedUrl = CardRow & { signedUrl?: string };

interface CardListItemProps {
  card: CardRowWithSignedUrl;
  sectionId: string;
  onDelete: (cardId: string, storagePath: string | null) => void;
}

function getCardIcon(cardType: string): string {
  switch (cardType) {
    case 'text':
      return 'document-text-outline';
    case 'pdf':
      return 'document-outline';
    case 'image':
      return 'image-outline';
    case 'link':
      return 'link-outline';
    case 'flashcard':
      return 'layers-outline';
    default:
      return 'document-outline';
  }
}

function getCardPreview(card: CardRowWithSignedUrl): string {
  switch (card.card_type) {
    case 'text':
      return (card.content ?? '').slice(0, 60);
    case 'link':
      return card.title ?? card.content ?? '';
    case 'pdf':
    case 'image':
      return card.title ?? '';
    case 'flashcard':
      // content = front face; title = back face (repurposed column — show front as preview)
      return (card.content ?? '').slice(0, 60);
    default:
      return '';
  }
}

export function CardListItem({ card, sectionId: _sectionId, onDelete }: CardListItemProps) {
  function handleDelete() {
    Alert.alert(
      'Remove card?',
      'This cannot be undone.',
      [
        { text: 'Keep Card', style: 'cancel' },
        {
          text: 'Remove Card',
          style: 'destructive',
          onPress: () => onDelete(card.id, card.storage_path),
        },
      ]
    );
  }

  const icon = getCardIcon(card.card_type);
  const preview = getCardPreview(card);

  return (
    <View style={styles.row}>
      <Ionicons name={icon as any} size={18} color={COLORS.textMuted} style={styles.typeIcon} />
      <Text style={styles.preview} numberOfLines={1}>
        {preview}
      </Text>
      <TouchableOpacity
        onPress={handleDelete}
        style={styles.deleteButton}
        accessibilityLabel="Remove card"
        accessibilityRole="button"
      >
        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  typeIcon: {
    marginRight: SPACING.xs,
  },
  preview: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  deleteButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
