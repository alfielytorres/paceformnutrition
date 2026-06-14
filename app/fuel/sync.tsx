import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface SyncFeatureItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const FUTURE_FEATURES: SyncFeatureItem[] = [
  {
    icon: 'person-outline',
    title: 'Profile Sync',
    description: 'Pull your name, weight, and goals from your Paceform profile automatically.',
  },
  {
    icon: 'flame-outline',
    title: 'Calorie Targets',
    description: 'Adjust daily fuel targets based on your running volume and strength training.',
  },
  {
    icon: 'scale-outline',
    title: 'Body Weight',
    description: 'Log weight in one place and see it across your fuel and training dashboards.',
  },
  {
    icon: 'barbell-outline',
    title: 'Training Sessions',
    description: 'See how your strength and running sessions affect your daily calorie needs.',
  },
  {
    icon: 'trending-up-outline',
    title: 'Performance Insights',
    description: 'Understand how your nutrition fuels your training output over time.',
  },
  {
    icon: 'sparkles-outline',
    title: 'AI Coaching',
    description: 'Get advice from the Paceform AI based on your food logs, training, and body data.',
  },
];

export default function SyncScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paceform Sync</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="git-network-outline" size={36} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Coming Soon</Text>
          <Text style={styles.heroSubtitle}>
            Soon, your Fuel Log will connect with Paceform so your calories, training,
            weight, and body composition can work together.
          </Text>
        </View>

        {/* Future features */}
        <Text style={styles.sectionLabel}>What's coming</Text>
        <View style={styles.featureList}>
          {FUTURE_FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={feature.icon} size={20} color={Colors.accent} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Fuel MVP — Active</Text>
          </View>
          <View style={[styles.statusRow, { opacity: 0.4 }]}>
            <View style={[styles.statusDot, styles.statusDotInactive]} />
            <Text style={styles.statusText}>Paceform Sync — Not yet connected</Text>
          </View>
          <View style={[styles.statusRow, { opacity: 0.4 }]}>
            <View style={[styles.statusDot, styles.statusDotInactive]} />
            <Text style={styles.statusText}>AI Coaching — Not yet connected</Text>
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
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accentBorder,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  featureList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  featureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  statusCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
    gap: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  statusDotInactive: {
    backgroundColor: Colors.textMuted,
  },
  statusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
