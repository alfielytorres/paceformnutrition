import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { nutritionService } from '@/lib/nutritionService';
import { formatCalories, formatMacro, getDayMacros, getDayCalories } from '@/lib/calculations';
import { FoodLog } from '@/types/food';

function getPastDates(count: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

function formatDisplayDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface DayCardProps {
  date: string;
  logs: FoodLog[];
  calorieTarget: number;
}

function DayCard({ date, logs, calorieTarget }: DayCardProps) {
  const cals = getDayCalories(logs);
  const macros = getDayMacros(logs);
  const pct = Math.min(1, calorieTarget > 0 ? cals / calorieTarget : 0);

  return (
    <View style={styles.dayCard}>
      <View style={styles.dayCardHeader}>
        <View>
          <Text style={styles.dayCardDate}>{formatDisplayDate(date)}</Text>
          <Text style={styles.dayCardSubdate}>{date}</Text>
        </View>
        <View style={styles.dayCardCals}>
          <Text style={styles.dayCardCalsNumber}>{formatCalories(cals)}</Text>
          <Text style={styles.dayCardCalsUnit}>kcal</Text>
        </View>
      </View>

      {logs.length > 0 ? (
        <>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` as any }]} />
          </View>
          <View style={styles.macroChips}>
            <Text style={styles.macroChip}>P: {formatMacro(macros.protein_g)}</Text>
            <Text style={styles.macroChip}>C: {formatMacro(macros.carbs_g)}</Text>
            <Text style={styles.macroChip}>F: {formatMacro(macros.fat_g)}</Text>
            <Text style={styles.itemCount}>{logs.length} item{logs.length !== 1 ? 's' : ''}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.emptyDay}>Nothing logged</Text>
      )}
    </View>
  );
}

export default function LogScreen() {
  const [logsByDate, setLogsByDate] = useState<Record<string, FoodLog[]>>({});
  const [calorieTarget, setCalorieTarget] = useState(2658);
  const [refreshing, setRefreshing] = useState(false);
  const userId = nutritionService.getDemoUserId();
  const dates = getPastDates(14);

  const load = useCallback(async () => {
    const target = await nutritionService.getCalorieTarget(userId);
    setCalorieTarget(target);
    const entries = await Promise.all(dates.map(d => nutritionService.getFoodLogs(userId, d)));
    const map: Record<string, FoodLog[]> = {};
    dates.forEach((d, i) => { map[d] = entries[i]; });
    setLogsByDate(map);
  }, [userId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const allEmpty = dates.every(d => (logsByDate[d] ?? []).length === 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>History</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      >
        {allEmpty ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No food logged yet</Text>
            <Text style={styles.emptySubtitle}>
              Start logging meals and your history will appear here.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/fuel/add-food')}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>Add your first meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {dates.map(date => (
              <DayCard
                key={date}
                date={date}
                logs={logsByDate[date] ?? []}
                calorieTarget={calorieTarget}
              />
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  screenTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  dayCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  dayCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: Spacing.md,
  },
  dayCardDate: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  dayCardSubdate: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  dayCardCals: { alignItems: 'flex-end' },
  dayCardCalsNumber: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  dayCardCalsUnit: { fontSize: 10, color: Colors.textMuted },
  progressTrack: {
    height: 4, backgroundColor: Colors.surfaceRaised,
    borderRadius: 2, overflow: 'hidden', marginBottom: Spacing.sm,
  },
  progressFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: 2 },
  macroChips: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  macroChip: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  itemCount: { marginLeft: 'auto' as any, fontSize: 11, color: Colors.textMuted },
  emptyDay: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  emptyState: {
    alignItems: 'center', paddingVertical: 80,
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    marginTop: Spacing.sm, backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
});
