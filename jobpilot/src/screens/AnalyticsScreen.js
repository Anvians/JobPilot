import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../data/AppContext';
import { colors, STAGES, STAGE_BAR_COLORS } from '../data/theme';
import { Card, StatCard, SectionHeader } from '../components/UI';

export default function AnalyticsScreen() {
  const { jobs } = useApp();
  const total = jobs.length || 1;

  const byStage = {};
  STAGES.forEach((s) => { byStage[s] = jobs.filter((j) => j.stage === s).length; });

  const responseRate = Math.round((jobs.filter((j) => j.stage !== 'Applied').length / total) * 100);
  const offerRate = Math.round(((byStage['Offer'] || 0) / total) * 100);
  const interviewRate = Math.round((((byStage['Interview'] || 0) + (byStage['HR Round'] || 0) + (byStage['Offer'] || 0)) / total) * 100);
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
        {STAGES.map((s) => {
          const pct = Math.max((byStage[s] / total) * 100, 2);
          return (
            <View key={s} style={styles.barRow}>
              <Text style={styles.barLabel}>{s}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: STAGE_BAR_COLORS[s] }]} />
              </View>
              <Text style={styles.barVal}>{byStage[s]}</Text>
            </View>
          );
        })}
      </Card>

      {/* Weekly */}
      <Card style={styles.card}>
        <SectionHeader title="Weekly activity" />
        {weekDays.map((day, i) => {
          const pct = Math.round((weeklyData[i] / maxWeekly) * 100);
          return (
            <View key={day} style={styles.barRow}>
              <Text style={[styles.barLabel, { width: 32 }]}>{day}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.accent, opacity: 0.7 }]} />
              </View>
              <Text style={styles.barVal}>{weeklyData[i]}</Text>
            </View>
          );
        })}
      </Card>

      {/* Funnel bars */}
      <Card style={styles.card}>
        <SectionHeader title="Conversion funnel" />
        <View style={styles.funnel}>
          {['Applied', 'Screening', 'Interview', 'HR Round', 'Offer'].map((s) => {
            const count = byStage[s] || 0;
            const pct = Math.max(Math.round((count / total) * 100), 5);
            return (
              <View key={s} style={styles.funnelCol}>
                <Text style={[styles.funnelCount, { color: STAGE_BAR_COLORS[s] }]}>{count}</Text>
                <View style={[styles.funnelBar, { height: pct * 1.5, backgroundColor: STAGE_BAR_COLORS[s] }]} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row' },
  card: { marginTop: 14 },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 78, fontSize: 11, color: colors.text2 },
  barBg: { flex: 1, height: 20, backgroundColor: colors.bg3, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barVal: { width: 22, textAlign: 'right', fontSize: 11, color: colors.text3, marginLeft: 6 },

  funnel: { flexDirection: 'row', alignItems: 'flex-end', height: 140, paddingBottom: 4 },
  funnelCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  funnelCount: { fontSize: 12, fontWeight: '600' },
  funnelBar: { width: '70%', borderRadius: 4, minHeight: 4 },
  funnelLabel: { fontSize: 8, color: colors.text3, textAlign: 'center' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLabel: { fontSize: 13, color: colors.text2 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors.text },
});
