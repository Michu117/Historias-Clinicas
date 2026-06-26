import { View, Text } from 'react-native';
import { cardColors, colors, radius } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: any;
}

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: cardColors.bg,
          borderWidth: 1,
          borderColor: cardColors.border,
          borderRadius: radius.lg,
          padding: 20,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardTitleProps {
  children: string;
  style?: any;
}

export function CardTitle({ children, style }: CardTitleProps) {
  return (
    <Text
      style={[
        { fontSize: 18, fontWeight: '600', color: colors.hcText },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
