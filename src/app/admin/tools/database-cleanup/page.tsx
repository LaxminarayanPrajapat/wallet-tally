'use client';

import React, { useState } from 'react';
import { Trash2, ShieldAlert, Loader2, Info, History, Eraser, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { subDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DatabaseCleanupPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isCleaningLogs, setIsCleaningLogs] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const purgeOldLogs = async () => {
    if (!firestore || !user) return;
    
    setIsCleaningLogs(true);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const logsRef = collection(firestore, 'email_logs');
      const q = query(logsRef, where('sentAt', '<', thirtyDaysAgo));
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(firestore);
      
      let count = 0;
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
        setLastAction(`Successfully purged ${count} legacy email logs.`);
        toast({ title: 'Maintenance Complete', description: `${count} old logs removed.` });
      } else {
        setLastAction('No legacy logs found (30+ days old).');
        toast({ title: 'System Clean', description: 'No records matched the purge criteria.' });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Cleanup Failed', description: err.message });
    } finally {
      setIsCleaningLogs(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Card className="shadow-sm border border-slate-100 rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight">Database Cleanup</h1>
              <p className="text-slate-500 font-bold">Safe Maintenance & Log Rotation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
          <CardContent className="p-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-black text-slate-700 leading-tight">Rotate Email Logs</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maintenance Task</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
              "System communications (OTPs, warnings) older than 30 days are automatically identified for deletion to optimize storage performance."
            </p>

            <Button 
              onClick={purgeOldLogs}
              disabled={isCleaningLogs}
              className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95 border-0 flex items-center justify-center gap-3"
            >
              {isCleaningLogs ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eraser className="w-5 h-5" />}
              Purge Legacy Logs (30d+)
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-0 shadow-xl overflow-hidden bg-white">
          <CardContent className="p-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Action Summary</h3>
              <Badge className="bg-slate-100 text-slate-500 border-0 font-bold text-[9px] uppercase tracking-widest">Live Auditor</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-[11px] font-bold text-slate-500 leading-normal">
                  Cleanup operations are permanent. Please ensure you have exported any required audit logs before proceeding.
                </p>
              </div>

              {lastAction ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-[11px] font-black text-emerald-700 leading-normal">
                    {lastAction}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10 opacity-30">
                  <ShieldAlert className="w-12 h-12 text-slate-300" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
