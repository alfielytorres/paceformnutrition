import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { nutritionService } from '@/lib/nutritionService';
import { DailySummary } from '@/types/nutrition';
import { formatCalories, formatMacro, getTodayDate } from '@/lib/calculations';

function getDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDisplayDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

function StatCard({ label, value, unit, icon, color = Colors.accent }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function OverviewScreen() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const userId = nutritionService.getDemoUserId();
  const today = getTodayDate();

  const loadData = useCallback(async () => {
    try {
      const data = await nutritionService.getDailySummary(userId, today);
      setSummary(data);
    } catch (e) {
      console.error(e);
    }
  }, [userId, today]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const caloriePercent = summary
    ? Math.min(1, summary.calories_consumed / summary.calories_target)
    : 0;

  const proteinTarget = 200;
  const carbsTarget = 300;
  const fatTarget = 88;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getDayGreeting()}</Text>
            <Text style={styles.name}>Alfie</Text>
          </View>
          <TouchableOpacity style={styles.aiButton} activeOpacity={0.8}>
            <Ionicons name="sparkles" size={16} color={Colors.accent} />
            <Text style={styles.aiButtonText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.dateLabel}>{getDisplayDate()}</Text>

        {/* Calorie Ring Card */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieCardHeader}>
            <Text style={styles.cardTitle}>Calorie Target</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/fuel')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View Fuel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calorieRow}>
            <View style={styles.calorieMain}>
              <Text style={styles.calorieNumber}>
                {summary ? formatCalories(summary.calories_consumed) : '0'}
              </Text>
              <Text style={styles.calorieUnit}>kcal eaten</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieSecondary}>
              <Text style={styles.calorieRemainingNumber}>
                {summary ? formatCalories(Math.max(0, summary.calories_remaining)) : formatCalories(2658)}
              </Text>
              <Text style={styles.calorieUnit}>remaining</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(caloriePercent * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              0
            </Text>
            <Text style={styles.progressLabel}>
              Target: {summary ? formatCalories(summary.calories_target) : '2,658'} kcal
            </Text>
          </View>
        </View>

        {/* Macro Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Macros</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            label="Protein"
            value={summary ? formatMacro(summary.protein_g) : '0g'}
            icon="fitness-outline"
            color="#F05A28"
          />
          <StatCard
            label="Carbs"
            value={summary ? formatMacro(summary.carbs_g) : '0g'}
            icon="leaf-outline"
            color="#F0A028"
          />
          <StatCard
            label="Fat"
            value={summary ? formatMacro(summary.fat_g) : '0g'}
            icon="water-outline"
            color="#F07828"
          />
          <StatCard
            label="Fibre"
            value={summary ? formatMacro(summary.fibre_g) : '0g'}
            icon="nutrition-outline"
            color="#C05A28"
          />
        </View>

        {/* Training Card Placeholder */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Training</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/strength')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.trainingCard}>
          <View style={styles.trainingEmptyIcon}>
            <Ionicons name="barbell-outline" size={32} color={Colors.textMuted} />
          </View>
          <Text style={styles.trainingEmptyTitle}>No session logged today</Text>
          <Text style={styles.trainingEmptySubtitle}>
            Head to Strength to log your workout
          </Text>
          <TouchableOpacity
            style={styles.trainingCTA}
            onPress={() => router.push('/(tabs)/strength')}
            activeOpacity={0.8}
          >
            <Text style={styles.trainingCTAText}>Log Session</Text>
          </TouchableOpacity>
        </View>

        {/* AI Coach Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardLeft}>
            <View style={styles.aiCardIcon}>
              <Ionicons name="sparkles" size={20} color={Colors.accent} />
            </View>
            <View>
              <Text style={styles.aiCardTitle}>Paceform AI</Text>
              <Text style={styles.aiCardSubtitle}>
                Get personalised fueling and performance advice
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.aiCardButton} activeOpacity={0.8}>
            <Text style={styles.aiCardButtonText}>Ask</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    gap: 6,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  calorieCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  calorieCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calorieMain: {
    flex: 1,
  },
  calorieNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 48,
  },
  calorieUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  calorieDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: Spacing.lg,
  },
  calorieSecondary: {
    flex: 1,
    alignItems: 'flex-end',
  },
  calorieRemainingNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent,
    lineHeight: 34,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  trainingCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  trainingEmptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  trainingEmptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  trainingEmptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  trainingCTA: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.mutedBorder,
  },
  trainingCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  aiCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  aiCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  aiCardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  aiCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    maxWidth: 200,
  },
  aiCardButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  aiCardButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
