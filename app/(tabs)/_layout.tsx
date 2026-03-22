import { Tabs } from 'expo-router';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HapticTab } from '@/components/haptic-tab';
import { TopNav } from '@/components/top-nav';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastProvider } from '@/hooks/use-toast-queue';
import { ToastOverlay } from './components/ToastOverlay';
import { AuthProvider } from './auth-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
    <ToastProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: true,
          header: () => <TopNav />,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Play',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'World',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="globe-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="lore"
          options={{
            title: 'Lore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="mail-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <ToastOverlay />
    </ToastProvider>
    </AuthProvider>
  );
}
