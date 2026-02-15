'use client';

import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { SummaryCard } from '@/components/dashboard/summary-card';
import { FeedbackCard } from '@/components/dashboard/feedback-card';
import { SpendingByCategoryChart } from '@/components/reports/spending-by-category-chart';
import { Wallet, TrendingUp, TrendingDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, format, subMonths, addMonths, isSameMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { FloatingActionButtons } from '@/components/dashboard/floating-action-buttons';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Month-wise navigation state for Chart - deferred initialization to avoid hydration mismatch
  const [chartDate, setChartDate] = useState<Date | null>(null);

  useEffect(() => {
    setChartDate(new Date());
  }, []);

  // All transactions for balance calculation
  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsQuery);

  const accountCreationDate = useMemo(() => {
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime);
    }
    return new Date();
  }, [user]);

  const totals = useMemo(() => {
    if (!transactions) return { income: 0, expenses: 0, balance: 0 };
    
    const now = new Date();
    const startOfCurrent = startOfMonth(now);
    const endOfCurrent = endOfMonth(now);

    const income = transactions
      .filter((t) => {
        if (t.type !== 'income') return false;
        const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        return d >= startOfCurrent && d <= endOfCurrent;
      })
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    const expenses = transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        return d >= startOfCurrent && d <= endOfCurrent;
      })
      .reduce((acc, t) => acc + (t.amount || 0), 0);

    const allTimeBalance = transactions.reduce((acc, t) => {
      return acc + (t.type === 'income' ? (t.amount || 0) : -(t.amount || 0));
    }, 0);
    
    return {
      income,
      expenses,
      balance: allTimeBalance
    };
  }, [transactions]);

  const chartTransactions = useMemo(() => {
    if (!transactions || !chartDate) return [];
    const start = startOfMonth(chartDate);
    const end = endOfMonth(chartDate);
    return transactions.filter(t => {
      const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
      return d >= start && d <= end;
    });
  }, [transactions, chartDate]);

  if (isUserLoading || isTransactionsLoading || !chartDate) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isFirstMonthChart = isSameMonth(chartDate, accountCreationDate);
  const isLastMonthChart = isSameMonth(chartDate, new Date());

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 relative">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Balance"
          value={totals.balance}
          icon={Wallet}
          variant="purple"
        />
        <SummaryCard
          title="Total Income"
          value={totals.income}
          icon={TrendingUp}
          variant="green"
        />
        <SummaryCard
          title="Total Expenses"
          value={totals.expenses}
          icon={TrendingDown}
          variant="red"
        />
      </div>

      {/* Transactions Row with its own navigation */}
      <RecentTransactions transactions={transactions || []} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
        <Card className="shadow-md">
          <CardHeader className="py-4 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-[#1e293b]">Income vs Expenses</CardTitle>
              <p className="text-xs text-muted-foreground font-medium">{format(chartDate, 'MMMM yyyy')}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-lg">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-md hover:bg-white"
                disabled={isFirstMonthChart}
                onClick={() => setChartDate(subMonths(chartDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-md hover:bg-white"
                disabled={isLastMonthChart}
                onClick={() => setChartDate(addMonths(chartDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center p-0">
             <SpendingByCategoryChart transactions={chartTransactions} />
          </CardContent>
        </Card>

        <FeedbackCard />
      </div>

      {/* Floating Action Buttons for mobile and desktop */}
      <FloatingActionButtons />
    </div>
  );
}
