'use client';

import React, { useState, useEffect } from 'react';
import { Send, Loader2, ShieldCheck, MailCheck, AlertCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    if (user?.email && !user.email.includes('@wallet-tally.internal')) {
      setRecipientEmail(user.email);
    }
  }, [user]);

  const handleTestConnection = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast({ 
        variant: 'destructive', 
        title: 'Recipient Required', 
        description: 'Please provide a valid email address for the diagnostic.' 
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
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Email Connection</h1>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="rounded-xl border-2 border-slate-100 shadow-sm">
                <CardContent className="p-8 flex flex-col justify-between h-full gap-6">
                <div className="text-center space-y-4">
                    <div className="flex justify-center">
                        <div className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all",
                            status === 'idle' && "bg-slate-100 text-slate-400",
                            status === 'sending' && "bg-blue-100 text-blue-500",
                            status === 'success' && "bg-emerald-100 text-emerald-600",
                            status === 'error' && "bg-rose-100 text-rose-600",
                        )}>
                            {status === 'sending' ? <Loader2 className="w-10 h-10 animate-spin" /> : <MailCheck className="w-10 h-10" />}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-slate-800">Verify SMTP Health</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                        Enter an email to receive a system-generated diagnostic notice.
                    </p>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="test-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Recipient Email</Label>
                    <Input 
                        id="test-email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-11 rounded-lg border-slate-200 bg-slate-50 focus:bg-white font-semibold"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        disabled={status === 'sending'}
                    />
                    </div>
                    <Button 
                    onClick={handleTestConnection}
                    disabled={status === 'sending'}
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 border-0 active:scale-95 transition-all"
                    >
                    {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Dispatch Diagnostic Email
                    </Button>
                </div>
                </CardContent>
            </Card>

            <Card className="rounded-xl border-2 border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-800">Configuration Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <ProfileItem icon={ShieldCheck} label="Encryption" value="SSL/TLS" />
                        <ProfileItem icon={AlertCircle} label="Auth Method" value="LOGIN / PASS" />
                        <ProfileItem icon={Mail} label="Target recipient" value={recipientEmail || 'N/A'} />
                    </div>

                    <div className="pt-4">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Diagnostic Log</p>
                        <div className={cn(
                        "p-4 rounded-lg border text-sm font-bold font-mono transition-colors h-28 flex items-center justify-center text-center",
                        status === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                        status === 'error' ? "bg-rose-50 border-rose-100 text-rose-700" :
                        "bg-slate-100 border-slate-200 text-slate-500"
                        )}>
                        {status === 'idle' && '> SYSTEM READY'}
                        {status === 'sending' && '> ATTEMPTING HANDSHAKE...'}
                        {status === 'success' && '> SUCCESS: SMTP_OK (250)'}
                        {status === 'error' && `> FAILED: ${errorDetails?.slice(0, 100)}...`}
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
    <div className="flex items-center justify-between p-3 bg-slate-100/70 rounded-lg">
      <div className="flex items-center gap-3.5">
        <Icon className="w-5 h-5 text-slate-500" />
        <span className="text-sm font-semibold text-slate-600">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{value}</span>
    </div>
  );
}
