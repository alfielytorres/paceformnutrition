import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import AddActionSheet from '@/components/AddActionSheet';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [showAddSheet, setShowAddSheet] = useState(false);

  const tabs = [
    { name: 'index', label: 'Daily', icon: 'today-outline', iconFocused: 'today' },
    { name: 'fuel', label: 'Meals', icon: 'restaurant-outline', iconFocused: 'restaurant' },
    { name: 'add', label: '', icon: 'add', iconFocused: 'add' },
    { name: 'log', label: 'History', icon: 'time-outline', iconFocused: 'time' },
    { name: 'foods', label: 'Foods', icon: 'nutrition-outline', iconFocused: 'nutrition' },
  ];

  return (
    <>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          if (tab.name === 'add') {
            return (
              <TouchableOpacity
                key="add"
                style={styles.addButton}
                onPress={() => setShowAddSheet(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>
            );
          }

          const route = state.routes.find((r: any) => r.name === tab.name);
          const isFocused = route && state.index === state.routes.indexOf(route);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => { if (route) navigation.navigate(tab.name); }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isFocused ? tab.iconFocused : tab.icon) as any}
                size={22}
                color={isFocused ? Colors.accent : Colors.textMuted}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <AddActionSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0E0E0E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.accent,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="fuel" />
      <Tabs.Screen name="add" options={{ href: null }} />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="foods" />
    </Tabs>
  );
}
