import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Food, MealType } from '@/types/food';
import { nutritionService } from '@/lib/nutritionService';
import { getTodayDate, formatCalories, formatMacro } from '@/lib/calculations';

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

function scaleNutrient(base: number, quantity: number, servingSize: number): number {
  if (servingSize === 0) return base * quantity;
  return (base / servingSize) * quantity;
}

export default function ConfirmFoodScreen() {
  const params = useLocalSearchParams<{
    foodJson?: string;
    meal?: string;
    date?: string;
  }>();

  const food: Food | null = params.foodJson ? JSON.parse(params.foodJson) : null;
  const meal = (params.meal as MealType) || 'breakfast';
  const date = params.date || getTodayDate();

  const [quantity, setQuantity] = useState(
    food ? food.serving_size.toString() : '1'
  );
  const [saving, setSaving] = useState(false);
  const [isFav, setIsFav] = useState(
    food ? nutritionService.isFavourite(food.id) : false
  );

  const userId = nutritionService.getDemoUserId();

  if (!food) {
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

  const qty = parseFloat(quantity) || 0;
  const scaledCalories = scaleNutrient(food.calories, qty, food.serving_size);
  const scaledProtein = scaleNutrient(food.protein_g, qty, food.serving_size);
  const scaledCarbs = scaleNutrient(food.carbs_g, qty, food.serving_size);
  const scaledFat = scaleNutrient(food.fat_g, qty, food.serving_size);
  const scaledFibre = scaleNutrient(food.fibre_g, qty, food.serving_size);
  const scaledSugar = scaleNutrient(food.sugar_g, qty, food.serving_size);
  const scaledSodium = scaleNutrient(food.sodium_mg, qty, food.serving_size);

  const handleSave = async () => {
    if (qty <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity');
      return;
    }
    setSaving(true);
    try {
      await nutritionService.addFoodLog(userId, {
        food_id: food.id,
        food,
        food_name: food.name,
        date,
        meal_type: meal,
        quantity: qty,
        serving_unit: food.serving_unit,
        calories: Math.round(scaledCalories),
        protein_g: Math.round(scaledProtein * 10) / 10,
        carbs_g: Math.round(scaledCarbs * 10) / 10,
        fat_g: Math.round(scaledFat * 10) / 10,
        fibre_g: Math.round(scaledFibre * 10) / 10,
        sugar_g: Math.round(scaledSugar * 10) / 10,
        sodium_mg: Math.round(scaledSodium),
      });
      router.dismissAll();
    } catch (e) {
      Alert.alert('Error', 'Failed to log food. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleFav = async () => {
    const result = await nutritionService.toggleFavouriteFood(userId, food.id);
    setIsFav(result);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Food</Text>
        <TouchableOpacity onPress={toggleFav} style={styles.favBtn} activeOpacity={0.7}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={22}
            color={isFav ? Colors.accent : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Food Info */}
        <View style={styles.foodCard}>
          <View style={styles.foodIconLarge}>
            <Ionicons name="nutrition-outline" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.foodName}>{food.name}</Text>
          {food.brand && <Text style={styles.foodBrand}>{food.brand}</Text>}
          {food.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.accent} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Meal badge */}
        <View style={styles.mealRow}>
          <Text style={styles.mealLabel}>Adding to:</Text>
          <View style={styles.mealBadge}>
            <Text style={styles.mealBadgeText}>{MEAL_LABELS[meal]}</Text>
          </View>
        </View>

        {/* Quantity Input */}
        <View style={styles.quantityCard}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => {
                const v = Math.max(0, (parseFloat(quantity) || 0) - food.serving_size);
                setQuantity(v === 0 ? food.serving_size.toString() : v.toString());
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.quantityInputWrap}>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                selectTextOnFocus
                textAlign="center"
              />
              <Text style={styles.quantityUnit}>{food.serving_unit}</Text>
            </View>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => {
                const v = (parseFloat(quantity) || 0) + food.serving_size;
                setQuantity(v.toString());
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Serving presets */}
          <View style={styles.presetsRow}>
            {[0.5, 1, 1.5, 2].map(mult => (
              <TouchableOpacity
                key={mult}
                style={[
                  styles.presetBtn,
                  parseFloat(quantity) === food.serving_size * mult && styles.presetBtnActive,
                ]}
                onPress={() => setQuantity((food.serving_size * mult).toString())}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.presetText,
                    parseFloat(quantity) === food.serving_size * mult &&
                      styles.presetTextActive,
                  ]}
                >
                  {mult}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scaled nutrition */}
        <View style={styles.nutritionCard}>
          <Text style={styles.nutritionTitle}>Nutrition</Text>
          <View style={styles.calorieHighlight}>
            <Text style={styles.calorieHighlightNumber}>
              {formatCalories(scaledCalories)}
            </Text>
            <Text style={styles.calorieHighlightUnit}>kcal</Text>
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{formatMacro(scaledProtein)}</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{formatMacro(scaledCarbs)}</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{formatMacro(scaledFat)}</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>

          <View style={styles.microRow}>
            <View style={styles.microItem}>
              <Text style={styles.microLabel}>Fibre</Text>
              <Text style={styles.microValue}>{formatMacro(scaledFibre)}</Text>
            </View>
            <View style={styles.microItem}>
              <Text style={styles.microLabel}>Sugar</Text>
              <Text style={styles.microValue}>{formatMacro(scaledSugar)}</Text>
            </View>
            <View style={styles.microItem}>
              <Text style={styles.microLabel}>Sodium</Text>
              <Text style={styles.microValue}>{Math.round(scaledSodium)}mg</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>Add to {MEAL_LABELS[meal]}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  foodCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
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
    marginBottom: Spacing.md,
  },
  foodName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
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
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  mealLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
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
  quantityCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quantityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quantityInputWrap: {
    flex: 1,
    alignItems: 'center',
  },
  quantityInput: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    width: '100%',
    textAlign: 'center',
  },
  quantityUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  presetBtnActive: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accentBorder,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  presetTextActive: {
    color: Colors.accent,
  },
  nutritionCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.lg,
  },
  nutritionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  calorieHighlight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: Spacing.lg,
  },
  calorieHighlightNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 54,
  },
  calorieHighlightUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  macroGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  macroDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 4,
  },
  microRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  microItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  microLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  microValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  saveContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  saveButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
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
