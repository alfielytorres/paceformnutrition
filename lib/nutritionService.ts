import { Food, FoodLog, MealType } from '@/types/food';
import { DailySummary } from '@/types/nutrition';
import { getDayCalories, getDayMacros, getCaloriesRemaining } from './calculations';

// Mock user ID for demo
const DEMO_USER_ID = 'demo-user-001';

// In-memory store for demo mode
let mockFoodLogs: FoodLog[] = [];
let mockFavourites: Set<string> = new Set();
let mockCompletedDays: Set<string> = new Set();
let mockCalorieTarget = 2658;

// Seed foods data
export const SEED_FOODS: Food[] = [
  {
    id: 'food-001',
    name: 'Breakfast burrito chipotle bacon',
    brand: 'Guzman y Gomez',
    barcode: '9300601234567',
    source: 'global',
    serving_size: 1,
    serving_unit: 'serving',
    calories: 538,
    protein_g: 29,
    carbs_g: 47,
    fat_g: 25,
    fibre_g: 3,
    sugar_g: 4,
    sodium_mg: 980,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-002',
    name: 'Protein bowl',
    brand: 'KFC',
    barcode: '9300601234568',
    source: 'global',
    serving_size: 1,
    serving_unit: 'serving',
    calories: 552,
    protein_g: 35,
    carbs_g: 45,
    fat_g: 24,
    fibre_g: 4,
    sugar_g: 5,
    sodium_mg: 1100,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-003',
    name: 'Brioche bread',
    brand: 'Generic',
    source: 'global',
    serving_size: 30,
    serving_unit: 'g',
    calories: 113,
    protein_g: 3,
    carbs_g: 18,
    fat_g: 4,
    fibre_g: 1,
    sugar_g: 5,
    sodium_mg: 160,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-004',
    name: 'Banana',
    brand: 'Generic',
    source: 'global',
    serving_size: 1,
    serving_unit: 'medium banana',
    calories: 105,
    protein_g: 1,
    carbs_g: 27,
    fat_g: 0,
    fibre_g: 3,
    sugar_g: 14,
    sodium_mg: 1,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-005',
    name: 'Chicken breast',
    brand: 'Generic',
    source: 'global',
    serving_size: 100,
    serving_unit: 'g',
    calories: 165,
    protein_g: 31,
    carbs_g: 0,
    fat_g: 4,
    fibre_g: 0,
    sugar_g: 0,
    sodium_mg: 74,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-006',
    name: 'White rice',
    brand: 'Generic',
    source: 'global',
    serving_size: 100,
    serving_unit: 'g',
    calories: 130,
    protein_g: 3,
    carbs_g: 28,
    fat_g: 0,
    fibre_g: 0,
    sugar_g: 0,
    sodium_mg: 1,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-007',
    name: 'Whey protein scoop',
    brand: 'Generic',
    source: 'global',
    serving_size: 1,
    serving_unit: 'scoop',
    calories: 120,
    protein_g: 24,
    carbs_g: 3,
    fat_g: 2,
    fibre_g: 0,
    sugar_g: 2,
    sodium_mg: 80,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-008',
    name: 'Egg',
    brand: 'Generic',
    source: 'global',
    serving_size: 1,
    serving_unit: 'egg',
    calories: 70,
    protein_g: 6,
    carbs_g: 0,
    fat_g: 5,
    fibre_g: 0,
    sugar_g: 0,
    sodium_mg: 65,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'food-009',
    name: 'Greek yoghurt',
    brand: 'Generic',
    source: 'global',
    serving_size: 100,
    serving_unit: 'g',
    calories: 100,
    protein_g: 10,
    carbs_g: 4,
    fat_g: 5,
    fibre_g: 0,
    sugar_g: 4,
    sodium_mg: 36,
    is_verified: true,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockFoods: Food[] = [...SEED_FOODS];
let mockCustomFoods: Food[] = [];

export const nutritionService = {
  async getDailySummary(userId: string, date: string): Promise<DailySummary> {
    const logs = await this.getFoodLogs(userId, date);
    const macros = getDayMacros(logs);
    const consumed = getDayCalories(logs);
    const isComplete = mockCompletedDays.has(date);

    return {
      date,
      calories_target: mockCalorieTarget,
      calories_consumed: consumed,
      calories_remaining: getCaloriesRemaining(mockCalorieTarget, 0, consumed),
      exercise_calories: 0,
      protein_g: macros.protein_g,
      carbs_g: macros.carbs_g,
      fat_g: macros.fat_g,
      fibre_g: macros.fibre_g,
      sugar_g: macros.sugar_g,
      sodium_mg: macros.sodium_mg,
      is_complete: isComplete,
    };
  },

  async getFoodLogs(userId: string, date: string): Promise<FoodLog[]> {
    return mockFoodLogs.filter(log => log.date === date && log.user_id === userId);
  },

  async addFoodLog(
    userId: string,
    payload: Omit<FoodLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<FoodLog> {
    const newLog: FoodLog = {
      ...payload,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockFoodLogs.push(newLog);
    return newLog;
  },

  async updateFoodLog(logId: string, payload: Partial<FoodLog>): Promise<FoodLog | null> {
    const idx = mockFoodLogs.findIndex(l => l.id === logId);
    if (idx === -1) return null;
    mockFoodLogs[idx] = { ...mockFoodLogs[idx], ...payload, updated_at: new Date().toISOString() };
    return mockFoodLogs[idx];
  },

  async deleteFoodLog(logId: string): Promise<void> {
    mockFoodLogs = mockFoodLogs.filter(l => l.id !== logId);
  },

  async searchFoods(query: string): Promise<Food[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [...mockFoods, ...mockCustomFoods].slice(0, 20);
    return [...mockFoods, ...mockCustomFoods].filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        (f.brand && f.brand.toLowerCase().includes(q))
    );
  },

  async searchFoodByBarcode(barcode: string): Promise<Food | null> {
    return [...mockFoods, ...mockCustomFoods].find(f => f.barcode === barcode) || null;
  },

  async createCustomFood(
    userId: string,
    payload: Omit<Food, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Food> {
    const food: Food = {
      ...payload,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_by_user_id: userId,
      source: 'custom',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCustomFoods.push(food);
    return food;
  },

  async getRecentFoods(userId: string): Promise<Food[]> {
    const recentLogIds = mockFoodLogs
      .filter(l => l.user_id === userId && l.food_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(l => l.food_id)
      .filter((id, idx, arr) => arr.indexOf(id) === idx)
      .slice(0, 10);

    return recentLogIds
      .map(id => [...mockFoods, ...mockCustomFoods].find(f => f.id === id))
      .filter(Boolean) as Food[];
  },

  async getFrequentFoods(userId: string): Promise<Food[]> {
    const freq: Record<string, number> = {};
    mockFoodLogs
      .filter(l => l.user_id === userId && l.food_id)
      .forEach(l => {
        if (l.food_id) freq[l.food_id] = (freq[l.food_id] || 0) + 1;
      });

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => [...mockFoods, ...mockCustomFoods].find(f => f.id === id))
      .filter(Boolean) as Food[];
  },

  async getFavouriteFoods(userId: string): Promise<Food[]> {
    return [...mockFoods, ...mockCustomFoods].filter(f => mockFavourites.has(f.id));
  },

  async toggleFavouriteFood(userId: string, foodId: string): Promise<boolean> {
    if (mockFavourites.has(foodId)) {
      mockFavourites.delete(foodId);
      return false;
    } else {
      mockFavourites.add(foodId);
      return true;
    }
  },

  isFavourite(foodId: string): boolean {
    return mockFavourites.has(foodId);
  },

  async completeDay(userId: string, date: string, isComplete: boolean): Promise<void> {
    if (isComplete) {
      mockCompletedDays.add(date);
    } else {
      mockCompletedDays.delete(date);
    }
  },

  async getCalorieTarget(userId: string): Promise<number> {
    return mockCalorieTarget;
  },

  async setCalorieTarget(userId: string, target: number): Promise<void> {
    mockCalorieTarget = target;
  },

  getDemoUserId(): string {
    return DEMO_USER_ID;
  },
};
