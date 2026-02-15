'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/icons';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 text-card-foreground shadow-lg">
        <div className="text-center">
          <Icons.Logo className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-3xl font-bold">Verify Your Email</h1>
          <p className="text-muted-foreground">
            We've sent a verification link to{' '}
            <span className="font-medium text-primary">{email || 'your email'}</span>.
          </p>
          <p className="mt-2 text-muted-foreground">
            Please check your inbox and click the link to activate your account.
          </p>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Didn't receive the email? Check your spam folder or try registering again.
          </p>
          <p className="mt-4">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
