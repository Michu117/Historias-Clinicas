import { TouchableOpacity, Text } from 'react-native';
import { btnColors, radius } from '../../utils/theme';

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  onPress?: () => void;
  disabled?: boolean;
  children: string;
  style?: any;
}

const sizeStyles: Record<Size, any> = {
  sm: { px: 10, py: 6, fontSize: 12 },
  md: { px: 16, py: 8, fontSize: 14 },
  lg: { px: 24, py: 12, fontSize: 16 },
};

export function Button({ variant = 'primary', size = 'md', onPress, disabled, children, style }: ButtonProps) {
  const btn = btnColors[variant];
  const sz = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: btn.bg,
          paddingHorizontal: sz.px,
          paddingVertical: sz.py,
          borderRadius: radius.md,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: btn.text, fontSize: sz.fontSize, fontWeight: '500', textAlign: 'center' }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}
