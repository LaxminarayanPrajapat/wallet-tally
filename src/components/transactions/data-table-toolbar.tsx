'use client';

import type { Table } from '@tanstack/react-table';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Filters and search removed as requested */}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}