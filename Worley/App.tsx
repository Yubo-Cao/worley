import React from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { RecoilRoot } from 'recoil';

import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@model';
import { DarkColorScheme, LightColorScheme, Main, Settings } from '@view';

function AppContent() {
  const [settings, _] = useSettings();
  const { Navigator, Screen } = createMaterialBottomTabNavigator();

  let theme = settings.theme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  let colors = settings.theme === 'dark' ? DarkColorScheme : LightColorScheme;

  return (
    <PaperProvider
      theme={{
        ...theme,
        colors,
      }}
    >
      <NavigationContainer>
        <Navigator>
          <Screen
            name="Main"
            component={Main}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'md-home' : 'md-home-outline'}
                  color={color}
                  size={22}
                />
              ),
            }}
          />
          <Screen
            name="Settings"
            component={Settings}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'md-settings' : 'md-settings-outline'}
                  color={color}
                  size={22}
                />
              ),
            }}
          />
        </Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <RecoilRoot>
      <AppContent />
    </RecoilRoot>
  );
}
