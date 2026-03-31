import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, FlatList,
} from 'react-native';
import { useApp } from '../data/AppContext';
import { colors, STAGES, STAGE_COLORS } from '../data/theme';
import { StagePill, Avatar, Card, Btn, Tag, EmptyState, Divider } from '../components/UI';
import AddJobModal from '../components/AddJobModal';
import ComposeModal from '../components/ComposeModal';

// ── Jobs List Screen ─────────────────────────────────────────
export function JobsScreen({ navigation, route }) {
  const { jobs, addJob } = useApp();
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filter === 'All' ? jobs : jobs.filter((j) => j.stage === filter);
  const allFilters = ['All', ...STAGES];
  const stageCounts = allFilters.reduce((acc, stage) => {
    acc[stage] = stage === 'All' ? jobs.length : jobs.filter((j) => j.stage === stage).length;
    return acc;
  }, {});
  const activePipelineCount = jobs.filter((j) => !['Rejected', 'Ghosted', 'Offer'].includes(j.stage)).length;

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {allFilters.map((f) => {
          const active = filter === f;
          const stageTheme = f === 'All'
            ? { bg: colors.accentBg, text: colors.accent }
            : (STAGE_COLORS[f] || { bg: colors.bg3, text: colors.text2 });

          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                active && styles.filterChipActive,
                active && { backgroundColor: stageTheme.bg, borderColor: stageTheme.text },
              ]}
            >
              <Text style={[
                styles.filterChipText,
                active && styles.filterChipTextActive,
                active && { color: stageTheme.text },
              ]}>
                {f}
              </Text>
              <View style={[
                styles.filterCount,
                active && { backgroundColor: stageTheme.text },
              ]}>
                <Text style={[
                  styles.filterCountText,
                  active && { color: '#fff' },
                ]}>
                  {stageCounts[f]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 12, paddingBottom: 96 }}
        ListHeaderComponent={(
          <Card style={styles.jobsSummaryCard}>
            <View style={styles.jobsSummaryTop}>
              <Text style={styles.jobsSummaryTitle}>{filter} applications</Text>
              <Text style={styles.jobsSummaryCount}>{filtered.length}</Text>
            </View>
            <Text style={styles.jobsSummarySub}>
              {activePipelineCount} active in your pipeline • {jobs.length} total tracked
            </Text>
          </Card>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="📭" message="No jobs in this stage" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
            activeOpacity={0.75}
          >
            <Avatar letters={item.avatar} size={42} />
            <View style={styles.jobInfo}>
              <Text style={styles.jobRole}>{item.role}</Text>
              <Text style={styles.jobCompany}>{item.company}</Text>
              <View style={styles.jobMeta}>
                <StagePill stage={item.stage} size="sm" />
                <Text style={styles.jobDate}>{item.appliedDate}</Text>
                {item.salary ? <Text style={styles.jobSalary}>{item.salary}</Text> : null}
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddJobModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={addJob}
      />
    </View>
  );
}

// ── Job Detail Screen ────────────────────────────────────────
export function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const { jobs, updateJob, deleteJob, addTimelineEvent, sendEmail } = useApp();
  const job = jobs.find((j) => j.id === jobId);
  const [tab, setTab] = useState('info');
  const [showEdit, setShowEdit] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState({});

  if (!job) return null;

  const stageIndex = STAGES.indexOf(job.stage);

  const openCompose = (defaults = {}) => {
    setComposeDefaults(defaults);
    setShowCompose(true);
  };

  const handleSend = async ({ to, subject, body }) => {
    const result = await sendEmail({ to, subject, body });
    if (result.success) Alert.alert('Sent!', `Email sent to ${to}`);
    else Alert.alert('Send failed', result.error || 'Could not reach backend.');
  };

  const confirmDelete = () => {
    Alert.alert('Delete Job', `Remove ${job.role} at ${job.company}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteJob(job.id); navigation.goBack(); } },
    ]);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => setShowEdit(true)}>
            <Text style={{ color: colors.accent, fontSize: 15 }}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDelete}>
            <Text style={{ color: colors.red, fontSize: 15 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, job]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <View style={styles.detailHeaderRow}>
          <Avatar letters={job.avatar} size={48} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.detailRole}>{job.role}</Text>
            <Text style={styles.detailCompany}>{job.company}</Text>
          </View>
          <StagePill stage={job.stage} />
        </View>

        {/* Stage progress */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {['Applied', 'Screening', 'Interview', 'HR Round', 'Offer'].map((s, i) => {
            const isDone = i < stageIndex;
            const isCurrent = s === job.stage;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => updateJob(job.id, { stage: s })}
                style={[styles.stageStep, isDone && styles.stageStepDone, isCurrent && styles.stageStepCurrent]}
              >
                <Text style={[styles.stageStepText, isDone && styles.stageStepTextDone, isCurrent && styles.stageStepTextCurrent]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['info', 'timeline', 'emails'].map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {tab === 'info' && <InfoTab job={job} updateJob={updateJob} openCompose={openCompose} />}
        {tab === 'timeline' && <TimelineTab job={job} addTimelineEvent={addTimelineEvent} />}
        {tab === 'emails' && <EmailsTab job={job} openCompose={openCompose} />}
        <View style={{ height: 24 }} />
      </ScrollView>

      <AddJobModal visible={showEdit} onClose={() => setShowEdit(false)} onSave={(data) => updateJob(job.id, data)} editJob={job} />
      <ComposeModal
        visible={showCompose}
        onClose={() => setShowCompose(false)}
        onSend={handleSend}
        defaultTo={composeDefaults.to || job.contact || ''}
        defaultSubject={composeDefaults.subject || `Following up - ${job.role} at ${job.company}`}
        defaultBody={composeDefaults.body || `Hi,\n\nI wanted to follow up on my application for the ${job.role} position at ${job.company}.\n\nBest regards`}
      />
    </View>
  );
}

function InfoTab({ job, updateJob, openCompose }) {
  const [notes, setNotes] = useState(job.notes || '');
  return (
    <View>
      <Row label="Stage">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STAGES.map((s) => (
            <TouchableOpacity key={s} onPress={() => updateJob(job.id, { stage: s })}
              style={[styles.stageChip, job.stage === s && styles.stageChipActive]}>
              <Text style={[styles.stageChipTxt, job.stage === s && styles.stageChipTxtActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Row>
      <Divider style={{ marginVertical: 12 }} />
      {job.salary ? <Row label="Salary"><Text style={[styles.infoValue, { color: colors.green }]}>{job.salary}</Text></Row> : null}
      {job.contact ? <Row label="Contact"><Text style={styles.infoValue}>{job.contact}</Text></Row> : null}
      <Row label="Applied"><Text style={[styles.infoValue, { fontFamily: 'monospace' }]}>{job.appliedDate}</Text></Row>
      {job.resumeVersion ? <Row label="Resume"><View style={{ marginTop: 4 }}><Tag label={job.resumeVersion} /></View></Row> : null}
      {job.tags?.length > 0 && (
        <Row label="Tags">
          <View style={styles.tagsRow}>
            {job.tags.map((t) => <Tag key={t} label={t} />)}
          </View>
        </Row>
      )}
      <Divider style={{ marginVertical: 12 }} />
      <Text style={styles.fieldLabel}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholderTextColor={colors.text3}
        placeholder="Add notes..."
      />
      <View style={styles.actionRow}>
        <Btn label="Save Notes" variant="primary" size="sm" onPress={() => { updateJob(job.id, { notes }); Alert.alert('Saved!'); }} />
        <Btn label="✉ Email" size="sm" onPress={() => openCompose({})} />
      </View>
    </View>
  );
}

function TimelineTab({ job, addTimelineEvent }) {
  const promptEvent = () => {
    Alert.prompt('Add Event', 'Describe this event:', (text) => {
      if (text?.trim()) addTimelineEvent(job.id, text.trim());
    });
  };

  return (
    <View>
      {job.timeline.map((item, i) => (
        <View key={i} style={styles.tlItem}>
          <View style={[styles.tlDot, styles[`tlDot_${item.type}`] || styles.tlDot_default]} />
          {i < job.timeline.length - 1 && <View style={styles.tlLine} />}
          <View style={styles.tlContent}>
            <Text style={styles.tlEvent}>{item.event}</Text>
            <Text style={styles.tlDate}>{item.date}</Text>
          </View>
        </View>
      ))}
      <Btn label="+ Add Event" variant="ghost" onPress={promptEvent} style={{ marginTop: 8 }} />
    </View>
  );
}

function EmailsTab({ job, openCompose }) {
  if (!job.emails?.length) {
    return (
      <View>
        <EmptyState icon="✉️" message="No emails yet" />
        <Btn label="Compose Email" variant="primary" onPress={() => openCompose({})} style={{ marginTop: 12 }} />
      </View>
    );
  }
  return (
    <View>
      {job.emails.map((e, i) => (
        <View key={i} style={[styles.emailItem, i < job.emails.length - 1 && styles.emailBorder]}>
          <Text style={styles.emailDate}>{e.date}</Text>
          <Text style={styles.emailFrom}>{e.from}</Text>
          <Text style={styles.emailSubject}>{e.subject}</Text>
          <Text style={styles.emailPreview}>{e.preview}</Text>
        </View>
      ))}
      <Btn label="✉ Compose Reply" variant="primary" onPress={() => openCompose({})} style={{ marginTop: 12 }} />
    </View>
  );
}

function Row({ label, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // filter
  filterScroll: { borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 72 },
  filterContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 8, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 22, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bg3,
  },
  filterChipActive: { transform: [{ scale: 1.02 }] },
  filterChipText: { fontSize: 12, color: colors.text2, fontWeight: '600' },
  filterChipTextActive: { color: colors.accent },
  filterCount: {
    minWidth: 22, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 10, backgroundColor: colors.bg4, alignItems: 'center', justifyContent: 'center',
  },
  filterCountText: { fontSize: 10, fontWeight: '700', color: colors.text2 },

  jobsSummaryCard: { marginBottom: 12, paddingVertical: 14 },
  jobsSummaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  jobsSummaryTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  jobsSummaryCount: { fontSize: 22, fontWeight: '800', color: colors.accent, letterSpacing: -0.6 },
  jobsSummarySub: { fontSize: 12, color: colors.text2, marginTop: 4 },

  // job card
  jobCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 3,
  },
  jobInfo: { flex: 1, marginLeft: 12 },
  jobRole: { fontSize: 15, fontWeight: '700', color: colors.text },
  jobCompany: { fontSize: 12, color: colors.text2, marginTop: 3 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  jobDate: { fontSize: 11, color: colors.text3 },
  jobSalary: { fontSize: 11, color: colors.green },
  chevron: { fontSize: 20, color: colors.text3, marginLeft: 4 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },

  // detail header
  detailHeader: { backgroundColor: colors.bg2, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 16 },
  detailHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  detailRole: { fontSize: 17, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  detailCompany: { fontSize: 13, color: colors.text2, marginTop: 2 },

  stageStep: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
  stageStepDone: { borderColor: colors.accent },
  stageStepCurrent: { borderColor: colors.accent, backgroundColor: colors.accent },
  stageStepText: { fontSize: 10, color: colors.text3, fontWeight: '500' },
  stageStepTextDone: { color: colors.accent },
  stageStepTextCurrent: { color: '#fff' },

  // tabs
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg2 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabText: { fontSize: 13, color: colors.text2 },
  tabTextActive: { color: colors.accent, fontWeight: '600' },

  // info tab
  row: { paddingVertical: 10 },
  rowLabel: { fontSize: 10, color: colors.text3, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500', marginBottom: 4 },
  infoValue: { fontSize: 14, color: colors.text },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  fieldLabel: { fontSize: 10, color: colors.text3, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '500', marginBottom: 6 },
  notesInput: {
    backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 11, color: colors.text, fontSize: 13,
    minHeight: 100, textAlignVertical: 'top',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },

  stageChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: colors.border, marginRight: 7, marginTop: 6 },
  stageChipActive: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  stageChipTxt: { fontSize: 11, color: colors.text2 },
  stageChipTxtActive: { color: colors.accent, fontWeight: '600' },

  // timeline
  tlItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
  tlDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg4, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tlDot_blue: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  tlDot_green: { borderColor: colors.green, backgroundColor: colors.greenBg },
  tlDot_amber: { borderColor: colors.amber, backgroundColor: colors.amberBg },
  tlDot_purple: { borderColor: colors.purple, backgroundColor: colors.purpleBg },
  tlDot_red: { borderColor: colors.red, backgroundColor: colors.redBg },
  tlDot_default: {},
  tlLine: { position: 'absolute', left: 10, top: 24, bottom: -18, width: 1, backgroundColor: colors.border },
  tlContent: { marginLeft: 12 },
  tlEvent: { fontSize: 13, fontWeight: '500', color: colors.text },
  tlDate: { fontSize: 11, color: colors.text3, marginTop: 2 },

  // emails
  emailItem: { paddingVertical: 12 },
  emailBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  emailDate: { fontSize: 10, color: colors.text3, textAlign: 'right' },
  emailFrom: { fontSize: 13, fontWeight: '600', color: colors.text },
  emailSubject: { fontSize: 12, color: colors.text2, marginTop: 2 },
  emailPreview: { fontSize: 11, color: colors.text3, marginTop: 2 },
});
