import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import constants from 'expo-constants';
const SUPABASE_URL = constants.expoConfig.extra.supabaseUrl;
const SUPABASE_ANON_KEY = constants.expoConfig.extra.supabaseAnonKey;


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
