'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { transactions, categories } from '@/lib/data';
import { useState } from 'react';
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

const chartConfig = {
  amount: {
    label: 'Amount',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function SpendingChart() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const startOfCurrentMonth = startOfMonth(currentDate);
  const endOfCurrentMonth = endOfMonth(currentDate);

  const monthlyTransactions = transactions.filter((t) => {
    const transactionDate = t.date;
    return (
      transactionDate >= startOfCurrentMonth &&
      transactionDate <= endOfCurrentMonth &&
      t.type === 'expense'
    );
  });

  const chartData = expenseCategories
    .map((category) => {
      const total = monthlyTransactions
        .filter((t) => t.category === category.name)
        .reduce((acc, t) => acc + t.amount, 0);

      return {
        category: category.name,
        amount: total,
      };
    })
    .filter((d) => d.amount > 0); // Only show categories with spending

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const isNextMonthDisabled = isSameMonth(currentDate, new Date());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Spending by Category</CardTitle>
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
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">
              No expense data for this month.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
