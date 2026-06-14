import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface AddActionSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface ActionItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  onPress: () => void;
}

export default function AddActionSheet({ visible, onClose }: AddActionSheetProps) {
  const actions: ActionItem[] = [
    {
      icon: 'search-outline',
      label: 'Search food',
      subtitle: 'Find from our food database',
      onPress: () => { onClose(); router.push('/fuel/add-food'); },
    },
    {
      icon: 'barcode-outline',
      label: 'Scan barcode',
      subtitle: 'Scan product packaging',
      onPress: () => { onClose(); router.push('/fuel/scan'); },
    },
    {
      icon: 'create-outline',
      label: 'Create custom food',
      subtitle: 'Add a food not in the database',
      onPress: () => { onClose(); router.push('/fuel/custom-food'); },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>Log Food</Text>
              <View style={styles.actions}>
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.actionItem}
                    onPress={action.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIcon}>
                      <Ionicons name={action.icon} size={22} color={Colors.accent} />
                    </View>
                    <View style={styles.actionText}>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                      <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 12,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceRaised,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
