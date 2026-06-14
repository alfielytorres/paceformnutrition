export interface UserProfile {
  id: string;
  display_name?: string;
  daily_calorie_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  weight_goal?: number;
  activity_level?: string;
  created_at: string;
  updated_at: string;
}
