import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, STAGE_COLORS } from '../data/theme';

// ── Stage Pill ──────────────────────────────────────────────
export function StagePill({ stage, size = 'md' }) {
  const sc = STAGE_COLORS[stage] || STAGE_COLORS['Ghosted'];
  const fontSize = size === 'sm' ? 10 : 11;
  const px = size === 'sm' ? 7 : 9;
  const py = size === 'sm' ? 2 : 3;
  return (
    <View style={[styles.pill, { backgroundColor: sc.bg, paddingHorizontal: px, paddingVertical: py }]}>
      <Text style={[styles.pillText, { color: sc.text, fontSize }]}>{stage}</Text>
    </View>
  );
}

// ── Company Avatar ───────────────────────────────────────────
export function Avatar({ letters, size = 40 }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size * 0.25 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>{letters}</Text>
    </View>
  );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Button ───────────────────────────────────────────────────
export function Btn({ label, onPress, variant = 'default', size = 'md', disabled, loading, style }) {
  const isSmall = size === 'sm';
  const bg =
    variant === 'primary' ? colors.accent :
    variant === 'danger'  ? colors.red :
    variant === 'ghost'   ? 'transparent' : colors.bg3;
  const borderColor =
    variant === 'primary' ? colors.accent :
    variant === 'danger'  ? colors.red :
    variant === 'ghost'   ? 'transparent' : colors.border2;
  const textColor =
    variant === 'primary' ? '#fff' :
    variant === 'danger'  ? '#fff' : colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, paddingVertical: isSmall ? 6 : 9, paddingHorizontal: isSmall ? 12 : 16, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.btnText, { color: textColor, fontSize: isSmall ? 12 : 13 }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Section Header ───────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ color: colors.accent, fontSize: 12 }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Stat Card ────────────────────────────────────────────────
export function StatCard({ label, value, sub, valueColor }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

// ── Tag ──────────────────────────────────────────────────────
export function Tag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon, message }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ── Divider ──────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  pill: { borderRadius: 20, alignSelf: 'flex-start' },
  pillText: { fontWeight: '600', letterSpacing: 0.2 },

  avatar: { backgroundColor: colors.bg4, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.text2, fontWeight: '600' },

  card: {
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },

  btn: {
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnText: { fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '500', color: colors.text2 },

  statCard: {
    flex: 1,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  statLabel: { fontSize: 10, color: colors.text3, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -1, lineHeight: 28 },
  statSub: { fontSize: 10, color: colors.text3, marginTop: 3 },

  tag: { backgroundColor: colors.bg4, borderWidth: 1, borderColor: colors.border, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontSize: 10, color: colors.text2 },

  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 36, marginBottom: 10, opacity: 0.4 },
  emptyText: { fontSize: 13, color: colors.text3 },

  divider: { height: 1, backgroundColor: colors.border },
});
