'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User, Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';

import { useFirestore } from '@/firebase';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetOtpEmail } from '@/app/actions/email';

const formSchema = z.object({
  identifier: z.string().min(1, 'Username or Email is required.'),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let email = values.identifier;
      let userName = 'User';
      let userId = '';

      // 1. Resolve identifier to email and find user
      const usersRef = collection(firestore, 'users');
      let q;
      
      if (values.identifier.includes('@')) {
        q = query(usersRef, where('email', '==', values.identifier));
      } else {
        q = query(usersRef, where('name', '==', values.identifier));
      }

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Account Not Found',
          description: 'We could not find an account associated with that identifier.',
        });
        setIsLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      email = userData.email;
      userName = userData.name || 'User';
      userId = userDoc.id;

      if (email.includes('@wallet-tally.internal')) {
        toast({
          variant: 'destructive',
          title: 'Email Required',
          description: 'This account was registered without an external email. Please contact support for password recovery.',
        });
        setIsLoading(false);
        return;
      }

      // 2. Generate and Send OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('resetPasswordData', JSON.stringify({ email, userName, userId }));
      sessionStorage.setItem('resetOtp', otp);

      const result = await sendPasswordResetOtpEmail(email, otp, userName);

      if (result.success) {
        toast({
          title: 'Verification Code Sent',
          description: `A 6-digit reset code has been sent to ${email}.`,
        });
        router.push(`/reset-password-otp?email=${encodeURIComponent(email)}`);
      } else {
        throw new Error(result.error || 'Failed to send reset email.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-[#1a2e3a] to-accent p-4">
      <div className="w-full max-w-[440px] space-y-8 rounded-[2.5rem] bg-card p-10 text-card-foreground shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-primary/10">
            <Icons.Logo className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#1a2e3a]">
              Reset Password
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Enter your account details to receive a reset code
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Account Identifier</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        placeholder="Username or Email" 
                        className="pl-12 rounded-2xl h-14 border-muted bg-muted/20 focus:bg-background transition-all" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" /> 
                  <span>Send Reset Code</span>
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
