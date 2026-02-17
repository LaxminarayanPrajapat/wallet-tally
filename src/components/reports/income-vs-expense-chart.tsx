'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format, isValid, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

interface IncomeVsExpenseChartProps {
  transactions: any[];
}

const chartConfig = {
  income: {
    label: 'Income',
    color: '#4ade80', // Direct color mapping
  },
  expense: {
    label: 'Expense',
    color: '#f87171', // Direct color mapping
  },
} satisfies ChartConfig;

export function IncomeVsExpenseChart({ transactions }: IncomeVsExpenseChartProps) {
  const chartData = useMemo(() => {
    // More defensive data processing logic
    const monthlyData = transactions.reduce((acc, t) => {
      if (!t || !t.date || typeof t.type !== 'string' || typeof t.amount !== 'number') {
        return acc; // Skip invalid transaction
      }

      let date;
      if (t.date.toDate) {
        date = t.date.toDate();
      } else if (typeof t.date === 'string') {
        date = parseISO(t.date);
      } else if (t.date instanceof Date) {
        date = t.date;
      } else {
        return acc; // Skip if date is not a recognizable format
      }

      if (!isValid(date)) {
        return acc; // Skip invalid dates
      }

      const month = format(date, 'MMM');
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }

      if (t.type === 'income' || t.type === 'expense') {
         acc[month][t.type] += t.amount;
      }

      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      data,
    }));
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs. Expenses</CardTitle>
        <CardDescription>
          A comparison of your income and expenses over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="income"
              type="monotone"
              stroke={chartConfig.income.color} // Use direct color
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expense"
              type="monotone"
              stroke={chartConfig.expense.color} // Use direct color
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
