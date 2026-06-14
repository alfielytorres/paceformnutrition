import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { nutritionService } from '@/lib/nutritionService';
import { MealType } from '@/types/food';
import { getTodayDate } from '@/lib/calculations';

export default function ScanScreen() {
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();
  const meal = (params.meal as MealType) || 'breakfast';
  const date = params.date || getTodayDate();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // We use a manual approach since expo-camera/expo-barcode-scanner
  // require native modules. Show a demo UI with a manual entry fallback.

  const handleManualEntry = () => {
    Alert.prompt(
      'Enter Barcode',
      'Type the barcode number to search:',
      async (barcode) => {
        if (!barcode) return;
        setLoading(true);
        try {
          const food = await nutritionService.searchFoodByBarcode(barcode.trim());
          if (food) {
            router.replace({
              pathname: '/fuel/confirm-food',
              params: {
                foodJson: JSON.stringify(food),
                meal,
                date,
              },
            });
          } else {
            Alert.alert(
              'Not found',
              'No food found for that barcode. Try searching manually.',
              [
                { text: 'Search', onPress: () => router.replace('/fuel/add-food') },
                { text: 'OK', style: 'cancel' },
              ]
            );
          }
        } finally {
          setLoading(false);
        }
      },
      'plain-text'
    );
  };

  const handleDemoScan = async () => {
    // Demo: scan the GYG barcode
    setLoading(true);
    setScanned(true);
    try {
      const barcode = '9300601234567';
      const food = await nutritionService.searchFoodByBarcode(barcode);
      if (food) {
        router.replace({
          pathname: '/fuel/confirm-food',
          params: {
            foodJson: JSON.stringify(food),
            meal,
            date,
          },
        });
      } else {
        Alert.alert('Not found', 'No food found for that barcode.');
        setScanned(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Barcode</Text>
        <TouchableOpacity
          onPress={handleManualEntry}
          style={styles.manualBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.manualBtnText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Viewfinder area */}
      <View style={styles.viewfinder}>
        <View style={styles.viewfinderInner}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {loading ? (
            <ActivityIndicator size="large" color={Colors.accent} />
          ) : (
            <View style={styles.scannerIcon}>
              <Ionicons name="barcode-outline" size={48} color="rgba(255,255,255,0.4)" />
            </View>
          )}
        </View>
        <Text style={styles.scanHint}>Position barcode within the frame</Text>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <Text style={styles.bottomPanelTitle}>Barcode Scanner</Text>
        <Text style={styles.bottomPanelSubtitle}>
          Point your camera at a product barcode to instantly look up nutrition info.
          Camera access requires device permissions.
        </Text>

        <TouchableOpacity
          style={styles.demoScanBtn}
          onPress={handleDemoScan}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Ionicons name="scan-outline" size={20} color={Colors.white} />
          <Text style={styles.demoScanText}>Demo Scan (GYG Burrito)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualSearchBtn}
          onPress={() => router.replace('/fuel/add-food')}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={16} color={Colors.accent} />
          <Text style={styles.manualSearchText}>Search manually instead</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  manualBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.full,
  },
  manualBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  viewfinder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  viewfinderInner: {
    width: 260,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.accent,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  scannerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  bottomPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  bottomPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bottomPanelSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  demoScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.sm,
  },
  demoScanText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  manualSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  manualSearchText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
});
