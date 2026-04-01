import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert, Modal,
  ScrollView,
} from 'react-native';
import { useApp } from '../data/AppContext';
import { useAuth } from '../data/AuthContext';
import { colors } from '../data/theme';
import { BACKEND_URL } from '../data/config';
import { Card, Btn, Tag, EmptyState } from '../components/UI';

export default function OpportunitiesScreen({ navigation }) {
  const { jobs, addJob, inbox, loadInbox, inboxLoading } = useApp();
  const { getGmailToken } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [confirmations, setConfirmations] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('opportunities');

  const scanEmails = useCallback(async () => {
    setScanning(true);
    setOpportunities([]);
    setConfirmations([]);
    setStatusUpdates([]);

    try {
      // First refresh inbox
      await loadInbox();

      const token = getGmailToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch fresh emails from backend
      setScanProgress('Fetching emails from Gmail...');
      const res = await fetch(`${BACKEND_URL}/inbox/jobs`, { headers });
      const data = await res.json();
      const emails = data.emails || [];

      setScanProgress(`Analysing ${emails.length} emails with AI...`);

      const opps = [], confs = [], updates = [];
      let processed = 0;

      // Process in batches of 3 to avoid rate limits
      for (let i = 0; i < Math.min(emails.length, 30); i++) {
        const email = emails[i];
        processed++;
        setScanProgress(`Analysing email ${processed} of ${Math.min(emails.length, 30)}...`);

        try {
          const scrapeRes = await fetch(`${BACKEND_URL}/scrape-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              emailBody: email.body || email.preview || '',
              emailSubject: email.subject || '',
              emailFrom: email.from || '',
            }),
          });
          const scrapeData = await scrapeRes.json();
          if (!scrapeData.success) continue;

          const result = { ...scrapeData.result, _email: email };

          if (result.type === 'opportunity') opps.push(result);
          else if (result.type === 'confirmation') confs.push(result);
          else if (result.type === 'status_update') updates.push(result);
        } catch (e) {
          console.log('Scrape error for email:', e.message);
        }
      }

      setOpportunities(opps);
      setConfirmations(confs);
      setStatusUpdates(updates);
      setScanProgress('');
    } catch (e) {
      Alert.alert('Scan failed', e.message);
    }
    setScanning(false);
  }, [getGmailToken, loadInbox]);

  const handleAddOpportunity = (opp) => {
    Alert.alert(
      'Add to Pipeline',
      `Add "${opp.role}" at "${opp.company}" to your job tracker?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            await addJob({
              role: opp.role || 'Unknown Role',
              company: opp.company || 'Unknown Company',
              stage: 'Applied',
              salary: opp.salary || '',
              contact: '',
              notes: opp.summary || '',
              jobUrl: opp.applyUrl || '',
              tags: opp.skills || [],
              resumeVersion: '',
              appliedDate: new Date().toISOString().split('T')[0],
            });
            Alert.alert('✓ Added!', 'Job added to your pipeline.');
            setSelected(null);
          },
        },
      ]
    );
  };

  const handleAddConfirmation = (conf) => {
    Alert.alert(
      'Auto-add Application',
      `Mark "${conf.role}" at "${conf.company}" as Applied?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Pipeline',
          onPress: async () => {
            await addJob({
              role: conf.role || 'Unknown Role',
              company: conf.company || 'Unknown Company',
              stage: 'Applied',
              salary: '',
              contact: conf.contact || '',
              notes: conf.summary || '',
              jobUrl: '',
              tags: [],
              resumeVersion: '',
              appliedDate: conf.appliedDate || new Date().toISOString().split('T')[0],
            });
            Alert.alert('✓ Added!', 'Application added to pipeline.');
            setSelected(null);
          },
        },
      ]
    );
  };

  const tabs = [
    { id: 'opportunities', label: 'Opportunities', data: opportunities, emoji: '💼' },
    { id: 'confirmations', label: 'Applications', data: confirmations, emoji: '✅' },
    { id: 'updates', label: 'Updates', data: statusUpdates, emoji: '🔔' },
  ];

  const activeData = tab === 'opportunities' ? opportunities
    : tab === 'confirmations' ? confirmations
    : statusUpdates;

  return (
    <View style={styles.container}>
      {/* Scan button */}
      <View style={styles.scanBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.scanTitle}>AI Email Scanner</Text>
          <Text style={styles.scanSub}>
            {scanning ? scanProgress : 'Scan your Gmail for job emails'}
          </Text>
        </View>
        {scanning
          ? <ActivityIndicator color={colors.accent} />
          : <TouchableOpacity style={styles.scanBtn} onPress={scanEmails}>
              <Text style={styles.scanBtnText}>Scan Now</Text>
            </TouchableOpacity>
        }
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
              {t.emoji} {t.label}
              {t.data.length > 0 ? ` (${t.data.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={activeData}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={scanning ? '🔍' : '📭'}
            message={scanning ? 'Scanning...' : 'No emails found yet.\nTap "Scan Now" to start.'}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.emailCard}
            onPress={() => setSelected({ item, tabId: tab })}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={styles.companyBadge}>
                <Text style={styles.companyBadgeText}>
                  {(item.company || '??').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardRole} numberOfLines={1}>
                  {item.role || item.newStage || 'Status Update'}
                </Text>
                <Text style={styles.cardCompany} numberOfLines={1}>
                  {item.company || item._email?.from || ''}
                </Text>
              </View>
              {tab === 'opportunities' && item.salary && (
                <Text style={styles.salaryText}>{item.salary}</Text>
              )}
              {tab === 'updates' && item.newStage && (
                <View style={styles.stageBadge}>
                  <Text style={styles.stageBadgeText}>{item.newStage}</Text>
                </View>
              )}
            </View>
            {item.summary && (
              <Text style={styles.cardSummary} numberOfLines={2}>{item.summary}</Text>
            )}
            {item.skills?.length > 0 && (
              <View style={styles.tagsRow}>
                {item.skills.slice(0, 4).map((s) => <Tag key={s} label={s} />)}
              </View>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.cardEmailDate}>{item._email?.time || ''}</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => tab === 'opportunities'
                  ? handleAddOpportunity(item)
                  : tab === 'confirmations'
                  ? handleAddConfirmation(item)
                  : Alert.alert('Stage Update', `Update a job to "${item.newStage}"?\nGo to Jobs tab to update manually.`)
                }
              >
                <Text style={styles.addBtnText}>
                  {tab === 'opportunities' ? '+ Add to Pipeline'
                    : tab === 'confirmations' ? '+ Mark as Applied'
                    : '→ View Jobs'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Text style={styles.modalClose}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Email Details</Text>
              <View style={{ width: 60 }} />
            </View>
            <ScrollView style={{ padding: 20 }}>
              <Text style={styles.detailSubject}>{selected.item._email?.subject}</Text>
              <Text style={styles.detailFrom}>{selected.item._email?.from}</Text>
              <Text style={styles.detailTime}>{selected.item._email?.time}</Text>
              <View style={styles.divider} />
              <Text style={styles.detailBody}>{selected.item._email?.body || selected.item._email?.preview}</Text>
              <View style={{ height: 24 }} />
              {selected.tabId === 'opportunities' && (
                <Btn label="+ Add to Pipeline" variant="primary" onPress={() => handleAddOpportunity(selected.item)} />
              )}
              {selected.tabId === 'confirmations' && (
                <Btn label="+ Mark as Applied" variant="primary" onPress={() => handleAddConfirmation(selected.item)} />
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  scanBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bg2, borderBottomWidth: 1,
    borderBottomColor: colors.border, padding: 16,
  },
  scanTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  scanSub: { fontSize: 12, color: colors.text3, marginTop: 2 },
  scanBtn: {
    backgroundColor: colors.accent, paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 10,
  },
  scanBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  tabs: { flexDirection: 'row', backgroundColor: colors.bg2, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabText: { fontSize: 11, color: colors.text3, fontWeight: '500' },
  tabTextActive: { color: colors.accent, fontWeight: '700' },

  emailCard: {
    backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  companyBadge: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.accentBg,
    alignItems: 'center', justifyContent: 'center',
  },
  companyBadgeText: { fontSize: 13, fontWeight: '700', color: colors.accent },
  cardRole: { fontSize: 14, fontWeight: '600', color: colors.text },
  cardCompany: { fontSize: 12, color: colors.text2, marginTop: 1 },
  salaryText: { fontSize: 11, color: colors.green, fontWeight: '600' },
  stageBadge: { backgroundColor: colors.purpleBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  stageBadgeText: { fontSize: 11, color: colors.purple, fontWeight: '600' },
  cardSummary: { fontSize: 12, color: colors.text2, lineHeight: 18, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardEmailDate: { fontSize: 11, color: colors.text3 },
  addBtn: {
    backgroundColor: colors.accentBg, borderWidth: 1, borderColor: colors.accent,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  addBtnText: { fontSize: 12, color: colors.accent, fontWeight: '600' },

  modal: { flex: 1, backgroundColor: colors.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.bg2,
  },
  modalClose: { color: colors.text2, fontSize: 14 },
  modalTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  detailSubject: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  detailFrom: { fontSize: 13, color: colors.text2 },
  detailTime: { fontSize: 12, color: colors.text3, marginTop: 2, marginBottom: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
  detailBody: { fontSize: 14, color: colors.text2, lineHeight: 22 },
});