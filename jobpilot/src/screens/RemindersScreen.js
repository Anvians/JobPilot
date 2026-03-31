import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, ScrollView,
} from 'react-native';
import { useApp } from '../data/AppContext';
import { colors } from '../data/theme';
import { Card, Btn, EmptyState } from '../components/UI';
import ComposeModal from '../components/ComposeModal';

const TYPE_COLORS = {
  amber: { bg: '#2b1f0a', border: '#f0a030', text: '#f0a030' },
  red:   { bg: '#2b1010', border: '#e05555', text: '#e05555' },
  green: { bg: '#0d2b1f', border: '#22c98a', text: '#22c98a' },
};

export default function RemindersScreen({ navigation }) {
  const styles = createStyles();
  const { reminders, jobs, dismissReminder, addReminder, sendEmail } = useApp();
  const [remText, setRemText] = useState('');
  const [remTime, setRemTime] = useState('');
  const [composeVisible, setComposeVisible] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState({});

  const openFollowUp = (job) => {
    setComposeDefaults({
      to: job.contact || '',
      subject: `Following up - ${job.role} at ${job.company}`,
      body: `Hi,\n\nI wanted to follow up on my application for the ${job.role} position at ${job.company}. I remain very excited about this opportunity and would love to discuss next steps.\n\nBest regards`,
    });
    setComposeVisible(true);
  };

  const handleAddReminder = async () => {
    if (!remText.trim()) {
      Alert.alert('Enter reminder text');
      return;
    }

    const result = await addReminder({
      type: 'amber',
      icon: '⏰',
      title: remText.trim(),
      desc: '',
      time: remTime.trim() || 'Custom reminder',
      jobId: null,
    });

    setRemText('');
    setRemTime('');

    if (result?.success) {
      Alert.alert('Reminder added', 'Your reminder has been saved.');
    } else if (result?.localOnly) {
      Alert.alert('Saved locally only', result.error || 'The reminder could not be synced to Supabase.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {reminders.length === 0 ? (
        <EmptyState icon="⏰" message="No active reminders" />
      ) : (
        reminders.map((r) => {
          const job = jobs.find((j) => j.id === r.jobId);
          const tc = TYPE_COLORS[r.type] || TYPE_COLORS.amber;
          return (
            <View key={r.id} style={[styles.reminderCard, { borderLeftColor: tc.border }]}>
              <View style={[styles.iconBox, { backgroundColor: tc.bg }]}>
                <Text style={styles.icon}>{r.icon}</Text>
              </View>
              <View style={styles.reminderBody}>
                <Text style={styles.reminderTitle}>{r.title}</Text>
                {r.desc ? <Text style={styles.reminderDesc}>{r.desc}</Text> : null}
                <Text style={[styles.reminderTime, { color: tc.text }]}>{r.time}</Text>

                {job && (
                  <View style={styles.reminderActions}>
                    <TouchableOpacity
                      style={styles.reminderActionBtn}
                      onPress={() => navigation.navigate('Jobs', { screen: 'JobDetail', params: { jobId: job.id } })}
                    >
                      <Text style={styles.reminderActionText}>View Job</Text>
                    </TouchableOpacity>
                    {job.contact ? (
                      <TouchableOpacity
                        style={[styles.reminderActionBtn, styles.reminderActionPrimary]}
                        onPress={() => openFollowUp(job)}
                      >
                        <Text style={[styles.reminderActionText, { color: '#fff' }]}>Follow Up Email</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => dismissReminder(r.id)} style={styles.dismissBtn}>
                <Text style={styles.dismissText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}

      {/* Add Reminder */}
      <Card style={styles.addCard}>
        <Text style={styles.addCardTitle}>Add Reminder</Text>
        <TextInput
          style={styles.input}
          value={remText}
          onChangeText={setRemText}
          placeholder="e.g. Follow up with Stripe"
          placeholderTextColor={colors.text3}
        />
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          value={remTime}
          onChangeText={setRemTime}
          placeholder="When? e.g. Tomorrow 3PM"
          placeholderTextColor={colors.text3}
        />
        <Btn label="+ Add Reminder" variant="primary" onPress={handleAddReminder} style={{ marginTop: 12 }} />
      </Card>

      <View style={{ height: 24 }} />

      <ComposeModal
        visible={composeVisible}
        onClose={() => setComposeVisible(false)}
        onSend={async ({ to, subject, body }) => {
          const result = await sendEmail({ to, subject, body });
          if (result.success) Alert.alert('Sent!', `Email sent to ${to}`);
          else Alert.alert('Send failed', result.error || 'Could not reach backend.');
        }}
        defaultTo={composeDefaults.to}
        defaultSubject={composeDefaults.subject}
        defaultBody={composeDefaults.body}
      />
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  reminderCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border,
    borderLeftWidth: 3, borderRadius: 14, padding: 14, marginBottom: 10,
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon: { fontSize: 16 },
  reminderBody: { flex: 1, marginLeft: 12 },
  reminderTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  reminderDesc: { fontSize: 12, color: colors.text2, marginTop: 2 },
  reminderTime: { fontSize: 11, marginTop: 4 },
  reminderActions: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  reminderActionBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bg3,
  },
  reminderActionPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  reminderActionText: { fontSize: 12, color: colors.text, fontWeight: '500' },
  dismissBtn: { padding: 4 },
  dismissText: { color: colors.text3, fontSize: 14 },

  addCard: { marginTop: 8 },
  addCardTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 },
  input: {
    backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 11, color: colors.text, fontSize: 13,
  },
});
