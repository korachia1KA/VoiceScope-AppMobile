// src/navigation/RootNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Icon from 'react-native-vector-icons/Lucide';
import { colors, typography } from '../theme';

// Screens
import AnalysisScreen from '../screens/AnalysisScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import OverviewScreen from '../screens/OverviewScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TranscriptionScreen from '../screens/TranscriptionScreen';

export type RootStackParamList = {
  Tabs: undefined;
  SessionDetail: { id: string };
};

export type TabParamList = {
  Overview: undefined;
  Profiles: undefined;
  Analysis: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.primary[600],
  },
};

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Overview: 'layout-dashboard',
  Profiles: 'users',
  Analysis: 'audio-lines',
  Analytics: 'chart-no-axes-combined',
  Settings: 'settings',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 84,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          marginTop: 4,
        },
        tabBarIcon: ({ color, size }) => (
          <Icon name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Profiles" component={ProfilesScreen} options={{ title: 'Profils' }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{ title: 'Analyser' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Réglages' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { ...typography.h3, color: colors.textPrimary },
          headerTintColor: colors.primary[600],
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SessionDetail"
          component={SessionDetailScreen}
          options={{ title: 'Détail de séance', presentation: 'modal' }}
        />
        {/* Écrans secondaires accessibles via navigation.navigate */}
        <Stack.Screen name="Transcription" component={TranscriptionScreen} options={{ title: 'Transcription' }} />
        <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Rapports' }} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Emploi du temps' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}