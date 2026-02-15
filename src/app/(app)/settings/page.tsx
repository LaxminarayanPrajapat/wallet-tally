'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  updateProfile, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential 
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  Save, 
  Key, 
  Loader2, 
  Check 
} from 'lucide-react';
import { format } from 'date-fns';

import { useAuth, useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

const AVATAR_SEEDS = [
  "Aiden", "Maya", "Liam", "Zoe", "Leo", 
  "Mason", "Sophia", "James", "Elena", "Xavier",
  "Isabella", "William", "Mia", "Oliver", "Ava",
  "Charles", "Margaret", "George", "Martha", "Arthur",
  "Emma", "Ethan", "Charlotte", "Benjamin", "Amelia"
];

const profileSchema = z.object({
  username: z.string(),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: "New password must be different from the current password",
  path: ['newPassword'],
});

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      email: '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user, profileForm]);

  const onChangePassword = async (values: z.infer<typeof passwordSchema>) => {
    if (!user || !user.email) return;
    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.newPassword);
      
      toast({ title: "Password Changed", description: "Your security credentials have been updated." });
      passwordForm.reset();
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/wrong-password') {
        message = "The current password you entered is incorrect.";
      }
      toast({ variant: "destructive", title: "Update Failed", description: message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const onAvatarSelect = async (seed: string) => {
    if (!user) return;
    const url = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`;
    try {
      await updateProfile(user, { photoURL: url });
      await updateDoc(doc(firestore, 'users', user.uid), { photoURL: url });
      toast({ title: "Avatar Updated", description: "Your profile picture has been changed." });
      setIsAvatarDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const creationDate = user?.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
  const defaultAvatar = `https://api.dicebear.com/9.x/lorelei/svg?seed=${AVATAR_SEEDS[0]}`;

  return (
    <div className="max-w-6xl mx-auto w-full py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <Card className="rounded-[2.5rem] shadow-xl border-0 overflow-hidden bg-white">
            <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-40 h-40 rounded-full border-[6px] border-[#f1f5f9] shadow-inner overflow-hidden relative p-1 bg-gradient-to-tr from-primary via-primary to-accent">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                    <Image 
                      src={user?.photoURL || defaultAvatar} 
                      alt="Profile" 
                      fill 
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#1e293b]">{user?.displayName || 'User'}</h2>
                <p className="text-sm font-medium text-muted-foreground">
                  Member since {format(creationDate, 'MMMM yyyy')}
                </p>
              </div>

              <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl px-6 h-12 font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
                    <Camera className="w-5 h-5" />
                    Change Picture
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl rounded-[2.5rem]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">Choose Your Persona</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                      Select an icon that best represents you.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-5 gap-3 p-4">
                    {AVATAR_SEEDS.map((seed) => {
                      const url = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`;
                      const isSelected = user?.photoURL === url;
                      return (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => onAvatarSelect(seed)}
                          className={cn(
                            "relative aspect-square rounded-2xl border-2 overflow-hidden bg-[#f8fafc] transition-all hover:scale-105 active:scale-95 group",
                            isSelected ? "border-primary shadow-md ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                          )}
                        >
                          <Image src={url} alt={seed} fill unoptimized className="object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                              <Check className="w-8 h-8 text-primary" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Settings (Read Only) */}
          <Card className="rounded-[2.5rem] shadow-xl border-0 bg-white overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Profile Settings</h3>
              </div>
              
              <Form {...profileForm}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your username" 
                              className="rounded-xl h-14 border-[#cbd5e1] bg-[#f1f5f9] text-[#64748b] cursor-not-allowed font-medium" 
                              {...field} 
                              disabled
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              className="rounded-xl h-14 border-[#cbd5e1] bg-[#f1f5f9] text-[#64748b] cursor-not-allowed font-medium" 
                              {...field} 
                              disabled 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="rounded-[2.5rem] shadow-xl border-0 bg-white overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <h3 className="text-xl font-bold text-primary">Change Password</h3>
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Current Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showCurrentPassword ? "text" : "password"}
                              className="rounded-xl h-14 border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary bg-[#f8fafc] pr-12 font-medium" 
                              {...field} 
                              disabled={isUpdatingPassword}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showNewPassword ? "text" : "password"}
                                className="rounded-xl h-14 border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary bg-[#f8fafc] pr-12 font-medium" 
                                {...field} 
                                disabled={isUpdatingPassword}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm New Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                className="rounded-xl h-14 border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary bg-[#f8fafc] pr-12 font-medium" 
                                {...field} 
                                disabled={isUpdatingPassword}
                              />
                            </FormControl>
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold h-12 px-8 rounded-xl flex items-center gap-2 shadow-lg border-0 transition-all active:scale-95"
                  >
                    {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
                    Change Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
