import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';
import { CardTypeOption } from './CardTypeOption';
import { useCreateTextCard, useCreateLinkCard, useCreateFileCard } from './useClassroomCards';

interface AddCardBottomSheetProps {
  visible: boolean;
  sectionId: string;
  classroomId: string;
  onClose: () => void;
}

type FormMode = 'text' | 'link' | null;

export function AddCardBottomSheet({
  visible,
  sectionId,
  classroomId,
  onClose,
}: AddCardBottomSheetProps) {
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [textContent, setTextContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [uploadError, setUploadError] = useState('');

  const createTextCard = useCreateTextCard(sectionId);
  const createLinkCard = useCreateLinkCard(sectionId);
  const createFileCard = useCreateFileCard(sectionId);

  function handleClose() {
    setFormMode(null);
    setTextContent('');
    setLinkUrl('');
    setLinkTitle('');
    setUploadError('');
    onClose();
  }

  function handleCancelForm() {
    setFormMode(null);
    setTextContent('');
    setLinkUrl('');
    setLinkTitle('');
  }

  async function handleSaveText() {
    if (!textContent.trim()) return;
    await createTextCard.mutateAsync(textContent.trim());
    handleClose();
  }

  async function handleSaveLink() {
    if (!linkUrl.trim()) return;
    await createLinkCard.mutateAsync({ url: linkUrl.trim(), title: linkTitle.trim() || undefined });
    handleClose();
  }

  async function handlePickPdf() {
    onClose();
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await createFileCard.mutateAsync({
        fileUri: asset.uri,
        fileName: asset.name,
        mimeType: asset.mimeType || 'application/pdf',
        cardType: 'pdf',
        classroomId,
      });
    } catch {
      setUploadError('Upload failed. Tap to retry.');
    }
  }

  async function handlePickImage() {
    onClose();
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await createFileCard.mutateAsync({
        fileUri: asset.uri,
        fileName: asset.fileName || 'image.jpg',
        mimeType: asset.mimeType || 'image/jpeg',
        cardType: 'image',
        classroomId,
      });
    } catch {
      setUploadError('Upload failed. Tap to retry.');
    }
  }

  const isSavingText = createTextCard.isPending;
  const isSavingLink = createLinkCard.isPending;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        <Text style={styles.title}>Add material</Text>

        {formMode === 'text' ? (
          /* Text note form */
          <View>
            <TextInput
              style={styles.textInput}
              placeholder="Write your note or tip here..."
              placeholderTextColor={COLORS.textMuted}
              value={textContent}
              onChangeText={setTextContent}
              multiline
              autoFocus
              editable={!isSavingText}
            />
            <TouchableOpacity
              style={[styles.saveButton, (!textContent.trim() || isSavingText) && styles.saveButtonDisabled]}
              onPress={handleSaveText}
              disabled={!textContent.trim() || isSavingText}
              activeOpacity={0.85}
            >
              {isSavingText ? (
                <ActivityIndicator size="small" color={COLORS.textOnAccent} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={handleCancelForm}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : formMode === 'link' ? (
          /* Link form */
          <View>
            <TextInput
              style={styles.linkInput}
              placeholder="URL (e.g. https://youtube.com/...)"
              placeholderTextColor={COLORS.textMuted}
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoFocus
              keyboardType="url"
              autoCapitalize="none"
              editable={!isSavingLink}
            />
            <TextInput
              style={[styles.linkInput, styles.linkTitleInput]}
              placeholder="Title (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={linkTitle}
              onChangeText={setLinkTitle}
              editable={!isSavingLink}
            />
            <TouchableOpacity
              style={[styles.saveButton, (!linkUrl.trim() || isSavingLink) && styles.saveButtonDisabled]}
              onPress={handleSaveLink}
              disabled={!linkUrl.trim() || isSavingLink}
              activeOpacity={0.85}
            >
              {isSavingLink ? (
                <ActivityIndicator size="small" color={COLORS.textOnAccent} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelLink} onPress={handleCancelForm}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Type selection */
          <View>
            <CardTypeOption
              icon="document-text-outline"
              title="Text note"
              description="Write a note or tip"
              onPress={() => setFormMode('text')}
            />
            <CardTypeOption
              icon="document-outline"
              title="PDF / File"
              description="Upload a document"
              onPress={handlePickPdf}
            />
            <CardTypeOption
              icon="image-outline"
              title="Image"
              description="Upload a photo or scan"
              onPress={handlePickImage}
            />
            <CardTypeOption
              icon="link-outline"
              title="Link"
              description="YouTube, articles, etc"
              onPress={() => setFormMode('link')}
            />
          </View>
        )}

        {!!uploadError && (
          <Text style={styles.uploadError}>{uploadError}</Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADII.modal,
    borderTopRightRadius: RADII.modal,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.button,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 96,
    textAlignVertical: 'top',
    marginBottom: SPACING.sm,
  },
  linkInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.button,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  linkTitleInput: {
    marginBottom: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: RADII.button,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textOnAccent,
  },
  cancelLink: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  cancelLinkText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  uploadError: {
    fontSize: 14,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
