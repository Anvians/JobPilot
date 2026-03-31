import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../data/AuthContext';
import { colors } from '../data/theme';

export default function LoginScreen() {
  const styles = createStyles();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    const { data, error } = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (mode === 'signup') {
      const needsEmailConfirmation = !data?.session;
      Alert.alert(
        needsEmailConfirmation ? 'Check your email' : '✓ Account created!',
        needsEmailConfirmation
          ? 'Your account was created. Please verify your email before logging in.'
          : 'Your account is ready. You can now log in.',
      );
      setMode('login');
      setPassword('');
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setGoogleLoading(false);
    if (error) Alert.alert('Google Sign-In Error', error.message);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Job<Text style={styles.logoAccent}>Pilot</Text></Text>
          <Text style={styles.logoSub}>Your job search, organised</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </Text>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading
              ? <ActivityIndicator color={colors.text} />
              : <>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text style={styles.googleText}>Continue with Google</Text>
                </>
            }
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.text3}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.text3}
            secureTextEntry
          />

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>
                  {mode === 'login' ? 'Log In' : 'Sign Up'}
                </Text>
            }
          </TouchableOpacity>

          {/* Toggle */}
          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 38, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  logoAccent: { color: colors.accent },
  logoSub: { fontSize: 13, color: colors.text3, marginTop: 4 },

  card: {
    backgroundColor: colors.bg2,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20, letterSpacing: -0.5 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: colors.bg3,
    borderWidth: 1, borderColor: colors.border2,
    borderRadius: 12, paddingVertical: 13,
    marginBottom: 16,
  },
  googleIcon: { fontSize: 16, fontWeight: '700', color: '#4285F4' },
  googleText: { fontSize: 14, fontWeight: '500', color: colors.text },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.text3 },

  label: { fontSize: 11, color: colors.text3, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 12, color: colors.text,
    fontSize: 14, marginBottom: 14,
  },

  submitBtn: {
    backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  toggleText: { textAlign: 'center', fontSize: 13, color: colors.accent },
});