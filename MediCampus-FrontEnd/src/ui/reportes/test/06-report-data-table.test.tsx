import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReportDataTable from '../component/ReportDataTable';

describe('ReportDataTable - Red Phase', () => {
  const mockData = [
    { id: '1', fecha: '2024-01-01', servicio: 'Cardiología', consultas: 15 },
    { id: '2', fecha: '2024-01-02', servicio: 'Pediatría', consultas: 20 }
  ];

  const mockPagination = {
    page: 1,
    pageSize: 10,
    total: 100
  };

  it('renders table with data', () => {
    const onPageChange = vi.fn();
    render(
      <ReportDataTable
        data={mockData}
        pagination={mockPagination}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Cardiología')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('enables next page button when not on last page', () => {
    const onPageChange = vi.fn();
    render(
      <ReportDataTable
        data={mockData}
        pagination={{ page: 1, pageSize: 10, total: 100 }}
        onPageChange={onPageChange}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /siguiente|next/i });
    expect(nextBtn).not.toBeDisabled();
  });

  it('disables next page button on last page', () => {
    const onPageChange = vi.fn();
    render(
      <ReportDataTable
        data={mockData}
        pagination={{ page: 10, pageSize: 10, total: 100 }}
        onPageChange={onPageChange}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /siguiente|next/i });
    expect(nextBtn).toBeDisabled();
  });

  it('calls onPageChange when pagination button clicked', () => {
    const onPageChange = vi.fn();
    render(
      <ReportDataTable
        data={mockData}
        pagination={{ page: 1, pageSize: 10, total: 100 }}
        onPageChange={onPageChange}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /siguiente|next/i });
    fireEvent.click(nextBtn);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows empty message when no data', () => {
    const onPageChange = vi.fn();
    render(
      <ReportDataTable
        data={[]}
        pagination={{ page: 1, pageSize: 10, total: 0 }}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText(/sin datos|no data/i)).toBeInTheDocument();
  });

  it('renders sorting indicators', () => {
    const onPageChange = vi.fn();
    const onSort = vi.fn();
    render(
      <ReportDataTable
        data={mockData}
        pagination={mockPagination}
        onPageChange={onPageChange}
        onSort={onSort}
      />
    );

    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells.length).toBeGreaterThan(0);
  });
});

