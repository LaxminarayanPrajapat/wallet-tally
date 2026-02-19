'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc
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

// ... (zod schema and other constants)

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    // ... (form configuration)
  });

  // ... (useEffect for currency)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Step 1: Check if the email is in the blocked_emails collection
      const blockedEmailRef = doc(firestore, 'blocked_emails', values.email);
      const blockedEmailSnap = await getDoc(blockedEmailRef);

      if (blockedEmailSnap.exists()) {
        form.setError('email', { 
          type: 'manual', 
          message: 'This email id is blocked due to some malpractices' 
        });
        setIsLoading(false);
        return;
      }

      // Step 2: Check if username is taken
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('name', '==', values.username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        form.setError('username', { type: 'manual', message: 'This username is already taken.' });
        setIsLoading(false);
        return;
      }

      // Step 3: Check if email is already in use by an active account
      const signInMethods = await fetchSignInMethodsForEmail(auth, values.email);
      if (signInMethods.length > 0) {
        form.setError('email', { type: 'manual', message: 'This email address is already in use.' });
        setIsLoading(false);
        return;
      }

      // ... (rest of the submission logic for sending OTP)

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

  return <></>;
}
