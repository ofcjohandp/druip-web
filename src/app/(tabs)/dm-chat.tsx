import { useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '@/features/auth/useAuthStore';
import { useClassroomDetail } from '@/features/student/useClassroomDetail';
import { useMessages } from '@/features/messaging/useMessages';
import { useSendMessage } from '@/features/messaging/useSendMessage';
import { useTutorUserId } from '@/features/messaging/useTutorUserId';
import { MessageBubble } from '@/features/messaging/MessageBubble';
import { ChatInput } from '@/features/messaging/ChatInput';
import { COLORS, SPACING, TYPOGRAPHY } from '@/features/ui/theme';

export default function DmChatScreen() {
  const { classroomId, studentId } = useLocalSearchParams<{
    classroomId: string;
    studentId?: string;
  }>();

  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?.id;

  const { data: classroom } = useClassroomDetail(classroomId);

  // Resolve tutor's auth user id (only needed for student view)
  const isTutor = !!studentId;
  const { data: tutorAuthId } = useTutorUserId(
    isTutor ? undefined : classroom?.tutor_id
  );

  // Determine the other party's user id
  const otherUserId = isTutor ? studentId : tutorAuthId;

  const {
    data: messages = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMessages(classroomId, otherUserId);

  const sendMessage = useSendMessage(
    classroomId ?? '',
    otherUserId ?? ''
  );

  const flatListRef = useRef<FlatList>(null);

  // Header title: show classroom name or partner identifier
  const headerTitle = isTutor ? 'Student Chat' : (classroom?.name ?? 'Messages');

  function handleSend(text: string) {
    sendMessage.mutate(text, {
      onSuccess: () => {
        flatListRef.current?.scrollToEnd({ animated: true });
      },
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
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
        </View>

        {/* Messages */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Couldn't load messages. Pull down to retry.</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyHeading}>No messages yet</Text>
            <Text style={styles.emptyBody}>
              {isTutor
                ? 'No messages yet. Your student can message you from their classroom.'
                : 'Start the conversation \u2014 your tutor will reply here.'}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                content={item.content}
                createdAt={item.created_at}
                isCurrentUser={item.sender_id === currentUserId}
              />
            )}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={COLORS.accent}
              />
            }
          />
        )}

        {/* Input bar — only show when otherUserId is resolved */}
        {otherUserId && (
          <ChatInput
            onSend={handleSend}
            isSending={sendMessage.isPending}
          />
        )}

        {/* Send error */}
        {sendMessage.isError && (
          <View style={styles.sendError}>
            <Text style={styles.sendErrorText}>Couldn't send. Try again.</Text>
          </View>
        )}
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyHeading: {
    ...TYPOGRAPHY.subheading,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  sendError: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  sendErrorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
});
