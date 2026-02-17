'use client';

import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence 
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, Lock, Eye, EyeOff, LogIn, Key, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore } from '@/firebase';

const formSchema = z.object({
  loginId: z.string().min(1, 'Login ID is required.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginId: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const persistence = values.rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);

      if (values.loginId === 'WalletTallyAdmin' && values.password === 'WTA@1908') {
        await signInAnonymously(auth);
        localStorage.setItem('isAdmin', 'true');
        await Swal.fire({
          icon: 'success',
          title: 'Admin Login Successful',
          text: 'Welcome to the Admin Dashboard!',
          timer: 2000,
          showConfirmButton: false,
        });
        router.push('/admin/dashboard');
        return;
      }

      let emailToUse = values.loginId;
      if (!values.loginId.includes('@')) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('name', '==', values.loginId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          emailToUse = `${values.loginId}@wallet-tally.internal`;
        } else {
          emailToUse = querySnapshot.docs[0].data().email;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, values.password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        await Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'This account has been deactivated or removed by an administrator.',
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('isAdmin', 'false');
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back!',
        timer: 1500,
        showConfirmButton: false,
      });
      router.push('/dashboard');
    } catch (error: any) {
      let description = 'An unexpected error occurred.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        description = 'Invalid username/email or password.';
      }
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-[#1a2e3a] to-accent p-4">
      <div className="w-full max-w-[440px] space-y-8 rounded-[2.5rem] bg-card p-10 text-card-foreground shadow-2xl">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-20 h-20 rounded-full bg-[#0d1b2a] flex items-center justify-center shadow-xl border border-white/10 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-50" />
            <Icons.Logo className="h-10 w-10 relative z-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#1a2e3a]">
              Wallet Tally
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome back! Please login to your account
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="loginId"
              render={({ field }) => (
                <FormItem>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Password" 
                        className="pl-12 pr-12 rounded-2xl h-14 border-muted bg-muted/20 focus:bg-background transition-all" 
                        {...field} 
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between px-1">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        className="rounded-sm border-muted"
                      />
                    </FormControl>
                    <div className="leading-none">
                      <span className="text-sm font-medium text-muted-foreground">Remember me</span>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-xl hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6" /> 
                  <span>Login</span>
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="flex flex-col items-center space-y-6">
          <Link 
            href="/forgot-password" 
            className="text-sm font-bold text-[#1a2e3a] hover:underline flex items-center gap-2 transition-all"
          >
            <Key className="w-4 h-4" />
            Forgot Password?
          </Link>

          <div className="w-full h-px bg-muted" />

          <p className="text-sm text-muted-foreground font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:underline transition-all">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
