import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#1A1E24', borderTopColor: 'rgba(255,255,255,0.06)' },
        tabBarActiveTintColor: '#4ADE80',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
        headerStyle: { backgroundColor: '#1A1E24' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800', letterSpacing: 1.5, fontSize: 14 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'TOURNAMENTS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'LEADERBOARD',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="catch"
        options={{
          title: 'CATCH',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🎣</Text>,
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'CLUBS',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
