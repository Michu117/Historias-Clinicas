import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { colors, radius } from '../../utils/theme';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export function Select({ options, value, onChange, label, required }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.onSurfaceVariant, marginBottom: 4 }}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{
          paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md,
          backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant,
        }}
      >
        <Text style={{ color: value ? colors.onSurface : colors.outline, fontSize: 14 }}>
          {selected ? selected.label : 'Seleccionar...'}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 4, borderRadius: radius.md, borderWidth: 1, borderColor: colors.outlineVariant, overflow: 'hidden' }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => { onChange(opt.value); setOpen(false); }}
              style={{
                paddingHorizontal: 12, paddingVertical: 10,
                backgroundColor: opt.value === value ? colors.primaryContainer : colors.surfaceContainerLowest,
              }}
            >
              <Text style={{ color: opt.value === value ? colors.onPrimaryContainer : colors.onSurface, fontSize: 14 }}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
