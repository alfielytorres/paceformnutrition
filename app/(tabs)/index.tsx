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
import { formatCalories, formatMacro, getTodayDate, getMacroPercentages } from '@/lib/calculations';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDisplayDate(): string {
  return new Date().toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export default function DailyScreen() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const userId = nutritionService.getDemoUserId();
  const today = getTodayDate();

  const load = useCallback(async () => {
    const data = await nutritionService.getDailySummary(userId, today);
    setSummary(data);
  }, [userId, today]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const pct = summary ? Math.min(1, summary.calories_consumed / summary.calories_target) : 0;
  const macros = getMacroPercentages(summary?.carbs_g ?? 0, summary?.protein_g ?? 0, summary?.fat_g ?? 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>Alfie</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/fuel/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.dateLabel}>{getDisplayDate()}</Text>

        {/* Calorie card */}
        <View style={styles.calorieCard}>
          <Text style={styles.cardLabel}>Calories Today</Text>
          <View style={styles.calorieRow}>
            <View>
              <Text style={styles.calorieNumber}>
                {summary ? formatCalories(summary.calories_consumed) : '0'}
              </Text>
              <Text style={styles.calorieUnit}>eaten</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieRight}>
              <Text style={styles.calorieRemaining}>
                {summary ? formatCalories(Math.max(0, summary.calories_remaining)) : formatCalories(2658)}
              </Text>
              <Text style={styles.calorieUnit}>remaining</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` as any }]} />
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>{Math.round(pct * 100)}% of target</Text>
            <Text style={styles.progressLabel}>
              Target: {summary ? formatCalories(summary.calories_target) : '2,658'} kcal
            </Text>
          </View>
        </View>

        {/* Macro summary */}
        <View style={styles.macroRow}>
          {[
            { label: 'Protein', value: summary?.protein_g ?? 0, color: '#F05A28' },
            { label: 'Carbs', value: summary?.carbs_g ?? 0, color: '#F0A028' },
            { label: 'Fat', value: summary?.fat_g ?? 0, color: '#F07828' },
            { label: 'Fibre', value: summary?.fibre_g ?? 0, color: '#C05A28' },
          ].map((m, i) => (
            <View key={m.label} style={styles.macroCard}>
              <View style={[styles.macroDot, { backgroundColor: m.color }]} />
              <Text style={styles.macroValue}>{formatMacro(m.value)}</Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickGrid}>
          {[
            { label: 'Search Food', icon: 'search-outline', route: '/fuel/add-food' },
            { label: 'Scan Barcode', icon: 'barcode-outline', route: '/fuel/scan' },
            { label: 'Create Food', icon: 'create-outline', route: '/fuel/custom-food' },
            { label: 'Fuel Settings', icon: 'settings-outline', route: '/fuel/settings' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.75}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={action.icon as any} size={20} color={Colors.accent} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal breakdown */}
        <Text style={styles.sectionTitle}>Meal Breakdown</Text>
        <TouchableOpacity
          style={styles.mealBreakdownCard}
          onPress={() => router.push('/(tabs)/fuel')}
          activeOpacity={0.8}
        >
          {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal, i) => (
            <View key={meal} style={[styles.mealRow, i < 3 && styles.mealRowBorder]}>
              <Text style={styles.mealName}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
              <TouchableOpacity
                style={styles.mealAddBtn}
                onPress={() => router.push({ pathname: '/fuel/add-food', params: { meal } } as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={18} color={Colors.accent} />
                <Text style={styles.mealAddText}>Add food</Text>
              </TouchableOpacity>
            </View>
          ))}
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  greeting: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  settingsBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  dateLabel: { fontSize: 13, color: Colors.textMuted, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  calorieCard: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: Spacing.md,
  },
  cardLabel: {
    fontSize: 11, fontWeight: '600', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.md,
  },
  calorieRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  calorieNumber: { fontSize: 44, fontWeight: '700', color: Colors.textPrimary, lineHeight: 50 },
  calorieUnit: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  calorieDivider: { width: 1, height: 48, backgroundColor: Colors.cardBorder, marginHorizontal: Spacing.lg },
  calorieRight: { flex: 1 },
  calorieRemaining: { fontSize: 28, fontWeight: '700', color: Colors.accent },
  progressTrack: { height: 8, backgroundColor: Colors.surfaceRaised, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 4 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, color: Colors.textMuted },
  macroRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  macroCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'center', gap: 4,
  },
  macroDot: { width: 8, height: 8, borderRadius: 4 },
  macroValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  macroLabel: { fontSize: 10, color: Colors.textMuted },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
  },
  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  quickCard: {
    width: '47.5%', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  quickIcon: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  mealBreakdownCard: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, borderWidth: 1,
    borderColor: Colors.cardBorder, marginBottom: Spacing.lg, overflow: 'hidden',
  },
  mealRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  mealRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  mealName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  mealAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mealAddText: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
});
