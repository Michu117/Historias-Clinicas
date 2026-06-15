import { describe, it, expect } from 'vitest';
import reportService from '../service/reportService';

describe('ReportService - Red (failing) initial', () => {
  it('should return success true for estadisticas (expected to fail until backend/mocks ready)', async () => {
    const res = await reportService.getEstadisticas({ fecha_inicio: '2020-01-01', fecha_fin: '2020-01-31' });
    expect(res.success).toBe(true);
    expect(res.data).not.toBeNull();
  });
});

