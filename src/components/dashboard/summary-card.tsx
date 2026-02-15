'use client';

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCurrencySymbol } from '@/hooks/use-currency';
import { Skeleton } from '../ui/skeleton';

type SummaryCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'purple' | 'green' | 'red';
};

export function SummaryCard({ title, value, icon: Icon, variant = 'purple' }: SummaryCardProps) {
  const currencySymbol = useCurrencySymbol();

  const formattedValue = () => {
    if (currencySymbol === null) {
      return <Skeleton className="h-8 w-24" />;
    }

    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

    const sym = currencySymbol || '₹';
    return `${sym}${formattedAmount}`;
  };

  return (
    <Card className={cn(
      "relative border-t-4 bg-white shadow-md overflow-hidden",
      variant === 'purple' && "border-t-[#8b5cf6]",
      variant === 'green' && "border-t-[#10b981]",
      variant === 'red' && "border-t-[#ef4444]"
    )}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-xl",
          variant === 'purple' && "bg-[#f5f3ff] text-[#8b5cf6]",
          variant === 'green' && "bg-[#ecfdf5] text-[#10b981]",
          variant === 'red' && "bg-[#fef2f2] text-[#ef4444]"
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
          <span className="text-2xl font-black text-[#0f172a] mt-0.5">{formattedValue()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
