import { FoodLog, MealType } from '@/types/food';
import { MacroBreakdown } from '@/types/nutrition';

export function getDayCalories(logs: FoodLog[]): number {
  return logs.reduce((sum, log) => sum + (log.calories || 0), 0);
}

export function getMealCalories(logs: FoodLog[], mealType: MealType): number {
  return logs
    .filter(log => log.meal_type === mealType)
    .reduce((sum, log) => sum + (log.calories || 0), 0);
}

export function getMealLogs(logs: FoodLog[], mealType: MealType): FoodLog[] {
  return logs.filter(log => log.meal_type === mealType);
}

export function getDayMacros(logs: FoodLog[]): {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  sugar_g: number;
  sodium_mg: number;
} {
  return logs.reduce(
    (acc, log) => ({
      protein_g: acc.protein_g + (log.protein_g || 0),
      carbs_g: acc.carbs_g + (log.carbs_g || 0),
      fat_g: acc.fat_g + (log.fat_g || 0),
      fibre_g: acc.fibre_g + (log.fibre_g || 0),
      sugar_g: acc.sugar_g + (log.sugar_g || 0),
      sodium_mg: acc.sodium_mg + (log.sodium_mg || 0),
    }),
    { protein_g: 0, carbs_g: 0, fat_g: 0, fibre_g: 0, sugar_g: 0, sodium_mg: 0 }
  );
}

export function getMacroPercentages(
  carbs_g: number,
  protein_g: number,
  fat_g: number
): MacroBreakdown {
  const carbs_calories = carbs_g * 4;
  const protein_calories = protein_g * 4;
  const fat_calories = fat_g * 9;
  const total_macro_calories = carbs_calories + protein_calories + fat_calories;

  if (total_macro_calories === 0) {
    return {
      protein_g,
      carbs_g,
      fat_g,
      protein_calories: 0,
      carbs_calories: 0,
      fat_calories: 0,
      protein_percentage: 0,
      carbs_percentage: 0,
      fat_percentage: 0,
      total_macro_calories: 0,
    };
  }

  return {
    protein_g,
    carbs_g,
    fat_g,
    protein_calories,
    carbs_calories,
    fat_calories,
    protein_percentage: Math.round((protein_calories / total_macro_calories) * 100),
    carbs_percentage: Math.round((carbs_calories / total_macro_calories) * 100),
    fat_percentage: Math.round((fat_calories / total_macro_calories) * 100),
    total_macro_calories,
  };
}

export function getCaloriesRemaining(
  target: number,
  exerciseCalories: number,
  consumedCalories: number
): number {
  return target - consumedCalories + exerciseCalories;
}

export function getMealDisplayName(mealType: MealType): string {
  const names: Record<MealType, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
  };
  return names[mealType] || mealType;
}

export function formatCalories(calories: number): string {
  return Math.round(calories).toLocaleString();
}

export function formatMacro(grams: number): string {
  return Math.round(grams) + 'g';
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return formatDate(new Date());
}
