
'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Loader2, MailCheck } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useCurrencySymbol } from '@/hooks/use-currency';
import { exportTransactionsToPdf } from '@/app/actions/export';
import { format, startOfDay, endOfDay, isBefore } from 'date-fns';

export function ExportDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const currencySymbol = useCurrencySymbol();
  
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    if (isBefore(end, start)) {
      toast({
        variant: "destructive",
        title: "Invalid Date Range",
        description: "The end date cannot be earlier than the start date.",
      });
      return;
    }

    setIsExporting(true);
    try {
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const q = query(
        transactionsRef,
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      // CRITICAL FIX: Convert transactions to plain objects for Server Action serialization
      // Firestore Timestamps have toJSON/toDate methods which Next.js Server Actions don't allow
      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: data.amount,
          type: data.type,
          category: data.category,
          description: data.description,
          // Convert Timestamp to ISO string for safe serialization
          date: data.date && typeof data.date.toDate === 'function' 
            ? data.date.toDate().toISOString() 
            : null
        };
      });

      if (transactions.length === 0) {
        toast({
          variant: "destructive",
          title: "No Data",
          description: "There are no transactions in the selected date range.",
        });
        setIsExporting(false);
        return;
      }

      const result = await exportTransactionsToPdf(
        user.email!,
        transactions,
        startDate,
        endDate,
        currencySymbol || '₹'
      );

      if (result.success) {
        toast({
          title: "Report Sent!",
          description: `A PDF report has been sent to ${user.email}.`,
        });
        setOpen(false);
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message || "An error occurred while generating your report.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="ml-auto bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white gap-2 px-4 rounded-md font-bold shadow-sm border-0"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] bg-white border-0 shadow-2xl p-10">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
            Export Report
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium pt-2">
            Select a date range to receive a detailed PDF report of your transactions via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleExport} className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isExporting}
            className="w-full h-14 bg-gradient-to-tr from-primary to-accent hover:opacity-95 text-white font-bold text-lg rounded-2xl transition-all shadow-xl mt-4 border-0"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MailCheck className="mr-2 h-5 w-5" />
                Send PDF Report
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
