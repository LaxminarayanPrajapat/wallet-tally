'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  History, 
  Wrench, 
  LogOut,
  ChevronDown,
  Loader2,
  Home,
  ShieldCheck,
  Menu,
  Database,
  Mail,
  Info,
  BarChart3,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isUserLoading) return;

    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/login');
    } else if (!user) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    localStorage.removeItem('isAdmin');
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f1f5f9]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/admin/email-history', label: 'Email History', icon: History },
  ];

  const toolLinks = [
    { label: 'Database Connection', href: '/admin/tools/database-connection', icon: Database, group: 'System Checks' },
    { label: 'Email Connection', href: '/admin/tools/email-connection', icon: Mail, group: 'System Checks' },
    { label: 'System Information', href: '/admin/tools/system-information', icon: Info, group: 'System Checks' },
    { label: 'Database Analysis', href: '/admin/tools/database-analysis', icon: BarChart3, group: 'Maintenance' },
    { label: 'Database Cleanup', href: '/admin/tools/database-cleanup', icon: Trash2, group: 'Maintenance' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-body">
      <div className="w-full pt-4 px-4">
        <header className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#064e3b] text-white shadow-xl h-16 flex items-center justify-between px-6 z-50 rounded-2xl">
          <div className="flex items-center gap-10">
            <Link href="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                <Icons.Logo className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight whitespace-nowrap">Wallet Tally Admin</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 transition-all text-sm font-bold rounded-lg",
                    pathname === link.href
                      ? "bg-white/20 text-white shadow-inner" 
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    "flex items-center gap-2 px-4 py-2 transition-all text-sm font-bold rounded-lg outline-none",
                    pathname.startsWith('/admin/tools')
                      ? "bg-white/20 text-white shadow-inner"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}>
                    <Wrench className="w-4 h-4" />
                    Tools
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 rounded-2xl p-2 shadow-2xl border-0 mt-2 bg-white">
                  <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">System Checks</DropdownMenuLabel>
                  {toolLinks.filter(t => t.group === 'System Checks').map(tool => (
                    <DropdownMenuItem key={tool.href} asChild>
                      <Link href={tool.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <tool.icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="font-bold text-slate-700 text-sm">{tool.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-2 bg-slate-50" />
                  <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Maintenance</DropdownMenuLabel>
                  {toolLinks.filter(t => t.group === 'Maintenance').map(tool => (
                    <DropdownMenuItem key={tool.href} asChild>
                      <Link href={tool.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                        <tool.icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="font-bold text-slate-700 text-sm">{tool.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-0 w-72 bg-gradient-to-b from-[#1e3a8a] to-[#064e3b] text-white">
                <SheetHeader className="p-6 border-b border-white/10 text-left">
                  <SheetTitle className="text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center shadow-sm">
                      <Icons.Logo className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl">Wallet Tally</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all",
                        pathname === link.href
                          ? "bg-white/20 text-white shadow-inner"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  ))}
                  
                  <div className="pt-2">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] px-4 py-3">Tools & Maintenance</p>
                    {toolLinks.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all",
                          pathname === tool.href
                            ? "bg-white/20 text-white shadow-inner"
                            : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <tool.icon className="h-5 w-5" />
                        {tool.label}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl text-red-300 hover:text-red-200 hover:bg-white/10 transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                      End Session
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-white" />
                    <span className="text-sm font-bold text-white whitespace-nowrap hidden sm:inline">Admin User</span>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-0 mt-2 bg-white">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Control</p>
                   <p className="text-xs font-bold text-slate-700 mt-1 truncate">Session Status: Active</p>
                </div>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold focus:text-red-500 focus:bg-red-50 cursor-pointer rounded-xl h-11 px-4">
                  <LogOut className="w-4 h-4 mr-2" /> End Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      </div>

      <main className="flex-1 container mx-auto p-4 md:p-10 space-y-6">
        <div className="pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
