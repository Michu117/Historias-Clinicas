import React from 'react';

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className = '', ...props }) => (
  <div className="w-full overflow-auto border border-slate-200 rounded-global shadow-sm">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <thead className={`bg-slate-50 border-b border-slate-200 ${className}`} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = '', ...props }) => (
  <tbody className={`divide-y divide-slate-200 bg-white ${className}`} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = '', ...props }) => (
  <tr className={`hover:bg-slate-50/50 transition-colors ${className}`} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <th className={`h-10 px-4 text-left align-middle font-medium text-slate-500 text-xs uppercase tracking-wider ${className}`} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className = '', ...props }) => (
  <td className={`p-4 align-middle text-slate-700 ${className}`} {...props} />
);