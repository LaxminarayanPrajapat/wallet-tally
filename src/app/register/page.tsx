'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Globe, 
  Banknote, 
  Eye, 
  EyeOff, 
  UserPlus,
  Check,
  Pencil
} from 'lucide-react';
import Swal from 'sweetalert2';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { countries } from '@/lib/countries';
import { useAuth, useFirestore } from '@/firebase';
import { sendOtpEmail } from '@/app/actions/email';
import { cn } from '@/lib/utils';

const AVATAR_SEEDS = [
  "Aiden", "Maya", "Liam", "Zoe", "Leo", 
  "Mason", "Sophia", "James", "Elena", "Xavier",
  "Isabella", "William", "Mia", "Oliver", "Ava",
  "Charles", "Margaret", "George", "Martha", "Arthur",
  "Emma", "Ethan", "Charlotte", "Benjamin", "Amelia"
];

const passwordValidation = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);

const formSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters.'),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().regex(passwordValidation, {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
    }),
    confirmPassword: z.string(),
    country: z.string().min(1, 'Please select a country.'),
    currency: z.string().min(1, 'Please select a currency.'),
    photoURL: z.string().min(1, 'Please select a profile icon.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      currency: '',
      photoURL: `https://api.dicebear.com/9.x/lorelei/svg?seed=Aiden`,
    },
  });

  const selectedCountryCode = form.watch('country');

  useEffect(() => {
    if (selectedCountryCode) {
      const country = countries.find((c) => c.code === selectedCountryCode);
      if (country) {
        form.setValue('currency', country.currency.symbol);
      }
    }
  }, [selectedCountryCode, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('name', '==', values.username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        form.setError('username', { type: 'manual', message: 'This username is already taken.' });
        setIsLoading(false);
        return;
      }

      const signInMethods = await fetchSignInMethodsForEmail(auth, values.email);
      if (signInMethods.length > 0) {
        form.setError('email', { type: 'manual', message: 'This email address is already in use.' });
        setIsLoading(false);
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('registrationData', JSON.stringify(values));
      sessionStorage.setItem('otp', otp);

      const result = await sendOtpEmail(values.email, otp);

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Verification Code Sent',
          text: `A 6-digit code has been sent to ${values.email}.`,
        });
        router.push(`/otp-verification?email=${encodeURIComponent(values.email)}`);
      } else {
        throw new Error(result.error || 'Failed to send verification email.');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Error',
        text: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent py-12 px-4">
      <div className="w-full max-w-md bg-card rounded-[2.5rem] shadow-2xl p-8 space-y-6 text-card-foreground border border-white/10 backdrop-blur-sm">
        
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
            <Icons.Logo className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Create Account</h1>
            <p className="text-muted-foreground text-sm font-medium">Enter your details below to create an account</p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
            <DialogTrigger asChild>
              <button className="relative group focus:outline-none" type="button">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-muted group-hover:border-primary transition-all duration-300 ring-2 ring-primary/5">
                  <Image 
                    src={form.watch('photoURL')} 
                    alt="Selected Avatar" 
                    fill 
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                  <Pencil className="w-4 h-4" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-3xl">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold text-primary">Choose Your Persona</DialogTitle>
                <DialogDescription className="font-medium">
                  Select an icon that best represents you.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-5 gap-3 p-2">
                {AVATAR_SEEDS.map((seed) => {
                  const url = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`;
                  const isSelected = form.watch('photoURL') === url;
                  return (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => {
                        form.setValue('photoURL', url);
                        setIsAvatarDialogOpen(false);
                      }}
                      className={cn(
                        "relative aspect-square rounded-2xl border-2 overflow-hidden bg-muted/50 transition-all hover:scale-105 active:scale-95 group",
                        isSelected ? "border-primary shadow-md ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                      )}
                    >
                      <Image src={url} alt={seed} fill unoptimized className="object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                          <Check className="w-8 h-8 text-primary drop-shadow-sm" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Choose your avatar</span>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Unique Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Choose a username" 
                        className="pl-11 rounded-2xl h-12 border-muted bg-muted/20 focus:bg-background transition-colors" 
                        {...field} 
                        disabled={isLoading} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-11 rounded-2xl h-12 border-muted bg-muted/20 focus:bg-background transition-colors" 
                        {...field} 
                        disabled={isLoading} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="pl-11 pr-11 rounded-2xl h-12 border-muted bg-muted/20 focus:bg-background" 
                          {...field} 
                          disabled={isLoading} 
                        />
                      </FormControl>
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="pl-11 pr-11 rounded-2xl h-12 border-muted bg-muted/20 focus:bg-background" 
                          {...field} 
                          disabled={isLoading} 
                        />
                      </FormControl>
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl h-12 border-muted bg-muted/20 pl-11 relative focus:bg-background transition-colors">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Currency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl h-12 border-muted bg-muted/20 pl-11 relative focus:bg-background transition-colors pointer-events-none">
                          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="Symbol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl">
                        {Array.from(new Set(countries.map(c => c.currency.symbol))).map(symbol => (
                          <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="ml-1" />
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
                  <UserPlus className="w-6 h-6" /> 
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-4 text-center">
          <p className="text-sm text-[#1a2e3a] font-bold">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline transition-all">
              Login here
            </Link>
          </p>
          <div className="pt-2">
            <p className="text-[11px] leading-relaxed text-muted-foreground font-medium px-4">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-[#1a2e3a] font-bold hover:underline">Terms & Conditions</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#1a2e3a] font-bold hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
