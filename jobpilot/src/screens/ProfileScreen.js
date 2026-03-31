import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { useAuth } from '../data/AuthContext';
import { useApp } from '../data/AppContext';
import { colors } from '../data/theme';
import { Card } from '../components/UI';

export default function ProfileScreen() {
  const styles = createStyles();
  const { user, signOut, getGmailToken } = useAuth();
  const { themeMode, toggleTheme } = useApp();
  const gmailToken = getGmailToken();
  const gmailConnected = !!gmailToken;
  const signedInWithGoogle =
    user?.app_metadata?.provider === 'google' ||
    user?.identities?.some((identity) => identity.provider === 'google');

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.email || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.uid}>ID: {user?.id?.slice(0, 8)}...</Text>
      </View>

      {/* Gmail status */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Gmail Integration</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: gmailConnected ? colors.green : colors.amber }]} />
          <Text style={styles.statusText}>
            {gmailConnected
              ? 'Gmail connected via Google'
              : signedInWithGoogle
                ? 'Google sign-in detected, but Gmail permission token is missing'
                : 'Not connected — sign in with Google to enable'}
          </Text>
        </View>
        {!gmailConnected && (
          <Text style={styles.hint}>
            {signedInWithGoogle
              ? 'Please sign out and reconnect with Google again to grant Gmail read/send permissions.'
              : 'Use "Continue with Google" on the login screen to connect Gmail inbox access.'}
          </Text>
        )}
      </Card>

      {/* Theme */}
      <Card style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.themeTitle}>Light mode</Text>
            <Text style={styles.themeHint}>
              Switch between the clean light theme and the default dark look.
            </Text>
          </View>
          <Switch
            value={themeMode === 'light'}
            onValueChange={toggleTheme}
            thumbColor="#ffffff"
            trackColor={{ false: colors.border2, true: colors.accent }}
          />
        </View>
      </Card>

      {/* App info */}
      <Card style={[styles.card, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App</Text>
          <Text style={styles.infoValue}>JobPilot v1.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Backend</Text>
          <Text style={styles.infoValue}>jobpilot-wwgo.onrender.com</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Database</Text>
          <Text style={styles.infoValue}>Supabase</Text>
        </View>
      </Card>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 28, marginTop: 12 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.accentBg, borderWidth: 2, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.accent },
  email: { fontSize: 15, fontWeight: '600', color: colors.text },
  uid: { fontSize: 11, color: colors.text3, marginTop: 3 },

  card: {},
  sectionTitle: { fontSize: 12, color: colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, color: colors.text, flex: 1 },
  hint: { fontSize: 12, color: colors.text3, marginTop: 8, lineHeight: 18 },

  themeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  themeHint: { fontSize: 12, color: colors.text3, marginTop: 2, lineHeight: 18 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.text2 },
  infoValue: { fontSize: 13, color: colors.text, fontWeight: '500' },

  signOutBtn: {
    marginTop: 24, borderWidth: 1, borderColor: colors.red,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    backgroundColor: colors.redBg,
  },
  signOutText: { color: colors.red, fontSize: 15, fontWeight: '700' },
});