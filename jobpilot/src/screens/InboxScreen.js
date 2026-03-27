import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useApp } from '../data/AppContext';
import { colors } from '../data/theme';
import { EmptyState } from '../components/UI';
import ComposeModal from '../components/ComposeModal';

export default function InboxScreen() {
  const { inbox, markEmailRead, sendEmail, loadInbox, inboxLoading } = useApp();
  const [showCompose, setShowCompose] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadInbox();
  }, []);

  const handleSend = async (params) => {
    setSending(true);
    const result = await sendEmail(params);
    setSending(false);
    if (result.success) {
      Alert.alert('✓ Sent', `Email sent to ${params.to}`);
    } else {
      Alert.alert('Send failed', result.error || 'Could not reach backend.\nMake sure backend is running.');
    }
  };

  if (selected) {
    return (
      <EmailDetail
        email={selected}
        onBack={() => setSelected(null)}
        onReply={(defaults) => { setShowCompose(true); }}
        showCompose={showCompose}
        onCloseCompose={() => setShowCompose(false)}
        onSend={handleSend}
        sending={sending}
      />
    );
  }

  return (
    <View style={styles.container}>
      {inboxLoading && inbox.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Fetching job emails from Gmail...</Text>
        </View>
      ) : (
        <FlatList
          data={inbox}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={inboxLoading}
              onRefresh={loadInbox}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <EmptyState icon="📭" message="No job-related emails found" />
              <Text style={styles.hintText}>Pull down to refresh{'\n'}Make sure your backend is running</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, item.unread && styles.itemUnread]}
              onPress={() => { markEmailRead(item.id); setSelected(item); }}
              activeOpacity={0.75}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {(item.fromName || item.from || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.fromName, item.unread && styles.bold]} numberOfLines={1}>
                    {item.fromName || item.from}
                  </Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={[styles.subject, item.unread && styles.bold]} numberOfLines={1}>
                  {item.subject}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>{item.preview}</Text>
              </View>
              {item.unread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowCompose(true)}>
        <Text style={styles.fabText}>✎</Text>
      </TouchableOpacity>

      <ComposeModal
        visible={showCompose}
        onClose={() => setShowCompose(false)}
        onSend={handleSend}
        sending={sending}
      />
    </View>
  );
}

function EmailDetail({ email, onBack, showCompose, onCloseCompose, onSend, sending }) {
  const [replyOpen, setReplyOpen] = useState(false);
  return (
    <View style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Inbox</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={styles.emailSubject}>{email.subject}</Text>
        <Text style={styles.emailMeta}>From: {email.from}</Text>
        <Text style={styles.emailMeta}>{email.time}</Text>
        <View style={styles.separator} />
        <Text style={styles.emailBody}>{email.body}</Text>
        <TouchableOpacity style={styles.replyBtn} onPress={() => setReplyOpen(true)}>
          <Text style={styles.replyBtnText}>↩ Reply</Text>
        </TouchableOpacity>
      </View>
      <ComposeModal
        visible={replyOpen}
        onClose={() => setReplyOpen(false)}
        onSend={async (params) => { await onSend(params); setReplyOpen(false); }}
        defaultTo={email.from}
        defaultSubject={`Re: ${email.subject}`}
        defaultBody=""
        sending={sending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { color: colors.text2, fontSize: 13, marginTop: 14, textAlign: 'center' },
  hintText: { color: colors.text3, fontSize: 12, marginTop: 12, textAlign: 'center', lineHeight: 20 },

  item: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.bg },
  itemUnread: { backgroundColor: colors.bg2 },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.bg4, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarLetter: { fontSize: 16, fontWeight: '700', color: colors.text2 },
  itemContent: { flex: 1, marginLeft: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  fromName: { fontSize: 13, color: colors.text2, flex: 1, marginRight: 8 },
  bold: { fontWeight: '700', color: colors.text },
  time: { fontSize: 11, color: colors.text3, flexShrink: 0 },
  subject: { fontSize: 13, color: colors.text2, marginBottom: 2 },
  preview: { fontSize: 12, color: colors.text3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginLeft: 8, flexShrink: 0 },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: 8 },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 20, color: '#fff' },

  detailHeader: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg2 },
  backBtn: { color: colors.accent, fontSize: 15, fontWeight: '500' },
  emailSubject: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emailMeta: { fontSize: 12, color: colors.text3, marginBottom: 2 },
  emailBody: { fontSize: 14, color: colors.text2, lineHeight: 22, marginTop: 8 },
  replyBtn: { marginTop: 24, borderWidth: 1, borderColor: colors.accent, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.accentBg },
  replyBtnText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
});
