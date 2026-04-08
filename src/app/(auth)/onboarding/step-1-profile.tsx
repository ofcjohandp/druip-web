import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useUpsertStudentProfile } from '@/features/onboarding/useUpsertStudentProfile';
import { OnboardingProgress } from '@/features/onboarding/OnboardingProgress';
import { Button } from '@/features/ui/Button';
import { COLORS, RADII, SPACING } from '@/features/ui/theme';

export default function Step1ProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertStudentProfile = useUpsertStudentProfile();

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setError(null);
    setUploading(true);
    try {
      let photoUrl: string | undefined;

      if (photoUri && session?.user?.id) {
        const userId = session.user.id;
        const ext = photoUri.split('.').pop() ?? 'jpg';
        const path = `${userId}/profile.${ext}`;
        const response = await fetch(photoUri);
        const arrayBuffer = await response.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, arrayBuffer, { contentType: `image/${ext}`, upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      await upsertStudentProfile.mutateAsync({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ...(photoUrl ? { photo_url: photoUrl } : {}),
      });

      router.push('/(auth)/onboarding/step-2-university');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <OnboardingProgress currentStep={1} totalSteps={6} />
        <Text style={styles.title}>What's your name?</Text>
        <Text style={styles.subtitle}>This is how other students will see you</Text>

        <TouchableOpacity style={styles.photoPicker} onPress={handlePickPhoto} activeOpacity={0.8}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={COLORS.textMuted}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoComplete="given-name"
        />
        <TextInput
          style={styles.input}
          placeholder="Last name"
          placeholderTextColor={COLORS.textMuted}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoComplete="family-name"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        {uploading ? (
          <ActivityIndicator color={COLORS.accent} style={styles.loader} />
        ) : (
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={!canContinue}
            style={styles.button}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.xl },
  photoPicker: { alignSelf: 'center', marginBottom: SPACING.lg },
  photoImage: { width: 96, height: 96, borderRadius: 48 },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 13, color: COLORS.textMuted },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.button,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorText: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
  loader: { marginTop: SPACING.sm },
  button: { marginTop: SPACING.sm },
});
