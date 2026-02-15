import { cn } from '@/lib/utils';
import type { Column } from '@tanstack/react-table';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  // Sorting controls removed as requested
  return (
    <div className={cn('flex items-center space-x-2 font-semibold', className)}>
      {title}
    </div>
  );
}