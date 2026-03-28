import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const BACKEND_URL = extra.backendUrl || 'https://jobpilot-wwgo.onrender.com';
export const SUPABASE_URL = extra.supabaseUrl || '';
export const SUPABASE_ANON_KEY = extra.supabaseAnonKey || '';
export const GOOGLE_WEB_CLIENT_ID = extra.googleWebClientId || '';
