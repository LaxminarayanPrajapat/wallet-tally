'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { budgets, categories, transactions } from '@/lib/data';
import { useCurrencySymbol } from '@/hooks/use-currency';
import { Skeleton } from '../ui/skeleton';
import React, { useState } from 'react';
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from 'date-fns';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BudgetOverview() {
  const currencySymbol = useCurrencySymbol();
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const isNextMonthDisabled = isSameMonth(currentDate, new Date());

  const formatCurrency = (value: number) => {
    if (currencySymbol === null) {
      return <Skeleton className="h-5 w-16" />;
    }
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return `${currencySymbol}${formattedAmount}`;
  };

  const monthlyBudgets = budgets.map(budget => {
    const category = categories.find((c) => c.id === budget.categoryId);
    if (!category) return null;

    const spent = transactions
      .filter((t) => {
        const transactionDate = t.date;
        return (
          transactionDate >= startOfCurrentMonth &&
          transactionDate <= endOfCurrentMonth &&
          t.category === category.name &&
          t.type === 'expense'
        );
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

    return {
      ...budget,
      categoryName: category.name,
      spent,
      progress,
    };
  }).filter(Boolean) as (typeof budgets[0] & { categoryName: string; spent: number; progress: number })[];


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>
            {format(currentDate, 'MMMM yyyy')}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextMonth}
            disabled={isNextMonthDisabled}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {monthlyBudgets.length > 0 ? (
          <div className="space-y-4">
            {monthlyBudgets.map((budget) => (
              <div key={budget.id}>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium">{budget.categoryName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress value={budget.progress} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">
              No budgets set for this month.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
