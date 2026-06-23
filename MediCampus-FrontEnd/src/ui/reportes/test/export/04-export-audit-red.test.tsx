import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ExportButtonGroup from '../../component/ExportButtonGroup';

vi.mock('../../service/reportService', () => ({
  default: {
    downloadExport: vi.fn().mockResolvedValue({ success: true, message: 'ok', data: { filename: 'reporte.csv' }, errors: null })
  }
}));

import reportService from '../../service/reportService';

describe('Export audit payload - Red', () => {
  it('attaches audit metadata to export payload', async () => {
    render(<ExportButtonGroup hasPermission={true} />);
    const btn = screen.getByRole('button', { name: /exportar|export/i });
    btn.click();
    await vi.waitFor(() => {
      expect(reportService.downloadExport).toHaveBeenCalled();
    });
    const calledWith = (reportService.downloadExport as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(calledWith).toHaveProperty('audit');
    expect(calledWith.audit).toHaveProperty('userId');
    expect(calledWith.audit).toHaveProperty('timestamp');
  });
});
