import React, { useCallback, useState } from 'react';
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
import { MealType } from '@/types/food';
import {
  formatCalories,
  formatMacro,
  getTodayDate,
  getMealCalories,
  getMealLogs,
  getMacroPercentages,
} from '@/lib/calculations';
import { FoodLog } from '@/types/food';

const MEALS: { type: MealType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: 'sunny-outline' },
  { type: 'lunch', label: 'Lunch', icon: 'partly-sunny-outline' },
  { type: 'dinner', label: 'Dinner', icon: 'moon-outline' },
  { type: 'snacks', label: 'Snacks', icon: 'cafe-outline' },
];

function getDisplayDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  color: string;
}

function MacroBar({ label, value, target, color }: MacroBarProps) {
  const pct = Math.min(1, target > 0 ? value / target : 0);
  return (
    <View style={macroBarStyles.row}>
      <View style={macroBarStyles.labelRow}>
        <Text style={macroBarStyles.label}>{label}</Text>
        <Text style={macroBarStyles.value}>
          {formatMacro(value)}
          <Text style={macroBarStyles.target}> / {formatMacro(target)}</Text>
        </Text>
      </View>
      <View style={macroBarStyles.track}>
        <View style={[macroBarStyles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const macroBarStyles = StyleSheet.create({
  row: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  target: {
    fontWeight: '400',
    color: Colors.textMuted,
  },
  track: {
    height: 6,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});

interface MealCardProps {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  logs: FoodLog[];
  dateStr: string;
}

function MealCard({ type, label, icon, logs, dateStr }: MealCardProps) {
  const mealLogs = getMealLogs(logs, type);
  const cals = getMealCalories(logs, type);

  return (
    <TouchableOpacity
      style={mealCardStyles.card}
      onPress={() =>
        router.push({
          pathname: '/fuel/add-food',
          params: { meal: type, date: dateStr },
        })
      }
      activeOpacity={0.75}
    >
      <View style={mealCardStyles.header}>
        <View style={mealCardStyles.iconWrap}>
          <Ionicons name={icon} size={18} color={Colors.accent} />
        </View>
        <View style={mealCardStyles.info}>
          <Text style={mealCardStyles.label}>{label}</Text>
          <Text style={mealCardStyles.count}>
            {mealLogs.length} {mealLogs.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <View style={mealCardStyles.caloriesWrap}>
          <Text style={mealCardStyles.calories}>{formatCalories(cals)}</Text>
          <Text style={mealCardStyles.caloriesUnit}>kcal</Text>
        </View>
      </View>

      {mealLogs.length > 0 && (
        <View style={mealCardStyles.logList}>
          {mealLogs.slice(0, 3).map(log => (
            <View key={log.id} style={mealCardStyles.logItem}>
              <Text style={mealCardStyles.logName} numberOfLines={1}>
                {log.food_name || log.food?.name || 'Food'}
              </Text>
              <Text style={mealCardStyles.logCals}>{formatCalories(log.calories)} kcal</Text>
            </View>
          ))}
          {mealLogs.length > 3 && (
            <Text style={mealCardStyles.moreItems}>+{mealLogs.length - 3} more items</Text>
          )}
        </View>
      )}

      <View style={mealCardStyles.addRow}>
        <Ionicons name="add-circle-outline" size={16} color={Colors.accent} />
        <Text style={mealCardStyles.addText}>Add food</Text>
      </View>
    </TouchableOpacity>
  );
}

const mealCardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  count: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  caloriesWrap: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  caloriesUnit: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  logList: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logName: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  logCals: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: Spacing.sm,
  },
  addText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
});

export default function FuelScreen() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const userId = nutritionService.getDemoUserId();
  const dateStr = currentDate.toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    try {
      const [summaryData, logData] = await Promise.all([
        nutritionService.getDailySummary(userId, dateStr),
        nutritionService.getFoodLogs(userId, dateStr),
      ]);
      setSummary(summaryData);
      setLogs(logData);
    } catch (e) {
      console.error(e);
    }
  }, [userId, dateStr]);

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

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextDay = () => {
    const today = new Date();
    if (
      currentDate.toISOString().split('T')[0] >= today.toISOString().split('T')[0]
    ) return;
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const isToday =
    currentDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

  const caloriesPct = summary
    ? Math.min(1, summary.calories_consumed / summary.calories_target)
    : 0;

  const macros = getMacroPercentages(
    summary?.carbs_g ?? 0,
    summary?.protein_g ?? 0,
    summary?.fat_g ?? 0
  );

  const proteinTarget = 200;
  const carbsTarget = 300;
  const fatTarget = 88;

  const handleCompleteDay = async () => {
    if (!summary) return;
    const newComplete = !summary.is_complete;
    await nutritionService.completeDay(userId, dateStr, newComplete);
    setSummary(prev => prev ? { ...prev, is_complete: newComplete } : prev);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Fuel</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/fuel/settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Date navigator */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={prevDay} style={styles.dateNavBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.dateNavLabel}>{getDisplayDate(currentDate)}</Text>
        <TouchableOpacity
          onPress={nextDay}
          style={[styles.dateNavBtn, isToday && styles.dateNavBtnDisabled]}
          activeOpacity={0.7}
          disabled={isToday}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isToday ? Colors.textMuted : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

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
        {/* Calorie Summary Card */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieTop}>
            <View style={styles.calorieMain}>
              <Text style={styles.calorieNumber}>
                {summary ? formatCalories(summary.calories_consumed) : '0'}
              </Text>
              <Text style={styles.calorieLabel}>eaten</Text>
            </View>
            <View style={styles.calorieSeparator} />
            <View style={styles.calorieSub}>
              <Text style={styles.calorieSubNumber}>
                {formatCalories(summary?.calories_target ?? 2658)}
              </Text>
              <Text style={styles.calorieLabel}>target</Text>
            </View>
            <View style={styles.calorieSeparator} />
            <View style={styles.calorieSub}>
              <Text
                style={[
                  styles.calorieSubNumber,
                  (summary?.calories_remaining ?? 2658) < 0 && styles.calorieOver,
                ]}
              >
                {summary
                  ? formatCalories(Math.abs(summary.calories_remaining))
                  : formatCalories(2658)}
              </Text>
              <Text style={styles.calorieLabel}>
                {(summary?.calories_remaining ?? 1) < 0 ? 'over' : 'left'}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.round(caloriesPct * 100))}%` },
                caloriesPct >= 1 && styles.progressOver,
              ]}
            />
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.progressPct}>{Math.round(caloriesPct * 100)}% of target</Text>
            {summary?.is_complete && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.accent} />
                <Text style={styles.completedText}>Day Complete</Text>
              </View>
            )}
          </View>
        </View>

        {/* Meals grid */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionLabel}>Meals</Text>
          <View style={styles.mealsGrid}>
            {MEALS.map(meal => (
              <MealCard
                key={meal.type}
                type={meal.type}
                label={meal.label}
                icon={meal.icon}
                logs={logs}
                dateStr={dateStr}
              />
            ))}
          </View>
        </View>

        {/* Macros Card */}
        <View style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <Text style={styles.sectionLabel}>Macros</Text>
            <Text style={styles.macroTotal}>
              {macros.total_macro_calories > 0
                ? `${formatCalories(macros.total_macro_calories)} kcal from macros`
                : ''}
            </Text>
          </View>

          {/* Macro ratio bar */}
          {macros.total_macro_calories > 0 && (
            <View style={styles.macroRatioBar}>
              <View
                style={[
                  styles.macroRatioSegment,
                  { flex: macros.protein_percentage, backgroundColor: '#F05A28' },
                ]}
              />
              <View
                style={[
                  styles.macroRatioSegment,
                  { flex: macros.carbs_percentage, backgroundColor: '#F0A028' },
                ]}
              />
              <View
                style={[
                  styles.macroRatioSegment,
                  { flex: macros.fat_percentage, backgroundColor: '#F07828' },
                ]}
              />
            </View>
          )}

          <View style={styles.macroLegend}>
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroLegendDot, { backgroundColor: '#F05A28' }]} />
              <Text style={styles.macroLegendLabel}>
                Protein {macros.protein_percentage}%
              </Text>
            </View>
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroLegendDot, { backgroundColor: '#F0A028' }]} />
              <Text style={styles.macroLegendLabel}>
                Carbs {macros.carbs_percentage}%
              </Text>
            </View>
            <View style={styles.macroLegendItem}>
              <View style={[styles.macroLegendDot, { backgroundColor: '#F07828' }]} />
              <Text style={styles.macroLegendLabel}>Fat {macros.fat_percentage}%</Text>
            </View>
          </View>

          <View style={styles.macroBars}>
            <MacroBar
              label="Protein"
              value={summary?.protein_g ?? 0}
              target={proteinTarget}
              color="#F05A28"
            />
            <MacroBar
              label="Carbs"
              value={summary?.carbs_g ?? 0}
              target={carbsTarget}
              color="#F0A028"
            />
            <MacroBar
              label="Fat"
              value={summary?.fat_g ?? 0}
              target={fatTarget}
              color="#F07828"
            />
          </View>

          {/* Additional micros */}
          <View style={styles.microGrid}>
            <View style={styles.microItem}>
              <Text style={styles.microValue}>{formatMacro(summary?.fibre_g ?? 0)}</Text>
              <Text style={styles.microLabel}>Fibre</Text>
            </View>
            <View style={styles.microDivider} />
            <View style={styles.microItem}>
              <Text style={styles.microValue}>{formatMacro(summary?.sugar_g ?? 0)}</Text>
              <Text style={styles.microLabel}>Sugar</Text>
            </View>
            <View style={styles.microDivider} />
            <View style={styles.microItem}>
              <Text style={styles.microValue}>
                {Math.round(summary?.sodium_mg ?? 0)}
                <Text style={styles.microUnit}>mg</Text>
              </Text>
              <Text style={styles.microLabel}>Sodium</Text>
            </View>
          </View>
        </View>

        {/* Complete Day */}
        <TouchableOpacity
          style={[styles.completeDayBtn, summary?.is_complete && styles.completeDayBtnActive]}
          onPress={handleCompleteDay}
          activeOpacity={0.8}
        >
          <Ionicons
            name={summary?.is_complete ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={summary?.is_complete ? Colors.accent : Colors.textSecondary}
          />
          <Text
            style={[
              styles.completeDayText,
              summary?.is_complete && styles.completeDayTextActive,
            ]}
          >
            {summary?.is_complete ? 'Day Complete' : 'Mark Day Complete'}
          </Text>
        </TouchableOpacity>

        {/* AI Coach */}
        <View style={styles.aiCard}>
          <View style={styles.aiCardInner}>
            <Ionicons name="sparkles" size={18} color={Colors.accent} />
            <View style={styles.aiCardText}>
              <Text style={styles.aiCardTitle}>Fuel Coach</Text>
              <Text style={styles.aiCardSubtitle}>
                {logs.length === 0
                  ? "Start logging to get personalised advice"
                  : `You've logged ${logs.length} item${logs.length !== 1 ? 's' : ''} today. Ask me anything about your nutrition.`}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.aiAskBtn} activeOpacity={0.8}>
            <Text style={styles.aiAskText}>Ask</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.white} />
          </TouchableOpacity>
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
    paddingBottom: Spacing.sm,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.lg,
  },
  dateNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dateNavBtnDisabled: {
    opacity: 0.4,
  },
  dateNavLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    minWidth: 100,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
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
  calorieTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calorieMain: {
    flex: 2,
  },
  calorieNumber: {
    fontSize: 44,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 50,
  },
  calorieLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  calorieSeparator: {
    width: 1,
    height: 40,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: Spacing.md,
  },
  calorieSub: {
    flex: 1,
    alignItems: 'center',
  },
  calorieSubNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  calorieOver: {
    color: '#FF4444',
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  progressOver: {
    backgroundColor: '#FF4444',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPct: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  mealsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  mealsGrid: {
    gap: Spacing.sm,
  },
  macroCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  macroTotal: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  macroRatioBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    gap: 2,
  },
  macroRatioSegment: {
    height: '100%',
    borderRadius: 4,
  },
  macroLegend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  macroLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroLegendLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  macroBars: {
    marginBottom: Spacing.lg,
  },
  microGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  microItem: {
    flex: 1,
    alignItems: 'center',
  },
  microDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  microValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  microUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  microLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  completeDayBtn: {
    marginHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  completeDayBtnActive: {
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentSoft,
  },
  completeDayText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  completeDayTextActive: {
    color: Colors.accent,
  },
  aiCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    gap: Spacing.md,
  },
  aiCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  aiCardText: {
    flex: 1,
  },
  aiCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  aiCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  aiAskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  aiAskText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});
