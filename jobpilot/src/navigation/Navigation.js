import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../data/AppContext';
import { colors } from '../data/theme';

import DashboardScreen from '../screens/DashboardScreen';
import { JobsScreen, JobDetailScreen } from '../screens/JobsScreen';
import InboxScreen from '../screens/InboxScreen';
import RemindersScreen from '../screens/RemindersScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.bg2, border: colors.border, text: colors.text },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg2 },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600', color: colors.text },
  headerShadowVisible: false,
};

function JobsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="JobsList" component={JobsScreen} options={{ title: 'My Applications' }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Detail' }} />
    </Stack.Navigator>
  );
}

const TAB_ICONS = {
  Dashboard: '◈',
  Jobs: '◇',
  Inbox: '✉',
  Reminders: '⏰',
  Analytics: '◎',
};

export default function Navigation() {
  const { unreadCount, reminders } = useApp();

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          ...screenOptions,
          tabBarStyle: {
            backgroundColor: colors.bg2,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 4,
            height: 60,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.text3,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 16, color }}>{TAB_ICONS[route.name] || '•'}</Text>
          ),
          tabBarBadgeStyle: { backgroundColor: colors.accent, fontSize: 9 },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerTitle: 'JobPilot ✦', headerTitleStyle: { fontSize: 18, fontWeight: '700', color: colors.text } }} />
        <Tab.Screen name="Jobs" component={JobsStack} options={{ headerShown: false }} />
        <Tab.Screen name="Inbox" component={InboxScreen} options={{ tabBarBadge: unreadCount > 0 ? unreadCount : undefined }} />
        <Tab.Screen name="Reminders" component={RemindersScreen} options={{ tabBarBadge: reminders.length > 0 ? reminders.length : undefined }} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
