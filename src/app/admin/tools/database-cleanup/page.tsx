'use client';

import React, { useState } from 'react';
import { ShieldAlert, Loader2, Info, CheckCircle2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { subDays } from 'date-fns';

export default function DatabaseCleanupPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [isCleaning, setIsCleaning] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const purgeOldLogs = async () => {
    if (!firestore || !user) {
        Swal.fire('Error!', 'User or database context is missing.', 'error');
        return;
    };
    
    setIsCleaning(true);
    setLastAction(null);
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
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
        Swal.fire('Success!', `${count} old logs removed.`, 'success');
      } else {
        setLastAction('No legacy logs found (30+ days old).');
        Swal.fire('All Clean!', 'No records matched the purge criteria.', 'info');
      }
    } catch (err: any) {
      Swal.fire('Cleanup Failed!', err.message, 'error');
      setLastAction(`Error during cleanup: ${err.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const handlePurgeClick = () => {
    Swal.fire({
      title: 'Are you absolutely sure?',
      text: "This will permanently delete all email logs older than 30 days. This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, Purge Logs',
      customClass: {
        popup: 'rounded-2xl shadow-lg',
        title: 'text-slate-800',
        htmlContainer: 'text-slate-600',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        purgeOldLogs();
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Database Cleanup</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="rounded-xl border-2 border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="font-bold text-slate-800 text-lg">Manual Data Purge</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant="outline"
                        disabled={isCleaning}
                        onClick={handlePurgeClick}
                        className="w-full h-11 font-bold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                        {isCleaning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}
                        Purge Legacy Email Logs
                    </Button>
                    <p className="text-xs text-slate-500 mt-3 text-center">
                        Purge email communication logs older than 30 days.
                    </p>
                </CardContent>
            </Card>

            <Card className="rounded-xl border-2 border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-between">
                        <span>Action Summary</span>
                        <Badge className="bg-slate-100 text-slate-600 font-semibold text-xs">Live Auditor</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-lg border border-slate-200">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-slate-600">
                           Cleanup operations are permanent and cannot be undone.
                        </p>
                    </div>

                    {lastAction ? (
                        <div className="flex items-center gap-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm font-semibold text-emerald-800">
                            {lastAction}
                        </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                        <ShieldAlert className="w-12 h-12 text-slate-300" />
                        <p className="text-sm font-bold text-slate-400 mt-3">Awaiting Action</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
