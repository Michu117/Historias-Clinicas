import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, radius } from '../../utils/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '80%', paddingBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.hcText }}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 20, color: colors.onSurfaceVariant }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}
