import { View, Text, TouchableOpacity } from 'react-native';
import { colors, radius } from '../../utils/theme';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 }}>
      <TouchableOpacity
        onPress={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md, backgroundColor: page === 1 ? colors.surfaceContainerLow : colors.primary }}
      >
        <Text style={{ color: page === 1 ? colors.onSurfaceVariant : colors.onPrimary, fontSize: 13, fontWeight: '500' }}>Anterior</Text>
      </TouchableOpacity>
      <Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>
        {page} de {totalPages}
      </Text>
      <TouchableOpacity
        onPress={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md, backgroundColor: page === totalPages ? colors.surfaceContainerLow : colors.primary }}
      >
        <Text style={{ color: page === totalPages ? colors.onSurfaceVariant : colors.onPrimary, fontSize: 13, fontWeight: '500' }}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}
