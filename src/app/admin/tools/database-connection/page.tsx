'use client';

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, Loader2, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export default function DatabaseConnectionPage() {
  const firestore = useFirestore();
  const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [latency, setSetLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMsg(null);
    const start = performance.now();
    try {
      // Attempt to read a non-existent system doc to verify read permissions and connectivity
      const pingRef = doc(firestore, '_system_', 'ping');
      await getDoc(pingRef);
      
      const end = performance.now();
      setSetLatency(Math.round(end - start));
      setStatus('connected');
      setLastChecked(new Date());
    } catch (err: any) {
      console.error('DB Ping Failed:', err);
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Card className="shadow-sm border border-slate-100 rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
                <Database className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight">Database Connection</h1>
                <p className="text-slate-500 font-bold">Cloud Firestore Readiness Check</p>
              </div>
            </div>
            <Button 
              onClick={checkConnection} 
              disabled={status === 'checking'}
              className="h-12 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-xl px-8 font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {status === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh Ping
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-0 shadow-xl overflow-hidden bg-white">
          <CardContent className="p-10 space-y-8 text-center">
            <div className="flex justify-center">
              {status === 'checking' ? (
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-100 border-t-primary animate-spin" />
              ) : status === 'connected' ? (
                <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                  <XCircle className="w-12 h-12" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-700">
                {status === 'checking' ? 'Establishing Handshake...' : status === 'connected' ? 'Operational' : 'Connection Failure'}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
            </div>
            {status === 'connected' && latency && (
              <Badge className="bg-emerald-500 text-white font-black px-4 py-1.5 rounded-full text-xs">
                Latency: {latency}ms
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-xl overflow-hidden bg-white">
          <CardContent className="p-10 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Endpoint Metrics</h3>
            <div className="space-y-4">
              <MetricItem icon={Server} label="Region" value="Global (Multi-region)" />
              <MetricItem icon={ShieldCheck} label="Security Rules" value="V2 (Active)" />
              <MetricItem icon={RefreshCw} label="Last Response" value={lastChecked ? lastChecked.toLocaleTimeString() : 'N/A'} />
            </div>
            {errorMsg && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-medium italic">
                Error Trace: {errorMsg}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-slate-300" />
        <span className="text-sm font-bold text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-700">{value}</span>
    </div>
  );
}
