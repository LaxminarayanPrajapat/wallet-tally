'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetOtpEmail } from '@/app/actions/email';

function ResetPasswordOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const resetData = sessionStorage.getItem('resetPasswordData');
    if (!email || !resetData) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Access',
        text: 'Please request a password reset first.',
      }).then(() => router.push('/forgot-password'));
    }
  }, [email, router]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedOtp = sessionStorage.getItem('resetOtp');

    if (storedOtp && otp === storedOtp) {
      setIsVerifying(true);
      await Swal.fire({
        icon: 'success',
        title: 'Identity Verified',
        text: 'You can now set a new password for your account.',
        timer: 2000,
        showConfirmButton: false,
      });
      router.push('/reset-password');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: 'The verification code you entered is incorrect.',
      });
    }
  };

  const handleResendOtp = async () => {
    const resetDataString = sessionStorage.getItem('resetPasswordData');
    if (!resetDataString) return;
    const { email, userName } = JSON.parse(resetDataString);

    setIsSending(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await sendPasswordResetOtpEmail(email, newOtp, userName);

    if (result.success) {
      sessionStorage.setItem('resetOtp', newOtp);
      setTimer(60);
      setIsResendDisabled(true);
      Swal.fire({
        icon: 'success',
        title: 'Code Resent',
        text: `A new reset code has been sent to ${email}.`,
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Resend Failed',
        text: result.error || 'An unexpected error occurred.',
      });
    }
    setIsSending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-[#1a2e3a] to-accent p-4">
      <div className="w-full max-w-[440px] space-y-8 rounded-[2.5rem] bg-card p-10 text-card-foreground shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-primary/10">
            <Icons.Logo className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#1a2e3a]">Verify Identity</h1>
            <p className="text-muted-foreground text-sm font-medium">
              Enter the reset code sent to <span className="text-primary font-bold">{email}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="______"
              className="text-center text-3xl tracking-[0.4em] font-mono h-16 rounded-2xl border-muted bg-muted/10 focus:bg-background transition-all"
              required
              disabled={isVerifying}
            />
          </div>

          <Button
            type="submit"
            disabled={isVerifying || isSending || otp.length < 6}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Verify & Proceed
              </>
            )}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <div className="text-sm font-medium text-muted-foreground">
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResendDisabled || isSending}
              className="font-bold text-primary hover:underline disabled:text-muted-foreground transition-colors"
            >
              {isResendDisabled ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </div>
          
          <Link 
            href="/forgot-password" 
            className="text-sm font-bold text-muted-foreground hover:text-primary hover:underline flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Identifier
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordOtp />
        </Suspense>
    )
}
