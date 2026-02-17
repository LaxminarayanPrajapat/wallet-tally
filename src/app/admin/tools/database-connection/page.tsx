'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function DatabaseConnectionPage() {
  const firestore = useFirestore();
  const [status, setStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('idle');
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMsg(null);
    setLatency(null);
    const start = performance.now();
    try {
      const pingRef = doc(firestore, '_system_', 'ping');
      await getDoc(pingRef);
      
      const end = performance.now();
      setLatency(Math.round(end - start));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Database Connection</h1>
            <Button 
                onClick={checkConnection} 
                disabled={status === 'checking'}
                className="h-10 bg-primary hover:bg-primary/90 text-white rounded-lg px-5 font-bold flex items-center justify-center gap-2 shadow-sm"
            >
                {status === 'checking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh Ping
            </Button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="rounded-xl border-2 border-slate-100 shadow-sm">
                <CardContent className="p-8 space-y-6 text-center flex flex-col items-center justify-center min-h-[350px]">
                    <div className="flex justify-center">
                    {status === 'checking' ? (
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-slate-200 border-t-primary animate-spin" />
                    ) : status === 'connected' ? (
                        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-12 h-12" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                        <XCircle className="w-12 h-12" />
                        </div>
                    )}
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="text-2xl font-bold text-slate-800">
                            {status === 'checking' ? 'Pinging Firestore...' : status === 'connected' ? 'Operational' : 'Connection Failure'}
                        </h3>
                        <p className="text-sm font-semibold text-slate-500">Current Status</p>
                    </div>
                    {status === 'connected' && latency !== null && (
                    <Badge className="bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-md shadow-emerald-200">
                        Latency: {latency}ms
                    </Badge>
                    )}
                </CardContent>
            </Card>

            <Card className="rounded-xl border-2 border-slate-100 shadow-sm">
                 <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">Endpoint Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <MetricItem icon={Server} label="Region" value="Global (Multi-region)" />
                      <MetricItem icon={ShieldCheck} label="Security Rules" value="V2 (Active)" />
                      <MetricItem icon={RefreshCw} label="Last Response" value={lastChecked ? lastChecked.toLocaleTimeString() : 'N/A'} />
                    </div>
                    {errorMsg && (
                      <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-sm font-medium italic">
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
    <div className="flex items-center justify-between p-3 bg-slate-100/70 rounded-lg">
      <div className="flex items-center gap-3.5">
        <Icon className="w-5 h-5 text-slate-500" />
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-800">{value}</span>
    </div>
  );
}
