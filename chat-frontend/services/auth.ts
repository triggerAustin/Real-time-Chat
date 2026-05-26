import { supabase } from '../lib/supabase';

export interface AuthResponse {
  token: string | null;
  username: string;
  error?: string;
}

export const authService = {
  async handleAuth(endpoint: 'login' | 'register', username: string, password: string): Promise<AuthResponse> {
    // Standardize to use @syncchat.com mock emails to bypass UI email fields
    const emailMock = `${username.trim().toLowerCase()}@syncchat.com`;

    if (endpoint === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: emailMock,
        password: password,
        options: {
          // Stores the raw username inside the Supabase auth metadata layer for future reference
          data: { display_name: username }
        }
      });

      if (error) throw new Error(error.message);

      const sessionToken = data.session?.access_token || null;
      if (sessionToken) {
        this.setSession(sessionToken, username);
      } else {
        this.setSession('confirmation_pending', username);
      }

      return { token: sessionToken, username };

    } else { // Login Flow
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailMock,
        password: password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email or disable email verification in your Supabase Auth dashboard Settings.');
        }
        throw new Error('Invalid username or password.');
      }

      const sessionToken = data.session?.access_token || null;
      this.setSession(sessionToken || '', username);

      return { token: sessionToken, username };
    }
  },

  getStoredSession() {
    if (typeof window === 'undefined') return { token: null, user: null };
    return {
      token: localStorage.getItem('chat_token'),
      user: localStorage.getItem('chat_user')
    };
  },

  setSession(token: string, username: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('chat_token', token);
    localStorage.setItem('chat_user', username);
  },

  async clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
    }
    // Explicitly sign out of the active Supabase client engine session tracking cluster
    await supabase.auth.signOut();
  }
};