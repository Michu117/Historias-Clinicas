import { View, Text, Switch } from 'react-native';
import { colors } from '../../utils/theme';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  warning?: boolean;
}

export function ToggleSwitch({ label, checked, onChange, disabled, warning }: ToggleSwitchProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 14, color: disabled ? '#cbd5e1' : colors.onSurfaceVariant }}>{label}</Text>
        {warning && (
          <Text style={{ fontSize: 10, color: colors.error, backgroundColor: colors.errorContainer, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, overflow: 'hidden' }}>
            Requiere autorización especial
          </Text>
        )}
      </View>
      <Switch
        value={checked}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: colors.outlineVariant, true: colors.primary }}
        thumbColor={checked ? colors.onPrimary : '#f4f3f4'}
      />
    </View>
  );
}
