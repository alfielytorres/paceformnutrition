import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Food, FoodLog, MealType } from '@/types/food';
import { nutritionService } from '@/lib/nutritionService';
import { formatCalories, formatMacro } from '@/lib/calculations';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

interface NutrientRow {
  label: string;
  value: string;
  indent?: boolean;
}

export default function FoodDetailScreen() {
  const params = useLocalSearchParams<{
    logJson?: string;
    foodJson?: string;
    meal?: string;
    date?: string;
  }>();

  const log: FoodLog | null = params.logJson ? JSON.parse(params.logJson) : null;
  const food: Food | null = params.foodJson
    ? JSON.parse(params.foodJson)
    : log?.food || null;

  const meal = (params.meal as MealType) || log?.meal_type || 'breakfast';
  const [isFav, setIsFav] = useState(
    food ? nutritionService.isFavourite(food.id) : false
  );
  const userId = nutritionService.getDemoUserId();

  if (!food && !log) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Food not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const calories = log?.calories ?? food?.calories ?? 0;
  const protein = log?.protein_g ?? food?.protein_g ?? 0;
  const carbs = log?.carbs_g ?? food?.carbs_g ?? 0;
  const fat = log?.fat_g ?? food?.fat_g ?? 0;
  const fibre = log?.fibre_g ?? food?.fibre_g ?? 0;
  const sugar = log?.sugar_g ?? food?.sugar_g ?? 0;
  const sodium = log?.sodium_mg ?? food?.sodium_mg ?? 0;
  const name = log?.food_name ?? food?.name ?? 'Unknown Food';
  const brand = food?.brand;

  const nutrientRows: NutrientRow[] = [
    { label: 'Calories', value: `${formatCalories(calories)} kcal` },
    { label: 'Protein', value: formatMacro(protein) },
    { label: 'Carbohydrates', value: formatMacro(carbs) },
    { label: 'of which sugars', value: formatMacro(sugar), indent: true },
    { label: 'Fat', value: formatMacro(fat) },
    { label: 'Fibre', value: formatMacro(fibre) },
    { label: 'Sodium', value: `${Math.round(sodium)}mg` },
  ];

  const handleToggleFav = async () => {
    if (!food) return;
    const result = await nutritionService.toggleFavouriteFood(userId, food.id);
    setIsFav(result);
  };

  const handleDeleteLog = () => {
    if (!log) return;
    Alert.alert('Remove from log?', 'This will remove the item from your food log.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await nutritionService.deleteFoodLog(log.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Detail</Text>
        <TouchableOpacity onPress={handleToggleFav} style={styles.favBtn} activeOpacity={0.7}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={22}
            color={isFav ? Colors.accent : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Food Identity */}
        <View style={styles.identityCard}>
          <View style={styles.foodIconLarge}>
            <Ionicons name="nutrition-outline" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.foodName}>{name}</Text>
          {brand && <Text style={styles.foodBrand}>{brand}</Text>}
          {food?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.accent} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {log && (
            <View style={styles.mealBadge}>
              <Text style={styles.mealBadgeText}>{MEAL_LABELS[log.meal_type]}</Text>
            </View>
          )}
        </View>

        {/* Macro summary */}
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroNumber}>{formatCalories(calories)}</Text>
            <Text style={styles.macroUnit}>kcal</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroNumber}>{formatMacro(protein)}</Text>
            <Text style={styles.macroUnit}>protein</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroNumber}>{formatMacro(carbs)}</Text>
            <Text style={styles.macroUnit}>carbs</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroNumber}>{formatMacro(fat)}</Text>
            <Text style={styles.macroUnit}>fat</Text>
          </View>
        </View>

        {/* Nutrition Table */}
        <View style={styles.nutritionTable}>
          <Text style={styles.nutritionTableTitle}>
            Nutrition Facts
            {log && ` · ${log.quantity} ${log.serving_unit}`}
          </Text>
          {nutrientRows.map((row, i) => (
            <View
              key={i}
              style={[
                styles.nutrientRow,
                i === nutrientRows.length - 1 && styles.nutrientRowLast,
              ]}
            >
              <Text
                style={[styles.nutrientLabel, row.indent && styles.nutrientLabelIndented]}
              >
                {row.label}
              </Text>
              <Text style={styles.nutrientValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Serving info */}
        {food && (
          <View style={styles.servingCard}>
            <Text style={styles.servingTitle}>Per serving</Text>
            <Text style={styles.servingValue}>
              {food.serving_size} {food.serving_unit}
            </Text>
          </View>
        )}

        {/* Log entry actions */}
        {log ? (
          <View style={styles.logActions}>
            <TouchableOpacity
              style={styles.editLogBtn}
              onPress={() =>
                router.push({
                  pathname: '/fuel/confirm-food',
                  params: {
                    foodJson: JSON.stringify(food),
                    meal: log.meal_type,
                    date: log.date,
                  },
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color={Colors.accent} />
              <Text style={styles.editLogText}>Edit entry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteLogBtn}
              onPress={handleDeleteLog}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color="#FF4444" />
              <Text style={styles.deleteLogText}>Remove from log</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() =>
              router.push({
                pathname: '/fuel/confirm-food',
                params: {
                  foodJson: JSON.stringify(food),
                  meal,
                },
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.addBtnText}>Add to {MEAL_LABELS[meal]}</Text>
          </TouchableOpacity>
        )}

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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  favBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  identityCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  foodIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accentBorder,
    marginBottom: Spacing.sm,
  },
  foodName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  foodBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
  mealBadge: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  mealBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  macroRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  macroUnit: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  macroDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  nutritionTable: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  nutritionTableTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    padding: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Colors.textPrimary,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  nutrientRowLast: {
    borderBottomWidth: 0,
  },
  nutrientLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  nutrientLabelIndented: {
    color: Colors.textSecondary,
    paddingLeft: Spacing.lg,
    fontSize: 12,
  },
  nutrientValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  servingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  servingTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  servingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  logActions: {
    marginHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  editLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  editLogText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
  deleteLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,68,68,0.08)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,68,68,0.2)',
  },
  deleteLogText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF4444',
  },
  addBtn: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  backButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
