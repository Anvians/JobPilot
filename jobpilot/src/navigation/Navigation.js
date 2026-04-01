import React from 'react';
import { Text, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../data/AuthContext';
import { useApp } from '../data/AppContext';
import { colors } from '../data/theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { JobsScreen, JobDetailScreen } from '../screens/JobsScreen';
import InboxScreen from '../screens/InboxScreen';
import RemindersScreen from '../screens/RemindersScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OpportunitiesScreen from '../screens/OpportunitiesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const createNavTheme = () => ({
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.bg,
    card: colors.bg2,
    border: colors.border,
    text: colors.text,
  },
});
const TAB_ICONS = {
  Dashboard: '◈', Jobs: '◇', Opportunities: '🤖',
  Inbox: '✉', Reminders: '⏰', Analytics: '◎', Profile: '◉',
};
const createScreenOptions = () => ({
  headerStyle: { backgroundColor: colors.bg2 },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600', color: colors.text },
  headerShadowVisible: false,
});

const getTabIconName = (routeName, focused) => {
  switch (routeName) {
    case 'Dashboard':
      return focused ? 'grid' : 'grid-outline';
    case 'Jobs':
      return focused ? 'briefcase' : 'briefcase-outline';
    case 'Inbox':
      return focused ? 'mail' : 'mail-outline';
    case 'Reminders':
      return focused ? 'notifications' : 'notifications-outline';
    case 'Analytics':
      return focused ? 'stats-chart' : 'stats-chart-outline';
    default:
      return focused ? 'ellipse' : 'ellipse-outline';
  }
};

function HeaderProfileButton({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => {
        const parentNav = navigation.getParent();
        if (parentNav) parentNav.navigate('Profile');
        else navigation.navigate('Profile');
      }}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accentBg,
        borderWidth: 1,
        borderColor: colors.border2,
        marginRight: 4,
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="person-outline" size={18} color={colors.accent} />
    </TouchableOpacity>
  );
}

function JobsStack() {
  const { themeMode } = useApp();
  const screenOptions = React.useMemo(() => createScreenOptions(), [themeMode]);

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        ...screenOptions,
        headerRight: () => <HeaderProfileButton navigation={navigation} />,
      })}
    >
      <Stack.Screen name="JobsList" component={JobsScreen} options={{ title: 'My Applications' }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job Detail' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { unreadCount, reminders, themeMode } = useApp();
  const screenOptions = React.useMemo(() => createScreenOptions(), [themeMode]);

  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        ...screenOptions,
        headerRight: () => <HeaderProfileButton navigation={navigation} />,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 66,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
          marginVertical: 4,
        },
        tabBarActiveBackgroundColor: colors.accentBg,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text2,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={getTabIconName(route.name, focused)} size={18} color={color} />
        ),
        tabBarBadgeStyle: {
          backgroundColor: colors.accent,
          fontSize: 9,
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ headerTitle: 'JobPilot ✦', headerTitleStyle: { fontSize: 18, fontWeight: '700', color: colors.text } }} />
      <Tab.Screen name="Jobs" component={JobsStack} options={{ headerShown: false }} />
      <Tab.Screen
          name="Opportunities"
          component={OpportunitiesScreen}
          options={{ title: 'AI Scanner' }}
        />
      <Tab.Screen name="Inbox" component={InboxScreen}
        options={{ tabBarBadge: unreadCount > 0 ? unreadCount : undefined }} />
      <Tab.Screen name="Reminders" component={RemindersScreen}
        options={{ tabBarBadge: reminders.length > 0 ? reminders.length : undefined }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isLoggedIn, loading } = useAuth();
  const { themeMode } = useApp();
  const navTheme = React.useMemo(() => createNavTheme(), [themeMode]);
  const screenOptions = React.useMemo(() => createScreenOptions(), [themeMode]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}