export interface DailySummary {
  date: string;
  calories_target: number;
  calories_consumed: number;
  calories_remaining: number;
  exercise_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  sugar_g: number;
  sodium_mg: number;
  is_complete: boolean;
}

export interface MacroBreakdown {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  protein_calories: number;
  carbs_calories: number;
  fat_calories: number;
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;
  total_macro_calories: number;
}

export interface MealSummary {
  meal_type: string;
  display_name: string;
  calories: number;
  item_count: number;
}
