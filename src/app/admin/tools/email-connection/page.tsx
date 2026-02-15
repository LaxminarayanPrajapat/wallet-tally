'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, XCircle, Loader2, ShieldCheck, MailCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { sendTestEmail } from '@/app/actions/email';
import { cn } from '@/lib/utils';

export default function EmailConnectionPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    // If the user has a real email (not internal virtual one), pre-fill it
    if (user?.email && !user.email.includes('@wallet-tally.internal')) {
      setRecipientEmail(user.email);
    }
  }, [user]);

  const handleTestConnection = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast({ 
        variant: 'destructive', 
        title: 'Recipient Required', 
        description: 'Please provide a valid email address to receive the diagnostic message.' 
      });
      return;
    }

    setStatus('sending');
    setErrorDetails(null);
    try {
      const result = await sendTestEmail(recipientEmail, user?.displayName || 'Admin');
      if (result.success) {
        setStatus('success');
        toast({ title: 'Success', description: `Test email dispatched to ${recipientEmail}` });
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorDetails(err.message);
      toast({ variant: 'destructive', title: 'SMTP Error', description: err.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Card className="shadow-sm border border-slate-100 rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
              <Mail className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight">Email Connection</h1>
              <p className="text-slate-500 font-bold">SMTP Dispatcher Diagnostic</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-0 shadow-xl overflow-hidden bg-white">
          <CardContent className="p-10 flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
              <MailCheck className={cn("w-10 h-10", status === 'success' && "text-emerald-500", status === 'error' && "text-rose-500")} />
            </div>
            <div className="space-y-4 w-full">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-700">Verify SMTP Health</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Enter an email address to receive a system-generated diagnostic notice.
                </p>
              </div>
              
              <div className="space-y-2 text-left">
                <Label htmlFor="test-email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipient Email</Label>
                <Input 
                  id="test-email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 rounded-xl border-slate-200 bg-[#f8fafc] font-medium"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  disabled={status === 'sending'}
                />
              </div>
            </div>
            <Button 
              onClick={handleTestConnection}
              disabled={status === 'sending'}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 border-0 active:scale-95 transition-all"
            >
              {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Dispatch Diagnostic Email
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-xl overflow-hidden bg-white">
          <CardContent className="p-10 space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Configuration Profile</h3>
            <div className="space-y-4">
              <ProfileItem icon={ShieldCheck} label="Encryption" value="SSL/TLS" />
              <ProfileItem icon={AlertCircle} label="Auth Method" value="LOGIN / PASS" />
              <ProfileItem icon={Mail} label="Target recipient" value={recipientEmail || 'N/A'} />
            </div>

            <div className="pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Diagnostic Log</p>
              <div className={cn(
                "p-4 rounded-2xl border text-xs font-bold font-mono transition-colors",
                status === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                status === 'error' ? "bg-rose-50 border-rose-100 text-rose-700" :
                "bg-slate-50 border-slate-100 text-slate-400"
              )}>
                {status === 'idle' && '> SYSTEM READY FOR TEST'}
                {status === 'sending' && '> ATTEMPTING HANDSHAKE...'}
                {status === 'success' && '> SUCCESS: SMTP_OK (250)'}
                {status === 'error' && `> FAILED: ${errorDetails?.slice(0, 50)}...`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-slate-300" />
        <span className="text-sm font-bold text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-700 truncate max-w-[150px]">{value}</span>
    </div>
  );
}
