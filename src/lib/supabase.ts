import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';

// IMPORTANT: The two imports above MUST appear in this exact order before createClient.
// 1. localStorage shim (expo-sqlite) — replaces AsyncStorage with SQLite-backed storage
// 2. URL polyfill — required by supabase-js on React Native (AUTH-04, D-18)

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
