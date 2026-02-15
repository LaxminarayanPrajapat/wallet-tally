'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { User, LogOut, Plus, Minus } from 'lucide-react';
import { signOut } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Icons } from './icons';
import { useAuth, useUser } from '@/firebase';
import { AddTransactionSheet } from './transactions/add-transaction-sheet';

export function AppHeader() {
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const defaultAvatar = 'https://api.dicebear.com/9.x/lorelei/svg?seed=Aiden';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Icons.Logo className="h-8 w-8" />
          <span className="text-xl font-bold text-[#1a2e3a] tracking-tight">
            Wallet Tally
          </span>
        </Link>

        {/* Desktop Quick Actions */}
        <div className="hidden md:flex items-center gap-2 border-l pl-6 ml-2">
          <AddTransactionSheet defaultType="income">
            <Button variant="outline" size="sm" className="gap-1.5 border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white font-bold h-9">
              <Plus className="h-4 w-4" /> Income
            </Button>
          </AddTransactionSheet>
          <AddTransactionSheet defaultType="expense">
            <Button variant="outline" size="sm" className="gap-1.5 border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white font-bold h-9">
              <Minus className="h-4 w-4" /> Expense
            </Button>
          </AddTransactionSheet>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Profile Section - Clickable on mobile, inert on desktop */}
        <Link 
          href="/settings" 
          className="flex items-center gap-2 pl-2 border-l ml-2 group md:pointer-events-none md:cursor-default"
        >
          <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
            <AvatarImage
              src={user?.photoURL || defaultAvatar}
              alt="User Avatar"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-bold text-[#334155] hidden lg:block">
            {user?.displayName}
          </span>
        </Link>

        <Link href="/settings">
          <Button variant="default" className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-lg h-9 px-3 gap-2 hidden md:flex font-bold shadow-sm">
            <User className="h-4 w-4" /> Profile
          </Button>
        </Link>

        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-white rounded-lg h-9 px-3 gap-2 font-semibold transition-colors group"
        >
          <LogOut className="h-4 w-4 group-hover:text-white" /> Logout
        </Button>
      </div>
    </header>
  );
}
