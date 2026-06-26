import { TextInput, View, Text, TouchableOpacity } from 'react-native';
import { colors, radius } from '../../utils/theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'email-address';
  label?: string;
  required?: boolean;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({ value, onChangeText, placeholder, secureTextEntry, autoFocus, keyboardType, label, required, error, rightIcon, onRightIconPress }: InputProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ fontSize: 13, fontWeight: '500', color: colors.onSurfaceVariant, marginBottom: 4 }}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          secureTextEntry={secureTextEntry}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={{
            width: '100%',
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            backgroundColor: colors.surfaceContainerLow,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.outlineVariant,
            borderRadius: radius.md,
            color: colors.onSurface,
            paddingRight: rightIcon ? 40 : 12,
          }}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ position: 'absolute', right: 8, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 4 }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={{ fontSize: 12, color: colors.error, marginTop: 2 }}>{error}</Text>
      )}
    </View>
  );
}
