import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * AUTH-08: Request notification permission.
 * Call this ONLY after the user completes their first full lesson.
 * The trigger point is implemented in Phase 2 (lesson-complete screen).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
