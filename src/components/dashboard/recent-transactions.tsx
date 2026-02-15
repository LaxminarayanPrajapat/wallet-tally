'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrencySymbol } from '@/hooks/use-currency';
import { Skeleton } from '../ui/skeleton';
import { Timestamp } from 'firebase/firestore';
import { DataTableRowActions } from '../transactions/data-table-row-actions';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ExportDialog } from '../transactions/export-dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { startOfMonth, endOfMonth, format, subMonths, addMonths, isSameMonth } from 'date-fns';
import { useUser } from '@/firebase';
import Link from 'next/link';

interface RecentTransactionsProps {
  transactions: any[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const currencySymbol = useCurrencySymbol();
  const { user } = useUser();
  const [viewDate, setViewDate] = useState<Date | null>(null);

  useEffect(() => {
    setViewDate(new Date());
  }, []);

  const accountCreationDate = useMemo(() => {
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime);
    }
    return new Date();
  }, [user]);

  const filteredTransactions = useMemo(() => {
    if (!viewDate) return [];
    const start = startOfMonth(viewDate);
    const end = endOfMonth(viewDate);
    // Filter by month and then limit to top 5 most recent
    return transactions
      .filter(t => {
        const d = t.date instanceof Timestamp ? t.date.toDate() : new Date(t.date);
        return d >= start && d <= end;
      })
      .slice(0, 5);
  }, [transactions, viewDate]);

  const formatCurrency = (value: number, type: string) => {
    if (currencySymbol === null) {
      return <Skeleton className="h-5 w-20" />;
    }
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    const sym = currencySymbol || '₹';
    const prefix = type === 'income' ? '+ ' : '- ';
    return `${prefix}${sym}${formattedAmount}`;
  };

  const formatDate = (date: any) => {
    if (date instanceof Timestamp) {
      return date.toDate().toISOString().split('T')[0];
    }
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return 'Pending...';
  };

  if (!viewDate) return null;

  const isFirstMonth = isSameMonth(viewDate, accountCreationDate);
  const isLastMonth = isSameMonth(viewDate, new Date());

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-b">
        <div className="flex items-center gap-4">
          <CardTitle className="text-lg font-bold text-[#1e293b]">Recent Transactions</CardTitle>
          <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-lg">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md hover:bg-white shadow-none"
              disabled={isFirstMonth}
              onClick={() => setViewDate(subMonths(viewDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-bold text-[#1e293b] min-w-[100px] text-center">
              {format(viewDate, 'MMMM yyyy')}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md hover:bg-white shadow-none"
              disabled={isLastMonth}
              onClick={() => setViewDate(addMonths(viewDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="hidden sm:flex gap-2 font-bold h-9 transition-all hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white hover:border-transparent shadow-sm"
          >
             <Link href="/transactions">
               <List className="h-4 w-4" /> View All
             </Link>
          </Button>
          <ExportDialog />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#f8fafc]">
            <TableRow>
              <TableHead className="font-bold text-[#64748b] h-14">Date</TableHead>
              <TableHead className="font-bold text-[#64748b] h-14">Type</TableHead>
              <TableHead className="font-bold text-[#64748b] h-14">Category</TableHead>
              <TableHead className="font-bold text-[#64748b] h-14">Description</TableHead>
              <TableHead className="font-bold text-[#64748b] h-14">Amount</TableHead>
              <TableHead className="font-bold text-[#64748b] h-14 text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-[#f1f5f9] transition-colors border-b border-[#f1f5f9]">
                  <TableCell className="font-medium text-[#475569] py-4">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge 
                      className={cn(
                        "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-0",
                        transaction.type === 'income' 
                          ? "bg-[#d1fae5] text-[#059669]" 
                          : "bg-[#fee2e2] text-[#dc2626]"
                      )}
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="secondary" className="bg-[#dbeafe] text-[#2563eb] border-0 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#64748b] truncate max-w-[200px] py-4">{transaction.description || '-'}</TableCell>
                  <TableCell className={cn(
                    "font-bold py-4",
                    transaction.type === 'income' ? "text-[#10b981]" : "text-[#ef4444]"
                  )}>
                    {formatCurrency(transaction.amount, transaction.type)}
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <DataTableRowActions row={{ original: transaction } as any} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="font-bold text-slate-300">NO TRANSACTIONS RECORDED</p>
                    <p className="text-xs">Select a different month or add a new entry</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
