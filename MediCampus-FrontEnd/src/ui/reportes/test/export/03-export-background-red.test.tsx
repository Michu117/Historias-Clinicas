import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExportButtonGroup from '../../component/ExportButtonGroup';
import reportService from '../../service/reportService';

vi.mock('../../service/reportService', () => ({
  default: {
    downloadExport: vi.fn().mockResolvedValue({
      success: true,
      message: 'ok',
      data: { filename: 'reporte.csv' },
      errors: null
    })
  }
}));

describe('Export background success - Red', () => {
  it('calls downloadExport and completes successfully', async () => {
    render(<ExportButtonGroup hasPermission={true} />);
    const btn = screen.getByRole('button', { name: /exportar|export/i });
    btn.click();
    await vi.waitFor(() => {
      expect(reportService.downloadExport).toHaveBeenCalled();
    });
  });
});
