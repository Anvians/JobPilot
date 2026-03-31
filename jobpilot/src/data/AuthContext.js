import React, { createContext, useContext, useState, useEffect } from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const AuthContext = createContext(null);
const GMAIL_TOKEN_KEY = 'jobpilot_gmail_provider_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerToken, setProviderToken] = useState(null);

  const persistProviderToken = async (token) => {
    if (token) await AsyncStorage.setItem(GMAIL_TOKEN_KEY, token);
    else await AsyncStorage.removeItem(GMAIL_TOKEN_KEY);
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const [{ data: { session } }, storedToken] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem(GMAIL_TOKEN_KEY),
      ]);

      setSession(session);
      setUser(session?.user ?? null);
      setProviderToken(session?.provider_token || storedToken || null);
      setLoading(false);
    };

    const handleDeepLink = async ({ url }) => {
      if (!url || !url.includes('auth/callback')) return;

      const hashPart = url.includes('#') ? url.split('#')[1] : '';
      const params = new URLSearchParams(hashPart);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const nextProviderToken = params.get('provider_token');

      if (nextProviderToken) {
        setProviderToken(nextProviderToken);
        await persistProviderToken(nextProviderToken);
      }

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          const resolvedToken = data.session?.provider_token || nextProviderToken || null;
          setProviderToken(resolvedToken);
          await persistProviderToken(resolvedToken);
        }
      }
    };

    bootstrapAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setProviderToken((currentToken) => {
        const resolvedToken = nextSession?.provider_token || currentToken || null;
        persistProviderToken(resolvedToken).catch(() => {});
        return resolvedToken;
      });
      setLoading(false);
    });

    const linkSubscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    }).catch(() => {});

    return () => {
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = 'jobpilot://auth/callback';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          scopes: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send',
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });

      if (error) return { data, error };
      if (data?.url) await Linking.openURL(data.url);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProviderToken(null);
    await persistProviderToken(null);
  };

  const getGmailToken = () => providerToken || session?.provider_token || null;

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      signUp, signIn, signInWithGoogle, signOut,
      getGmailToken,
      gmailConnected: !!getGmailToken(),
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);