import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../data/AppContext';
import { colors, STAGES, STAGE_BAR_COLORS } from '../data/theme';
import { Card, StatCard, SectionHeader } from '../components/UI';

export default function AnalyticsScreen() {
  const styles = createStyles();
  const { jobs } = useApp();
  const total = jobs.length;
  const safeTotal = total || 1;

  const byStage = {};
  STAGES.forEach((s) => { byStage[s] = jobs.filter((j) => j.stage === s).length; });

  const stageSummary = STAGES.map((stage) => ({
    stage,
    count: byStage[stage] || 0,
    pct: Math.round(((byStage[stage] || 0) / safeTotal) * 100),
  }));

  const responseRate = Math.round((jobs.filter((j) => j.stage !== 'Applied').length / safeTotal) * 100);
  const offerRate = Math.round(((byStage['Offer'] || 0) / safeTotal) * 100);
  const interviewRate = Math.round((((byStage['Interview'] || 0) + (byStage['HR Round'] || 0) + (byStage['Offer'] || 0)) / safeTotal) * 100);
  const weeklyData = [2, 1, 3, 0, 2, 1, 1];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxWeekly = Math.max(...weeklyData, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Response" value={`${responseRate}%`} sub="companies replied" valueColor={colors.purple} />
        <View style={{ width: 10 }} />
        <StatCard label="Interview" value={`${interviewRate}%`} sub="reached interview" valueColor={colors.blue} />
      </View>
      <View style={[styles.statsRow, { marginTop: 10 }]}>
        <StatCard label="Offer Rate" value={`${offerRate}%`} sub="received offer" valueColor={colors.green} />
        <View style={{ width: 10 }} />
        <StatCard label="Avg Response" value="6d" sub="days to hear back" valueColor={colors.amber} />
      </View>

      {/* By stage */}
      <Card style={styles.card}>
        <SectionHeader title="Applications by stage" />
        {stageSummary.map(({ stage, count, pct }) => (
          <View key={stage} style={styles.stageBlock}>
            <View style={styles.stageBlockHeader}>
              <View style={styles.stageLabelWrap}>
                <View style={[styles.stageDot, { backgroundColor: STAGE_BAR_COLORS[stage] }]} />
                <Text style={styles.stageName}>{stage}</Text>
              </View>
              <View style={styles.stageMetaWrap}>
                <Text style={styles.stageCount}>{count}</Text>
                <Text style={styles.stagePercent}>{pct}%</Text>
              </View>
            </View>
            <View style={styles.stageTrack}>
              <View
                style={[
                  styles.stageFill,
                  {
                    width: `${count === 0 ? 0 : Math.max(pct, 8)}%`,
                    backgroundColor: STAGE_BAR_COLORS[stage],
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Weekly */}
      <Card style={styles.card}>
        <SectionHeader title="Weekly activity" />
        <View style={styles.weekChart}>
          {weekDays.map((day, i) => {
            const height = weeklyData[i] === 0 ? 8 : Math.max(18, (weeklyData[i] / maxWeekly) * 90);
            return (
              <View key={day} style={styles.weekCol}>
                <Text style={styles.weekValue}>{weeklyData[i]}</Text>
                <View style={styles.weekTrack}>
                  <View style={[styles.weekBar, { height }]} />
                </View>
                <Text style={styles.weekLabel}>{day}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Funnel bars */}
      <Card style={styles.card}>
        <SectionHeader title="Conversion funnel" />
        <View style={styles.funnel}>
          {['Applied', 'Screening', 'Interview', 'HR Round', 'Offer'].map((s) => {
            const count = byStage[s] || 0;
            const pct = total ? Math.round((count / safeTotal) * 100) : 0;
            const height = count === 0 ? 14 : Math.max(32, pct * 1.4 + 8);

            return (
              <View key={s} style={styles.funnelCol}>
                <View style={[styles.funnelCountPill, { borderColor: STAGE_BAR_COLORS[s] }]}>
                  <Text style={[styles.funnelCount, { color: STAGE_BAR_COLORS[s] }]}>{count}</Text>
                </View>
                <View style={styles.funnelTrack}>
                  <View style={[styles.funnelBar, { height, backgroundColor: STAGE_BAR_COLORS[s] }]} />
                </View>
                <Text style={styles.funnelPct}>{pct}%</Text>
                <Text style={styles.funnelLabel}>{s.replace(' Round', '\nRound')}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Summary text */}
      <Card style={styles.card}>
        <SectionHeader title="Job search summary" />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total applications</Text>
          <Text style={styles.summaryValue}>{jobs.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Active pipeline</Text>
          <Text style={styles.summaryValue}>{jobs.filter(j => !['Rejected', 'Ghosted', 'Offer'].includes(j.stage)).length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Rejected</Text>
          <Text style={[styles.summaryValue, { color: colors.red }]}>{byStage['Rejected'] || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ghosted</Text>
          <Text style={[styles.summaryValue, { color: colors.text3 }]}>{byStage['Ghosted'] || 0}</Text>
        </View>
        <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.summaryLabel}>Offers received</Text>
          <Text style={[styles.summaryValue, { color: colors.green }]}>{byStage['Offer'] || 0}</Text>
        </View>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row' },
  card: { marginTop: 14 },

  stageBlock: { marginBottom: 12 },
  stageBlockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  stageLabelWrap: { flexDirection: 'row', alignItems: 'center' },
  stageDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  stageName: { fontSize: 13, fontWeight: '600', color: colors.text },
  stageMetaWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stageCount: { fontSize: 13, fontWeight: '700', color: colors.text },
  stagePercent: { fontSize: 11, color: colors.text3 },
  stageTrack: { height: 12, backgroundColor: colors.bg3, borderRadius: 999, overflow: 'hidden' },
  stageFill: { height: '100%', borderRadius: 999 },

  weekChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 136,
    paddingTop: 8,
  },
  weekCol: { flex: 1, alignItems: 'center', gap: 6 },
  weekValue: { fontSize: 10, color: colors.text2, fontWeight: '600' },
  weekTrack: {
    width: 24,
    height: 90,
    borderRadius: 12,
    backgroundColor: colors.bg3,
    justifyContent: 'flex-end',
    padding: 3,
  },
  weekBar: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: colors.accent,
    opacity: 0.85,
  },
  weekLabel: { fontSize: 10, color: colors.text3 },

  funnel: { flexDirection: 'row', alignItems: 'flex-end', height: 190, paddingTop: 8 },
  funnelCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  funnelCountPill: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: colors.bg3,
    alignItems: 'center',
  },
  funnelCount: { fontSize: 12, fontWeight: '700' },
  funnelTrack: {
    width: '72%',
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.bg3,
    borderRadius: 12,
    paddingBottom: 6,
  },
  funnelBar: { width: '62%', borderRadius: 10, minHeight: 6 },
  funnelPct: { fontSize: 10, fontWeight: '600', color: colors.text2 },
  funnelLabel: { fontSize: 9, color: colors.text3, textAlign: 'center', lineHeight: 12 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLabel: { fontSize: 13, color: colors.text2 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors.text },
});
