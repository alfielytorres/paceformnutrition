import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { nutritionService } from '@/lib/nutritionService';
import { MealType } from '@/types/food';
import { getTodayDate } from '@/lib/calculations';

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  unit?: string;
  required?: boolean;
  decimal?: boolean;
}

const FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Food name', placeholder: 'e.g. Chicken Rice Bowl', required: true },
  { key: 'brand', label: 'Brand (optional)', placeholder: 'e.g. My Kitchen' },
  { key: 'serving_size', label: 'Serving size', placeholder: '100', required: true, decimal: true },
  { key: 'serving_unit', label: 'Serving unit', placeholder: 'e.g. g, ml, cup', required: true },
  { key: 'calories', label: 'Calories', placeholder: '0', unit: 'kcal', required: true, decimal: true },
  { key: 'protein_g', label: 'Protein', placeholder: '0', unit: 'g', required: true, decimal: true },
  { key: 'carbs_g', label: 'Carbohydrates', placeholder: '0', unit: 'g', required: true, decimal: true },
  { key: 'fat_g', label: 'Fat', placeholder: '0', unit: 'g', required: true, decimal: true },
  { key: 'fibre_g', label: 'Fibre', placeholder: '0', unit: 'g', decimal: true },
  { key: 'sugar_g', label: 'Sugar', placeholder: '0', unit: 'g', decimal: true },
  { key: 'sodium_mg', label: 'Sodium', placeholder: '0', unit: 'mg', decimal: true },
];

type FormData = Record<string, string>;

export default function CustomFoodScreen() {
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const meal = (params.meal as MealType) || 'breakfast';
  const date = params.date || getTodayDate();

  const [form, setForm] = useState<FormData>({
    name: '',
    brand: '',
    serving_size: '100',
    serving_unit: 'g',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fibre_g: '0',
    sugar_g: '0',
    sodium_mg: '0',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const userId = nutritionService.getDemoUserId();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    FIELDS.filter(f => f.required).forEach(field => {
      const val = form[field.key]?.trim();
      if (!val) {
        newErrors[field.key] = `${field.label} is required`;
      } else if (field.decimal && isNaN(parseFloat(val))) {
        newErrors[field.key] = `${field.label} must be a number`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const food = await nutritionService.createCustomFood(userId, {
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        source: 'custom',
        serving_size: parseFloat(form.serving_size) || 100,
        serving_unit: form.serving_unit.trim() || 'g',
        calories: parseFloat(form.calories) || 0,
        protein_g: parseFloat(form.protein_g) || 0,
        carbs_g: parseFloat(form.carbs_g) || 0,
        fat_g: parseFloat(form.fat_g) || 0,
        fibre_g: parseFloat(form.fibre_g) || 0,
        sugar_g: parseFloat(form.sugar_g) || 0,
        sodium_mg: parseFloat(form.sodium_mg) || 0,
        is_verified: false,
        is_public: false,
      });

      // Go to confirm screen
      router.replace({
        pathname: '/fuel/confirm-food',
        params: {
          foodJson: JSON.stringify(food),
          meal,
          date,
        },
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to create food. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Food</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.accent} />
            <Text style={styles.infoText}>
              Custom foods are saved to your account and can be reused.
            </Text>
          </View>

          {/* Form sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Food Details</Text>
            {FIELDS.slice(0, 4).map(field => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    errors[field.key] ? styles.inputError : undefined,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={form[field.key]}
                    onChangeText={text => {
                      setForm(prev => ({ ...prev, [field.key]: text }));
                      if (errors[field.key]) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next[field.key];
                          return next;
                        });
                      }
                    }}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={field.decimal ? 'decimal-pad' : 'default'}
                    autoCapitalize={field.key === 'name' || field.key === 'brand' ? 'words' : 'none'}
                  />
                  {field.unit && <Text style={styles.unitLabel}>{field.unit}</Text>}
                </View>
                {errors[field.key] ? (
                  <Text style={styles.errorText}>{errors[field.key]}</Text>
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition per serving</Text>
            {FIELDS.slice(4).map(field => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    errors[field.key] ? styles.inputError : undefined,
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    value={form[field.key]}
                    onChangeText={text => {
                      setForm(prev => ({ ...prev, [field.key]: text }));
                      if (errors[field.key]) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next[field.key];
                          return next;
                        });
                      }
                    }}
                    placeholder={field.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                  {field.unit && <Text style={styles.unitLabel}>{field.unit}</Text>}
                </View>
                {errors[field.key] ? (
                  <Text style={styles.errorText}>{errors[field.key]}</Text>
                ) : null}
              </View>
            ))}
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
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                <Text style={styles.saveButtonText}>Save Food</Text>
              </>
            )}
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
  scroll: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.lg,
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.accent,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  fieldWrap: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: Colors.accent,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  unitLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: '#FF4444',
    marginTop: 4,
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
});
