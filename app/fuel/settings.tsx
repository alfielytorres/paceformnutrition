import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { nutritionService } from '@/lib/nutritionService';

interface SettingRowProps {
  label: string;
  value: string;
  unit?: string;
  onPress: () => void;
}

function SettingRow({ label, value, unit, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={settingStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={settingStyles.label}>{label}</Text>
      <View style={settingStyles.valueWrap}>
        <Text style={settingStyles.value}>{value}</Text>
        {unit && <Text style={settingStyles.unit}>{unit}</Text>}
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  label: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  unit: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});

export default function SettingsScreen() {
  const [calorieTarget, setCalorieTarget] = useState(2658);
  const [editingCalories, setEditingCalories] = useState(false);
  const [calorieInput, setCalorieInput] = useState('');
  const userId = nutritionService.getDemoUserId();

  useEffect(() => {
    nutritionService.getCalorieTarget(userId).then(setCalorieTarget);
  }, []);

  const handleEditCalorieTarget = () => {
    setCalorieInput(calorieTarget.toString());
    setEditingCalories(true);
  };

  const handleSaveCalorieTarget = async () => {
    const val = parseInt(calorieInput);
    if (!val || val < 500 || val > 10000) {
      Alert.alert('Invalid target', 'Please enter a calorie target between 500 and 10,000');
      return;
    }
    await nutritionService.setCalorieTarget(userId, val);
    setCalorieTarget(val);
    setEditingCalories(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fuel Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile section */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Alfie</Text>
            <Text style={styles.profileEmail}>alfielytorres@gmail.com</Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Calorie Target */}
        <Text style={styles.sectionLabel}>Daily Targets</Text>
        <View style={styles.settingGroup}>
          {editingCalories ? (
            <View style={styles.editRow}>
              <Text style={styles.editLabel}>Calorie Target</Text>
              <View style={styles.editInputRow}>
                <TextInput
                  style={styles.editInput}
                  value={calorieInput}
                  onChangeText={setCalorieInput}
                  keyboardType="number-pad"
                  autoFocus
                  selectTextOnFocus
                />
                <Text style={styles.editUnit}>kcal</Text>
                <TouchableOpacity
                  style={styles.saveEditBtn}
                  onPress={handleSaveCalorieTarget}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveEditText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelEditBtn}
                  onPress={() => setEditingCalories(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <SettingRow
              label="Calorie Target"
              value={calorieTarget.toLocaleString()}
              unit="kcal/day"
              onPress={handleEditCalorieTarget}
            />
          )}
          <SettingRow
            label="Protein Target"
            value="200"
            unit="g/day"
            onPress={() => Alert.alert('Coming soon', 'Macro targets editor coming soon.')}
          />
          <SettingRow
            label="Carbs Target"
            value="300"
            unit="g/day"
            onPress={() => Alert.alert('Coming soon', 'Macro targets editor coming soon.')}
          />
          <SettingRow
            label="Fat Target"
            value="88"
            unit="g/day"
            onPress={() => Alert.alert('Coming soon', 'Macro targets editor coming soon.')}
          />
        </View>

        {/* Personal Info */}
        <Text style={styles.sectionLabel}>Personal Info</Text>
        <View style={styles.settingGroup}>
          <SettingRow
            label="Weight"
            value="82.4"
            unit="kg"
            onPress={() => Alert.alert('Coming soon', 'Weight tracking coming soon.')}
          />
          <SettingRow
            label="Activity Level"
            value="Moderately Active"
            onPress={() => Alert.alert('Coming soon', 'Activity level editor coming soon.')}
          />
          <SettingRow
            label="Weight Goal"
            value="Maintain"
            onPress={() => Alert.alert('Coming soon', 'Weight goal editor coming soon.')}
          />
        </View>

        {/* App Settings */}
        <Text style={styles.sectionLabel}>App</Text>
        <View style={styles.settingGroup}>
          <SettingRow
            label="Units"
            value="Metric"
            onPress={() => Alert.alert('Coming soon', 'Unit preferences coming soon.')}
          />
          <SettingRow
            label="Notifications"
            value="On"
            onPress={() => Alert.alert('Coming soon', 'Notification settings coming soon.')}
          />
          <SettingRow
            label="Data & Privacy"
            value=""
            onPress={() => Alert.alert('Privacy', 'Your data is stored locally in demo mode.')}
          />
        </View>

        {/* Paceform Sync */}
        <Text style={styles.sectionLabel}>Paceform</Text>
        <View style={styles.settingGroup}>
          <SettingRow
            label="Paceform Sync"
            value="Coming soon"
            onPress={() => router.push('/fuel/sync')}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.settingGroup}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0 MVP</Text>
          </View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.aboutLabel}>Mode</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Demo</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  scroll: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    margin: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editProfileBtn: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  settingGroup: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  editRow: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  editLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  editUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  saveEditBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  saveEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  cancelEditBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  aboutLabel: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  aboutValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  demoBadge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  demoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
});
