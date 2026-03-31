import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../data/AppContext';
import { colors, STAGE_BAR_COLORS } from '../data/theme';
import { Card, StatCard, SectionHeader, StagePill, Avatar } from '../components/UI';

export default function DashboardScreen({ navigation }) {
  const styles = createStyles();
  const { jobs, reminders } = useApp();
  const total = jobs.length || 1;
  const active = jobs.filter((j) => !['Rejected', 'Ghosted', 'Offer'].includes(j.stage)).length;
  const offers = jobs.filter((j) => j.stage === 'Offer').length;
  const responseRate = Math.round((jobs.filter((j) => j.stage !== 'Applied').length / total) * 100);

  const funnelStages = ['Applied', 'Screening', 'Interview', 'HR Round', 'Offer'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Applied" value={jobs.length} sub="total" />
        <View style={{ width: 10 }} />
        <StatCard label="Active" value={active} sub="in pipeline" valueColor={colors.green} />
      </View>
      <View style={[styles.statsRow, { marginTop: 10 }]}>
        <StatCard label="Offers" value={offers} sub="received" valueColor={colors.amber} />
        <View style={{ width: 10 }} />
        <StatCard label="Response" value={`${responseRate}%`} sub="replied" valueColor={colors.purple} />
      </View>

      {/* Pipeline Funnel */}
      <Card style={styles.card}>
        <SectionHeader title="Pipeline funnel" />
        {funnelStages.map((s) => {
          const count = jobs.filter((j) => j.stage === s).length;
          const pct = Math.max((count / total) * 100, 3);
          return (
            <View key={s} style={styles.funnelRow}>
              <Text style={styles.funnelLabel}>{s}</Text>
              <View style={styles.funnelBarBg}>
                <View style={[styles.funnelBar, { width: `${pct}%`, backgroundColor: STAGE_BAR_COLORS[s] }]}>
                  {count > 0 && <Text style={styles.funnelBarText}>{count}</Text>}
                </View>
              </View>
              <Text style={styles.funnelCount}>{count}</Text>
            </View>
          );
        })}
      </Card>

      {/* Reminders */}
      <Card style={styles.card}>
        <SectionHeader
          title="Upcoming reminders"
          action="View all"
          onAction={() => navigation.navigate('Reminders')}
        />
        {reminders.slice(0, 3).map((r) => (
          <View key={r.id} style={styles.reminderRow}>
            <Text style={styles.reminderIcon}>{r.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>{r.title}</Text>
              <Text style={styles.reminderTime}>{r.time}</Text>
            </View>
          </View>
        ))}
        {reminders.length === 0 && <Text style={{ color: colors.text3, fontSize: 13 }}>No reminders</Text>}
      </Card>

      {/* Recent Activity */}
      <Card style={styles.card}>
        <SectionHeader title="Recent activity" action="See all" onAction={() => navigation.navigate('Jobs')} />
        {jobs.slice(0, 5).map((job, i) => (
          <TouchableOpacity
            key={job.id}
            onPress={() => navigation.navigate('Jobs', { openJobId: job.id })}
            style={[styles.activityRow, i < 4 && styles.activityBorder]}
          >
            <Avatar letters={job.avatar} size={34} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.activityRole}>{job.role}</Text>
              <Text style={styles.activityCompany}>{job.company}</Text>
            </View>
            <StagePill stage={job.stage} size="sm" />
          </TouchableOpacity>
        ))}
      </Card>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row' },
  card: { marginTop: 14 },

  funnelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  funnelLabel: { width: 72, fontSize: 11, color: colors.text2 },
  funnelBarBg: { flex: 1, height: 20, backgroundColor: colors.bg3, borderRadius: 5, overflow: 'hidden' },
  funnelBar: { height: '100%', borderRadius: 5, justifyContent: 'center', paddingLeft: 6 },
  funnelBarText: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  funnelCount: { width: 24, textAlign: 'right', fontSize: 11, color: colors.text2, marginLeft: 6 },

  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  reminderIcon: { fontSize: 16 },
  reminderTitle: { fontSize: 12, fontWeight: '500', color: colors.text },
  reminderTime: { fontSize: 11, color: colors.text3, marginTop: 1 },

  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  activityRole: { fontSize: 13, fontWeight: '500', color: colors.text },
  activityCompany: { fontSize: 11, color: colors.text2, marginTop: 1 },
});
