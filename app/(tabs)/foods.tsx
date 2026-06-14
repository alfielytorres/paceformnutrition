import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { nutritionService } from '@/lib/nutritionService';
import { Food } from '@/types/food';
import { formatCalories } from '@/lib/calculations';

export default function FoodsScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  const userId = nutritionService.getDemoUserId();

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [all, favs] = await Promise.all([
      nutritionService.searchFoods(''),
      nutritionService.getFavouriteFoods(userId),
    ]);
    setResults(all);
    setFavourites(new Set(favs.map(f => f.id)));
    setLoading(false);
  }, [userId]);

  useFocusEffect(useCallback(() => { loadAll(); }, [loadAll]));

  const handleSearch = async (text: string) => {
    setQuery(text);
    setLoading(true);
    const foods = await nutritionService.searchFoods(text);
    setResults(foods);
    setLoading(false);
  };

  const toggleFav = async (foodId: string) => {
    const isFav = await nutritionService.toggleFavouriteFood(userId, foodId);
    setFavourites(prev => {
      const next = new Set(prev);
      isFav ? next.add(foodId) : next.delete(foodId);
      return next;
    });
  };

  const renderFood = ({ item }: { item: Food }) => (
    <TouchableOpacity
      style={styles.foodRow}
      onPress={() => router.push({
        pathname: '/fuel/confirm-food',
        params: { foodJson: JSON.stringify(item), meal: 'breakfast' },
      } as any)}
      activeOpacity={0.75}
    >
      <View style={styles.foodIcon}>
        <Ionicons name="nutrition-outline" size={18} color={Colors.accent} />
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.foodMeta}>
          {item.brand ? `${item.brand} · ` : ''}{item.serving_size} {item.serving_unit}
        </Text>
      </View>
      <View style={styles.foodRight}>
        <Text style={styles.foodCals}>{formatCalories(item.calories)}</Text>
        <Text style={styles.foodCalsUnit}>kcal</Text>
      </View>
      <TouchableOpacity
        onPress={() => toggleFav(item.id)}
        style={styles.favBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={favourites.has(item.id) ? 'heart' : 'heart-outline'}
          size={18}
          color={favourites.has(item.id) ? Colors.accent : Colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Foods</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/fuel/custom-food')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.createBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search foods..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color={Colors.accent} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={() => handleSearch('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderFood}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="nutrition-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No foods found</Text>
              <Text style={styles.emptySubtitle}>
                {query ? `No results for "${query}"` : 'Try creating a custom food'}
              </Text>
              <TouchableOpacity
                style={styles.createEmptyBtn}
                onPress={() => router.push('/fuel/custom-food')}
                activeOpacity={0.8}
              >
                <Text style={styles.createEmptyBtnText}>Create custom food</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm,
  },
  screenTitle: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.accent, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  createBtnText: { fontSize: 13, fontWeight: '700', color: Colors.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, margin: Spacing.lg, marginTop: Spacing.sm,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.cardBorder, gap: Spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, gap: Spacing.xs },
  foodRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.cardBorder, gap: Spacing.md,
  },
  foodIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  foodMeta: { fontSize: 12, color: Colors.textSecondary },
  foodRight: { alignItems: 'flex-end' },
  foodCals: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  foodCalsUnit: { fontSize: 10, color: Colors.textMuted },
  favBtn: { padding: 4 },
  emptyState: {
    alignItems: 'center', paddingVertical: 60,
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  createEmptyBtn: {
    marginTop: Spacing.sm, backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md, borderWidth: 1, borderColor: Colors.accentBorder,
  },
  createEmptyBtnText: { fontSize: 14, fontWeight: '600', color: Colors.accent },
});
