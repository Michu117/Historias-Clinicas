import { View, Text } from 'react-native';
import { colors, radius } from '../../utils/theme';

type Variant = 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, { bg: string; text: string }> = {
  success: { bg: '#dcfce7', text: '#166534' },
  danger: { bg: '#fee2e2', text: '#991b1b' },
  warning: { bg: '#fef3c7', text: '#92400e' },
  neutral: { bg: colors.surfaceContainerLow, text: colors.onSurfaceVariant },
};

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  const s = variantStyles[variant];
  return (
    <View style={{ backgroundColor: s.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.sm, alignSelf: 'flex-start' }}>
      <Text style={{ color: s.text, fontSize: 11, fontWeight: '500' }}>{children}</Text>
    </View>
  );
}
