import 'dotenv/config';

export default {
  expo: {
    name: "JobPilot",
    slug: "jobpilot",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourname.jobpilot",
    },
    android: {
      package: "com.yourname.jobpilot",
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};