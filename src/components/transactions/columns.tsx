'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { categories } from '@/lib/data';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { Skeleton } from '../ui/skeleton';
import { Timestamp } from 'firebase/firestore';

export const getColumns = (currencySymbol: string | null): ColumnDef<any>[] => [
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => <span>{row.original.description || '-'}</span>
  },
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const categoryName = row.original.category;
      const category = categories.find((c) => c.name === categoryName);
      const Icon = category?.icon;

      return (
        <Badge variant="outline" className="gap-1">
          {Icon && <Icon className="h-4 w-4" />}
          {categoryName}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = row.original.date;
      if (date instanceof Timestamp) {
        return <span>{date.toDate().toLocaleDateString()}</span>;
      }
      return <span>Pending...</span>;
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const { type } = row.original;

      if (currencySymbol === null) {
        return <Skeleton className="h-6 w-24" />;
      }

      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);

      const displayAmount = `${currencySymbol}${formatted}`;

      return (
        <div
          className={cn(
            'text-right font-medium',
            type === 'income' ? 'text-accent' : 'text-destructive',
          )}
        >
          {type === 'income' ? `+${displayAmount}` : `-${displayAmount}`}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];