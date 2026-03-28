import 'dotenv/config';

export default {
  expo: {
    name: 'JobPilot',
    slug: 'jobpilot',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anvians.jobpilot',
    },
    android: {
      package: 'com.anvians.jobpilot',
      adaptiveIcon: {
        backgroundColor: '#0f0f13',
      },
      splash: {
        backgroundColor: '#0f0f13', // THIS fixes the missing color resource
        resizeMode: 'contain', // or 'cover'
      },
    },
    extra: {
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://jobpilot-wwgo.onrender.com',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      eas: { projectId: '4b66f827-2ccc-4a8f-8cb2-9fbbf82fb222' },
    },
  },
};