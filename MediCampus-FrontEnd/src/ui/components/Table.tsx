import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className = '', ...props }) => (
  <div className="w-full overflow-auto rounded-2xl shadow-sm" style={{ border: '1px solid var(--outline)' }}>
    <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <thead className={`${className}`} style={{ backgroundColor: 'var(--table-header-bg)', borderBottom: '1px solid var(--outline)' }} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <tbody className={`divide-y ${className}`} style={{ backgroundColor: 'var(--surface-container-lowest)', borderColor: 'var(--outline)' }} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', ...props }) => (
  <tr className={`transition-colors ${className}`} style={{ backgroundColor: 'var(--table-row-hover)' }} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <th className={`h-10 px-4 text-left align-middle font-medium text-xs uppercase tracking-wider ${className}`} style={{ color: 'var(--on-surface-variant)' }} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <td className={`p-4 align-middle ${className}`} style={{ color: 'var(--on-surface)' }} {...props} />
);
