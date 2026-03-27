import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, STAGES } from '../data/theme';
import { Btn } from './UI';

export default function AddJobModal({ visible, onClose, onSave, editJob }) {
  const [form, setForm] = useState(
    editJob || {
      role: '', company: '', stage: 'Applied', salary: '',
      contact: '', appliedDate: new Date().toISOString().split('T')[0],
      jobUrl: '', notes: '', resumeVersion: '', tags: '',
    }
  );

  React.useEffect(() => {
    if (editJob) setForm({ ...editJob, tags: (editJob.tags || []).join(', ') });
    else setForm({ role: '', company: '', stage: 'Applied', salary: '', contact: '', appliedDate: new Date().toISOString().split('T')[0], jobUrl: '', notes: '', resumeVersion: 'Resume_v1.pdf', tags: '' });
  }, [editJob, visible]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.role.trim() || !form.company.trim()) {
      alert('Role and Company are required!');
      return;
    }
    onSave({
      ...form,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
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
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editJob ? 'Edit Job' : 'Add New Job'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveBtn}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label="Role / Position *" value={form.role} onChangeText={(v) => set('role', v)} placeholder="e.g. Senior Frontend Developer" />
          <Field label="Company *" value={form.company} onChangeText={(v) => set('company', v)} placeholder="e.g. Google" />

          <Text style={styles.fieldLabel}>Stage</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageScroll}>
            {STAGES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => set('stage', s)}
                style={[styles.stageChip, form.stage === s && styles.stageChipActive]}
              >
                <Text style={[styles.stageChipText, form.stage === s && styles.stageChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Field label="Salary Range" value={form.salary} onChangeText={(v) => set('salary', v)} placeholder="e.g. ₹25-35 LPA" />
          <Field label="Contact Email" value={form.contact} onChangeText={(v) => set('contact', v)} placeholder="hr@company.com" keyboardType="email-address" />
          <Field label="Applied Date" value={form.appliedDate} onChangeText={(v) => set('appliedDate', v)} placeholder="YYYY-MM-DD" />
          <Field label="Job URL" value={form.jobUrl} onChangeText={(v) => set('jobUrl', v)} placeholder="https://..." />
          <Field label="Resume Version" value={form.resumeVersion} onChangeText={(v) => set('resumeVersion', v)} placeholder="Resume_v1.pdf" />
          <Field label="Tags (comma separated)" value={form.tags} onChangeText={(v) => set('tags', v)} placeholder="React, TypeScript, Remote" />
          <Field label="Notes" value={form.notes} onChangeText={(v) => set('notes', v)} placeholder="Any notes about this role..." multiline numberOfLines={4} />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMulti]}
        placeholderTextColor={colors.text3}
        {...props}
      />
    </View>
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
  cancelBtn: { fontSize: 15, color: colors.text2 },
  saveBtn: { fontSize: 15, color: colors.accent, fontWeight: '600' },
  body: { flex: 1, padding: 16 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, color: colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 6 },
  input: {
    backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 11, color: colors.text, fontSize: 14,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },
  stageScroll: { marginBottom: 16 },
  stageChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg3,
    marginRight: 8,
  },
  stageChipActive: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  stageChipText: { fontSize: 12, color: colors.text2 },
  stageChipTextActive: { color: colors.accent, fontWeight: '600' },
});
