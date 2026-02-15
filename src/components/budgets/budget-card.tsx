'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { categories, transactions } from '@/lib/data';
import type { Budget } from '@/lib/types';
import { cn } from '@/lib/utils';
import { EditBudgetDialog } from './edit-budget-dialog';
import { useCurrencySymbol } from '@/hooks/use-currency';
import { Skeleton } from '../ui/skeleton';

type BudgetCardProps = {
  budget: Budget;
};

export function BudgetCard({ budget }: BudgetCardProps) {
  const currencySymbol = useCurrencySymbol();
  const category = categories.find((c) => c.id === budget.categoryId);
  if (!category) return null;

  const spent = transactions
    .filter((t) => t.category === category.name && t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const remaining = budget.amount - spent;
  const progress = (spent / budget.amount) * 100;
  const Icon = category.icon;

  const formatCurrency = (value: number) => {
    if (currencySymbol === null) {
      return <Skeleton className="h-5 w-20" />;
    }
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return `${currencySymbol}${formattedAmount}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
          <CardTitle>{category.name}</CardTitle>
        </div>
        <EditBudgetDialog budget={budget} />
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} />
        <div className="flex justify-between text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Spent</p>
            <p className="font-medium">{formatCurrency(spent)}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-muted-foreground">Remaining</p>
            <p
              className={cn(
                'font-medium',
                remaining < 0 ? 'text-destructive' : 'text-green-500',
              )}
            >
              {formatCurrency(remaining)}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-muted-foreground">Budget</p>
            <p className="font-medium">{formatCurrency(budget.amount)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
