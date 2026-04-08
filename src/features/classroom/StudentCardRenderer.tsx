// src/features/classroom/StudentCardRenderer.tsx
// Student-facing card renderer — dispatches on card_type (RICH-04)
import { Text, TouchableOpacity, Image, View, Linking, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
import { FlashCard } from './FlashCard';
import type { Database } from '@/types/database';

type CardRow = Database['public']['Tables']['classroom_cards']['Row'];
type CardRowWithSignedUrl = CardRow & { signedUrl?: string };

interface StudentCardRendererProps {
  card: CardRowWithSignedUrl;
}

export function StudentCardRenderer({ card }: StudentCardRendererProps) {
  switch (card.card_type) {
    case 'text':
      return (
        <View style={styles.textCard}>
          <Text style={styles.textContent}>{card.content}</Text>
        </View>
      );

    case 'link':
      return (
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => card.content && Linking.openURL(card.content)}
          activeOpacity={0.7}
        >
          <Text style={styles.linkTitle}>{card.title ?? card.content}</Text>
          <Text style={styles.linkUrl} numberOfLines={1}>{card.content}</Text>
        </TouchableOpacity>
      );

    case 'image':
      return card.signedUrl ? (
        <Image
          source={{ uri: card.signedUrl }}
          style={styles.imageCard}
          resizeMode="contain"
          accessibilityLabel={card.title ?? 'Image'}
        />
      ) : null;

    case 'pdf':
      if (!card.signedUrl) {
        return (
          <View style={styles.pdfCard}>
            <Text style={styles.pdfTitle}>{card.title ?? 'PDF'}</Text>
            <Text style={styles.pdfLoading}>Loading...</Text>
          </View>
        );
      }
      return (
        <TouchableOpacity
          style={styles.pdfCard}
          onPress={() =>
            router.push(
              `/(tabs)/pdf-viewer?url=${encodeURIComponent(card.signedUrl!)}&title=${encodeURIComponent(card.title ?? 'PDF')}`
            )
          }
          activeOpacity={0.8}
        >
          <Text style={styles.pdfTitle}>{card.title ?? 'PDF'}</Text>
          <Text style={styles.pdfCta}>Tap to open</Text>
        </TouchableOpacity>
      );

    case 'flashcard':
      return (
        <FlashCard
          front={card.content ?? ''}
          back={card.title ?? ''}
        />
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  textCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  textContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  linkCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
  linkUrl: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  imageCard: {
    width: '100%',
    height: 200,
    borderRadius: RADII.card,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  pdfCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pdfTitle: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  pdfCta: {
    fontSize: 13,
    color: COLORS.accent,
    marginLeft: SPACING.sm,
  },
  pdfLoading: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
