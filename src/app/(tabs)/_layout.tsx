import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '@/features/ui/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IoniconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,       // D-16: accent color for active state
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      {/* D-15: Exact tab order — Home, Study, Progress, Notes, Profile */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabIcon name="bar-chart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <TabIcon name="document-text-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study/[topicId]"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} />,
          href: null,
        }}
      />
      <Tabs.Screen
        name="classroom-settings"
        options={{
          title: 'Classroom Settings',
          href: null,
        }}
      />
      <Tabs.Screen
        name="classroom-detail"
        options={{ title: 'Classroom', href: null }}
      />
      <Tabs.Screen
        name="subscribe-confirm"
        options={{ title: 'Subscribe', href: null }}
      />
    </Tabs>
  );
}
