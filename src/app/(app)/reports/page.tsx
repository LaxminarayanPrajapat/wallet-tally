'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { startOfMonth, endOfMonth, format, subMonths, addMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { SpendingByCategoryChart } from '@/components/reports/spending-by-category-chart';
import { IncomeVsExpenseChart } from '@/components/reports/income-vs-expense-chart';

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [date, setDate] = useState(new Date());

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsQuery);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return transactions.filter(t => {
      const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
      return d >= start && d <= end;
    });
  }, [transactions, date]);

  if (isUserLoading || isTransactionsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending by Category */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Spending by Category</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setDate(subMonths(date, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{format(date, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={() => setDate(addMonths(date, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SpendingByCategoryChart transactions={filteredTransactions} />
        </CardContent>
      </Card>

      {/* Income vs. Expense */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs. Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeVsExpenseChart transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
