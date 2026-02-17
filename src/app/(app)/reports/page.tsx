'use client';

import { IncomeVsExpenseChart } from '@/components/reports/income-vs-expense-chart';
import { SpendingByCategoryChart } from '@/components/reports/spending-by-category-chart';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsQuery);

  if (isUserLoading || isTransactionsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Visualize your financial patterns.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SpendingByCategoryChart transactions={transactions || []} />
        <IncomeVsExpenseChart transactions={transactions || []} />
      </div>
    </div>
  );
}
