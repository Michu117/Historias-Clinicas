import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportFilterBar from '../component/ReportFilterBar';

describe('ReportFilterBar', () => {
  it('disables apply button initially when no dates selected', () => {
    const onApply = vi.fn();
    render(<ReportFilterBar onApply={onApply} />);
    const applyBtn = screen.getByRole('button', { name: /aplicar/i });
    expect(applyBtn).toBeDisabled();
  });

  it('enables apply button when valid date range selected', () => {
    const onApply = vi.fn();
    render(<ReportFilterBar onApply={onApply} />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(inputs[1], { target: { value: '2024-12-31' } });

    const applyBtn = screen.getByRole('button', { name: /aplicar/i });
    expect(applyBtn).not.toBeDisabled();
  });

  it('calls onApply when button clicked with valid range', () => {
    const onApply = vi.fn();
    render(<ReportFilterBar onApply={onApply} />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2024-01-01' } });
    fireEvent.change(inputs[1], { target: { value: '2024-12-31' } });

    const applyBtn = screen.getByRole('button', { name: /aplicar/i });
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalled();
  });

  it('disables apply button when invalid range entered', () => {
    const onApply = vi.fn();
    render(<ReportFilterBar onApply={onApply} />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: '2024-12-31' } });
    fireEvent.change(inputs[1], { target: { value: '2024-01-01' } });

    const applyBtn = screen.getByRole('button', { name: /aplicar/i });
    expect(applyBtn).toBeDisabled();
  });
});

