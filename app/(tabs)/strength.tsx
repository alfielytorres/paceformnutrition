import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const RECENT_EXERCISES = [
  { name: 'Bench Press', sets: 4, reps: '8 × 80kg', pr: false },
  { name: 'Squat', sets: 5, reps: '5 × 100kg', pr: true },
  { name: 'Deadlift', sets: 3, reps: '5 × 130kg', pr: false },
];

export default function StrengthScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Strength</Text>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Today's session placeholder */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionCardTop}>
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionBadgeText}>TODAY</Text>
            </View>
            <Text style={styles.sessionCardTitle}>No session logged</Text>
            <Text style={styles.sessionCardSubtitle}>
              Log your lifts to track progressive overload and performance
            </Text>
          </View>

          <TouchableOpacity style={styles.startSessionBtn} activeOpacity={0.85}>
            <Ionicons name="play" size={16} color={Colors.white} />
            <Text style={styles.startSessionText}>Start Session</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Sessions</Text>
            <Text style={styles.statPeriod}>this month</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.2</Text>
            <Text style={styles.statLabel}>Avg/week</Text>
            <Text style={styles.statPeriod}>last 4 weeks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>PRs set</Text>
            <Text style={styles.statPeriod}>this month</Text>
          </View>
        </View>

        {/* Recent Lifts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Recent Lifts</Text>
          </View>
          <View style={styles.exerciseList}>
            {RECENT_EXERCISES.map((ex, i) => (
              <View key={i} style={styles.exerciseRow}>
                <View style={styles.exerciseIcon}>
                  <Ionicons name="barbell-outline" size={18} color={Colors.accent} />
                </View>
                <View style={styles.exerciseInfo}>
                  <View style={styles.exerciseNameRow}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    {ex.pr && (
                      <View style={styles.prBadge}>
                        <Text style={styles.prBadgeText}>PR</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.exerciseMeta}>
                    {ex.sets} sets · {ex.reps}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            ))}
          </View>
        </View>

        {/* Coming Soon Banner */}
        <View style={styles.comingSoonCard}>
          <Ionicons name="construct-outline" size={24} color={Colors.accent} />
          <View style={styles.comingSoonText}>
            <Text style={styles.comingSoonTitle}>Full strength tracking coming soon</Text>
            <Text style={styles.comingSoonSubtitle}>
              Program builder, volume tracking, and performance graphs
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  sessionCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  sessionCardTop: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sessionBadge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  sessionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 1,
  },
  sessionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sessionCardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  startSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  startSessionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statPeriod: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  prBadge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  prBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  exerciseMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
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
