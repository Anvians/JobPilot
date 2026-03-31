import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/data/AuthContext';
import { AppProvider, useApp } from './src/data/AppContext';
import Navigation from './src/navigation/Navigation';

function AppShell() {
  const { themeMode } = useApp();

  return (
    <>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      <Navigation />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </AuthProvider>
  );
}