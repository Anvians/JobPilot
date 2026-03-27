import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/data/AppContext';
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <Navigation />
    </AppProvider>
  );
}
