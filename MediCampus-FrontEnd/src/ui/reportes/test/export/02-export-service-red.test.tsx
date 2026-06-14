import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ExportButtonGroup from '../../component/ExportButtonGroup';
import reportService from '../../service/reportService';

vi.mock('../../service/reportService', () => ({
  default: {
    downloadExport: vi.fn().mockRejectedValue(new Error('Internal Server Error'))
  }
}));

describe('Export service failure - Red', () => {
  it('shows error state when export service returns 500', async () => {
    render(<ExportButtonGroup hasPermission={true} />);
    const btn = screen.getByRole('button', { name: /exportar|export/i });
    await userEvent.click(btn);
    // Expect an error message to appear (component should handle service rejection)
    const err = await screen.findByText(/error|fallo|server/i);
    expect(err).toBeInTheDocument();
  });
});

