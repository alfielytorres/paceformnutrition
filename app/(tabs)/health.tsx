import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface HealthMetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  unit: string;
  trend?: string;
  trendUp?: boolean;
}

function HealthMetricCard({ icon, label, value, unit, trend, trendUp }: HealthMetricCardProps) {
  return (
    <View style={metricStyles.card}>
      <View style={metricStyles.iconWrap}>
        <Ionicons name={icon} size={20} color={Colors.accent} />
      </View>
      <Text style={metricStyles.label}>{label}</Text>
      <View style={metricStyles.valueRow}>
        <Text style={metricStyles.value}>{value}</Text>
        <Text style={metricStyles.unit}>{unit}</Text>
      </View>
      {trend ? (
        <View style={metricStyles.trendRow}>
          <Ionicons
            name={trendUp ? 'trending-up' : 'trending-down'}
            size={12}
            color={trendUp ? Colors.accent : Colors.textMuted}
          />
          <Text style={[metricStyles.trend, trendUp && metricStyles.trendPositive]}>
            {trend}
          </Text>
        </View>
      ) : (
        <Text style={metricStyles.noData}>Not logged</Text>
      )}
    </View>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  unit: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trend: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  trendPositive: {
    color: Colors.accent,
  },
  noData: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});

export default function HealthScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Health</Text>
        <TouchableOpacity style={styles.syncBtn} activeOpacity={0.8}>
          <Ionicons name="sync-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Metrics Grid */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>Body Metrics</Text>
        </View>
        <View style={styles.metricsGrid}>
          <HealthMetricCard
            icon="scale-outline"
            label="Weight"
            value="82.4"
            unit="kg"
            trend="-0.6kg this week"
            trendUp={false}
          />
          <HealthMetricCard
            icon="body-outline"
            label="Body Fat"
            value="14.2"
            unit="%"
            trend="-0.4% this week"
            trendUp={false}
          />
          <HealthMetricCard
            icon="fitness-outline"
            label="Muscle"
            value="68.1"
            unit="kg"
            trend="+0.2kg this week"
            trendUp={true}
          />
          <HealthMetricCard
            icon="water-outline"
            label="Hydration"
            value="1.8"
            unit="L today"
          />
        </View>

        {/* Sleep Card */}
        <View style={styles.sleepCard}>
          <View style={styles.sleepHeader}>
            <View style={styles.sleepIconRow}>
              <View style={styles.sleepIcon}>
                <Ionicons name="moon-outline" size={20} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.sleepTitle}>Sleep</Text>
                <Text style={styles.sleepDate}>Last night</Text>
              </View>
            </View>
            <View style={styles.sleepDuration}>
              <Text style={styles.sleepHours}>7</Text>
              <Text style={styles.sleepMins}>h 42m</Text>
            </View>
          </View>

          <View style={styles.sleepStagesRow}>
            {[
              { label: 'Deep', value: '1h 12m', pct: 16 },
              { label: 'REM', value: '2h 04m', pct: 27 },
              { label: 'Light', value: '4h 26m', pct: 57 },
            ].map((stage, i) => (
              <View key={i} style={styles.sleepStage}>
                <Text style={styles.sleepStageValue}>{stage.value}</Text>
                <Text style={styles.sleepStageLabel}>{stage.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sleepBar}>
            <View style={[styles.sleepBarSegment, { flex: 16, backgroundColor: '#4040C0' }]} />
            <View style={[styles.sleepBarSegment, { flex: 27, backgroundColor: '#8060D0' }]} />
            <View style={[styles.sleepBarSegment, { flex: 57, backgroundColor: '#4080A0' }]} />
          </View>
        </View>

        {/* Recovery card */}
        <View style={styles.recoveryCard}>
          <View style={styles.recoveryHeader}>
            <View style={styles.recoveryLeft}>
              <Text style={styles.recoveryLabel}>Recovery Score</Text>
              <Text style={styles.recoveryScore}>74</Text>
              <Text style={styles.recoveryStatus}>Good — ready to train</Text>
            </View>
            <View style={styles.recoveryRing}>
              <Text style={styles.recoveryRingNumber}>74</Text>
              <Text style={styles.recoveryRingPct}>/ 100</Text>
            </View>
          </View>
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="heart-outline" size={24} color={Colors.accent} />
          <View style={styles.comingSoonText}>
            <Text style={styles.comingSoonTitle}>Health integrations coming soon</Text>
            <Text style={styles.comingSoonSubtitle}>
              Apple Health, Garmin, Whoop, and more
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  syncText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sleepCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sleepIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sleepIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sleepDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  sleepDuration: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  sleepHours: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sleepMins: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  sleepStagesRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  sleepStage: {
    flex: 1,
    alignItems: 'center',
  },
  sleepStageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sleepStageLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  sleepBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  sleepBarSegment: {
    height: '100%',
    borderRadius: 4,
  },
  recoveryCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  recoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoveryLeft: {
    flex: 1,
  },
  recoveryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  recoveryScore: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.accent,
    lineHeight: 54,
  },
  recoveryStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recoveryRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
  },
  recoveryRingNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.accent,
  },
  recoveryRingPct: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  comingSoonCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  comingSoonText: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  comingSoonSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
