import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../data/AuthContext';
import { colors } from '../data/theme';
import { Card } from '../components/UI';

export default function ProfileScreen() {
  const { user, signOut, getGmailToken } = useAuth();
  const gmailConnected = !!getGmailToken();

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
            {gmailConnected ? 'Gmail connected via Google' : 'Not connected — sign in with Google to enable'}
          </Text>
        </View>
        {!gmailConnected && (
          <Text style={styles.hint}>
            Log out and sign in again using "Continue with Google" to connect Gmail.
          </Text>
        )}
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

const styles = StyleSheet.create({
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