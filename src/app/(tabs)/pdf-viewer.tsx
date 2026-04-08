// src/app/(tabs)/pdf-viewer.tsx
// Full-screen WebView PDF viewer. URL passed as encodeURIComponent query param.
import { SafeAreaView, ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING } from '@/features/ui/theme';

export default function PdfViewerScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const decodedUrl = url ? decodeURIComponent(url) : '';

  if (!decodedUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No PDF URL provided.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ? decodeURIComponent(title) : 'PDF'}
        </Text>
      </View>

      {/* WebView renders PDF natively: iOS via WKWebView, Android via Chromium PDF plugin */}
      <WebView
        source={{ uri: decodedUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xl,
    padding: SPACING.lg,
  },
});
