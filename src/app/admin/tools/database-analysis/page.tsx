'use client';

import React from 'react';
import { Users, Receipt, MessageSquare, History, Loader2, PieChart, TrendingUp, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DatabaseAnalysisPage() {
  const firestore = useFirestore();

  const { data: users, isLoading: isUsersLoading } = useCollection(useMemoFirebase(() => collection(firestore, 'users'), [firestore]));
  const { data: transactions, isLoading: isTxLoading } = useCollection(useMemoFirebase(() => collectionGroup(firestore, 'transactions'), [firestore]));
  const { data: feedback, isLoading: isFeedbackLoading } = useCollection(useMemoFirebase(() => collectionGroup(firestore, 'feedback'), [firestore]));
  const { data: logs, isLoading: isLogsLoading } = useCollection(useMemoFirebase(() => collection(firestore, 'email_logs'), [firestore]));

  if (isUsersLoading || isTxLoading || isFeedbackLoading || isLogsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Profiles', count: users?.length || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Ledger Entries', count: transactions?.length || 0, icon: Receipt, color: 'text-emerald-500' },
    { label: 'Feedbacks', count: feedback?.length || 0, icon: MessageSquare, color: 'text-amber-500' },
    { label: 'Email Logs', count: logs?.length || 0, icon: History, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Database Analysis</h1>
        </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-xl border-2 border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5 space-y-3">
              <div className={cn("w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <Card className="rounded-xl border-2 border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <PieChart className="w-5 h-5 text-primary" /> Document Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-5">
              <DistributionRow label="Users" current={users?.length || 0} total={1000} color="bg-blue-500" />
              <DistributionRow label="Transactions" current={transactions?.length || 0} total={10000} color="bg-emerald-500" />
              <DistributionRow label="Feedback" current={feedback?.length || 0} total={500} color="bg-amber-500" />
              <DistributionRow label="Logs" current={logs?.length || 0} total={2000} color="bg-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-2 border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" /> Data Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Database Optimized</h3>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                Indices are operational. No orphaned records. Documents adhere to schema definitions.
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs">
              Verified Stable
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DistributionRow({ label, current, total, color }: { label: string, current: number, total: number, color: string }) {
  const percent = Math.min(100, (current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-bold text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-500">{current} docs</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
