export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  source: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  sugar_g: number;
  sodium_mg: number;
  created_by_user_id?: string;
  is_verified: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodLog {
  id: string;
  user_id: string;
  food_id?: string;
  food?: Food;
  date: string;
  meal_type: MealType;
  quantity: number;
  serving_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  sugar_g: number;
  sodium_mg: number;
  created_at: string;
  updated_at: string;
  // For quick entries
  food_name?: string;
}

export interface FavouriteFood {
  id: string;
  user_id: string;
  food_id: string;
  food?: Food;
  created_at: string;
}

export interface CompletedDay {
  id: string;
  user_id: string;
  date: string;
  is_complete: boolean;
  created_at: string;
}
