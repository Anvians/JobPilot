import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { colors } from '../data/theme';

export default function ComposeModal({ visible, onClose, onSend, defaultTo = '', defaultSubject = '', defaultBody = '' }) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (visible) {
      setTo(defaultTo);
      setSubject(defaultSubject);
      setBody(defaultBody);
    }
  }, [visible, defaultTo, defaultSubject, defaultBody]);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim()) {
      Alert.alert('Missing fields', 'Please fill in To and Subject.');
      return;
    }
    setSending(true);
    await onSend({ to, subject, body });
    setSending(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Message</Text>
          <TouchableOpacity onPress={handleSend} disabled={sending}>
            <Text style={[styles.sendBtn, sending && { opacity: 0.5 }]}>
              {sending ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.row}>
            <Text style={styles.rowLabel}>To</Text>
            <TextInput
              style={styles.rowInput}
              value={to}
              onChangeText={setTo}
              placeholder="recipient@company.com"
              placeholderTextColor={colors.text3}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Subject</Text>
            <TextInput
              style={styles.rowInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject line"
              placeholderTextColor={colors.text3}
            />
          </View>
          <View style={styles.divider} />
          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            placeholder="Write your message..."
            placeholderTextColor={colors.text3}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.bg2,
  },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  cancel: { fontSize: 15, color: colors.text2 },
  sendBtn: { fontSize: 15, color: colors.accent, fontWeight: '700' },
  body: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  rowLabel: { width: 60, fontSize: 13, color: colors.text3, fontWeight: '500' },
  rowInput: { flex: 1, fontSize: 14, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border },
  bodyInput: { flex: 1, fontSize: 14, color: colors.text, marginTop: 12, minHeight: 300 },
});
