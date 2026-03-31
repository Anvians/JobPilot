import 'dotenv/config';

export default {
  expo: {
    name: 'JobPilot',
    slug: 'jobpilot',
    icon: './assets/icon.png',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'jobpilot',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.anvians.jobpilot',
    },
    android: {
      package: 'com.anvians.jobpilot',
      adaptiveIcon: {
        backgroundColor: '#0f0f13',
        foregroundImage: './assets/icon.png',
      },
      splash: {
        backgroundColor: '#0f0f13',
        resizeMode: 'contain',
      },
    },
    extra: {
      eas: { projectId: '4b66f827-2ccc-4a8f-8cb2-9fbbf82fb222' },
    },
    "plugins": [
    "expo-font"
  ]
  },
};