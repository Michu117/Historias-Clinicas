import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExportButtonGroup from '../../component/ExportButtonGroup';

describe('ExportButtonGroup - Red', () => {
  it('renders disabled when user lacks permission', () => {
    // Render with hasPermission=false should show disabled export button
    render(<ExportButtonGroup hasPermission={false} />);
    const button = screen.getByRole('button', { name: /exportar|export/i });
    expect(button).toBeDisabled();
  });
});

