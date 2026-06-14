import { View } from 'react-native';
import { Colors } from '@/constants/theme';

// This screen is never rendered directly.
// The "add" tab button opens the AddActionSheet from the tab bar.
export default function AddPlaceholder() {
  return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
}
