import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { Food, MealType } from '@/types/food';
import { nutritionService } from '@/lib/nutritionService';
import { getTodayDate, formatCalories } from '@/lib/calculations';

const MEAL_TABS: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'dinner', label: 'Dinner' },
  { type: 'snacks', label: 'Snacks' },
];

type TabKey = 'search' | 'recent' | 'favourites';

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    (params.meal as MealType) || 'breakfast'
  );
  const [activeTab, setActiveTab] = useState<TabKey>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [recentFoods, setRecentFoods] = useState<Food[]>([]);
  const [favouriteFoods, setFavouriteFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = nutritionService.getDemoUserId();
  const date = params.date || getTodayDate();

  useEffect(() => {
    loadSupportingData();
  }, []);

  const loadSupportingData = async () => {
    const [recent, favs] = await Promise.all([
      nutritionService.getRecentFoods(userId),
      nutritionService.getFavouriteFoods(userId),
    ]);
    setRecentFoods(recent);
    setFavouriteFoods(favs);
    // Default: show all foods when search empty
    const all = await nutritionService.searchFoods('');
    setResults(all);
  };

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const foods = await nutritionService.searchFoods(text);
          setResults(foods);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    []
  );

  const handleSelectFood = (food: Food) => {
    router.push({
      pathname: '/fuel/confirm-food',
      params: {
        foodId: food.id,
        foodJson: JSON.stringify(food),
        meal: selectedMeal,
        date,
      },
    });
  };

  const getDisplayData = (): Food[] => {
    if (activeTab === 'recent') return recentFoods;
    if (activeTab === 'favourites') return favouriteFoods;
    return results;
  };

  const displayData = getDisplayData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Food</Text>
          <TouchableOpacity
            onPress={() => router.push('/fuel/scan')}
            style={styles.scanBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="barcode-outline" size={22} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Meal selector */}
        <View style={styles.mealScrollWrapper}>
          <FlatList
            data={MEAL_TABS}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mealTabsContent}
            keyExtractor={item => item.type}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.mealTab,
                  selectedMeal === item.type && styles.mealTabActive,
                ]}
                onPress={() => setSelectedMeal(item.type)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.mealTabText,
                    selectedMeal === item.type && styles.mealTabTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={text => {
              setActiveTab('search');
              handleSearch(text);
            }}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                handleSearch('');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          {loading && <ActivityIndicator size="small" color={Colors.accent} />}
        </View>

        {/* Tab selector */}
        <View style={styles.tabRow}>
          {(['search', 'recent', 'favourites'] as TabKey[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results */}
        <FlatList
          data={displayData}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>
                {activeTab === 'favourites'
                  ? 'No favourites yet'
                  : activeTab === 'recent'
                  ? 'No recent foods'
                  : 'No results'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'search' && query
                  ? `No foods found for "${query}"`
                  : 'Try searching or create a custom food'}
              </Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => router.push('/fuel/custom-food')}
                activeOpacity={0.8}
              >
                <Text style={styles.createBtnText}>Create custom food</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.foodRow}
              onPress={() => handleSelectFood(item)}
              activeOpacity={0.75}
            >
              <View style={styles.foodRowLeft}>
                <View style={styles.foodIcon}>
                  <Ionicons name="nutrition-outline" size={18} color={Colors.accent} />
                </View>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.foodMeta}>
                    {item.brand ? `${item.brand} · ` : ''}
                    {item.serving_size} {item.serving_unit}
                  </Text>
                </View>
              </View>
              <View style={styles.foodRight}>
                <Text style={styles.foodCals}>{formatCalories(item.calories)}</Text>
                <Text style={styles.foodCalsUnit}>kcal</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Bottom quick actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.bottomActionBtn}
            onPress={() => router.push('/fuel/custom-food')}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color={Colors.accent} />
            <Text style={styles.bottomActionText}>Create food</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomActionBtn}
            onPress={() => router.push('/fuel/scan')}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-outline" size={16} color={Colors.accent} />
            <Text style={styles.bottomActionText}>Scan barcode</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scanBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  mealScrollWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  mealTabsContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  mealTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mealTabActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  mealTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  mealTabTextActive: {
    color: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: Colors.surfaceRaised,
  },
  tabBtnText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabBtnTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  foodRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  foodIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  foodMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  foodRight: {
    alignItems: 'flex-end',
  },
  foodCals: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  foodCalsUnit: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  createBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  bottomActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  bottomActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
});
