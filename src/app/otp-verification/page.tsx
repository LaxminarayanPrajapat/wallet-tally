
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { sendOtpEmail } from '@/app/actions/email';
import { Loader2 } from 'lucide-react';

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    const registrationData = sessionStorage.getItem('registrationData');
    if (!email || !registrationData) {
      toast({
        variant: 'destructive',
        title: 'Invalid Access',
        description: 'Please go through the registration process first.',
      });
      router.push('/register');
    }
  }, [email, router, toast]);

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
    const storedOtp = sessionStorage.getItem('otp');
    const registrationDataString = sessionStorage.getItem('registrationData');

    if (registrationDataString && storedOtp && otp === storedOtp) {
      const registrationData = JSON.parse(registrationDataString);
      setIsVerifying(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          registrationData.email,
          registrationData.password,
        );
        const user = userCredential.user;

        // Update Firebase Auth Profile
        await updateProfile(user, {
          displayName: registrationData.username,
          photoURL: registrationData.photoURL
        });

        // Store User in Firestore with Country
        await setDoc(doc(firestore, 'users', user.uid), {
          id: user.uid,
          email: user.email,
          name: registrationData.username,
          photoURL: registrationData.photoURL,
          country: registrationData.country || 'Unknown'
        });

        localStorage.setItem('currencySymbol', registrationData.currency);

        toast({
          title: 'Email Verified!',
          description: 'Your account has been created successfully.',
        });

        sessionStorage.removeItem('otp');
        sessionStorage.removeItem('registrationData');
        router.push('/dashboard');
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Registration Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      } finally {
        setIsVerifying(false);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect.',
      });
    }
  };

  const handleResendOtp = async () => {
    const registrationDataString = sessionStorage.getItem('registrationData');
    if (!registrationDataString) return;
    const registrationData = JSON.parse(registrationDataString);

    setIsSending(true);
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await sendOtpEmail(registrationData.email, newOtp);

    if (result.success) {
      sessionStorage.setItem('otp', newOtp);
      setTimer(60);
      setIsResendDisabled(true);
      toast({
        title: 'OTP Resent',
        description: `A new verification code has been sent to ${registrationData.email}.`,
      });
    }
    setIsSending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-accent p-4">
      <div className="w-full max-w-md space-y-6 rounded-[2.5rem] bg-card p-8 text-card-foreground shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/10 mb-4">
            <Icons.Logo className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Email Verification</h1>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit code sent to <span className="font-bold text-primary">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">One-Time Password</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="______"
              className="text-center text-3xl tracking-[0.4em] font-mono h-16 rounded-xl border-muted"
              required
              disabled={isVerifying}
            />
          </div>

          <Button
            type="submit"
            disabled={isVerifying || isSending}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Account'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground space-y-4 pt-4 border-t">
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResendDisabled || isSending}
              className="font-bold text-primary hover:underline disabled:text-muted-foreground"
            >
              {isResendDisabled ? `Resend in ${timer}s` : 'Resend OTP'}
            </button>
          </p>
          <p>
            <Link href="/register" className="font-bold text-primary hover:underline">
              Back to registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
