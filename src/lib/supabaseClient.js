import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_URL.includes('placeholder')
);

// Resilient no-op client so the application never crashes if Supabase credentials are not set
const dummyClient = {
  auth: {
    setSession: async () => ({ data: null, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase authentication not configured') }),
    signUp: async () => ({ data: null, error: new Error('Supabase authentication not configured') }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase authentication not configured') }),
    updateUser: async () => ({ data: null, error: new Error('Supabase authentication not configured') }),
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
        then: (cb) => cb({ data: [], error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      then: (cb) => cb({ data: [], error: null })
    }),
    upsert: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    update: () => ({ eq: async () => ({ data: null, error: null }) }),
    delete: () => ({ eq: async () => ({ data: null, error: null }) })
  }),
  channel: () => ({
    on: function() { return this; },
    subscribe: () => ({ unsubscribe: () => {} })
  }),
  storage: {
    from: () => ({
      createSignedUrl: async () => ({ data: null, error: new Error('Storage not configured') }),
      upload: async () => ({ data: null, error: new Error('Storage not configured') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
};

// Regular client for standard operations (login, queries, real-time sync with RLS)
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : dummyClient;

// Administrative client is null in client-side bundle
export const supabaseAdmin = null;
