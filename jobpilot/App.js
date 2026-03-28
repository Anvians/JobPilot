import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/data/AuthContext';
import { AppProvider } from './src/data/AppContext';
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Navigation />
      </AppProvider>
    </AuthProvider>
  );
}