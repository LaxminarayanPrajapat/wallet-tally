'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  History, 
  LogOut,
  ChevronDown,
  Loader2,
  Home,
  ShieldCheck,
  Menu,
  X,
  Database,
  Mail,
  Info,
  BarChart3,
  Trash2,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Icons } from '@/components/icons';

const TopNavLink = ({ href, children, currentPath }: { href: string; children: ReactNode; currentPath: string }) => (
  <Link
    href={href}
    className={cn(
      "px-3 py-1.5 text-sm font-bold transition-colors rounded-md",
      currentPath === href
        ? "text-primary bg-slate-100"
        : "text-slate-700 hover:bg-slate-100"
    )}
  >
    {children}
  </Link>
);

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (isUserLoading) return;
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true' || !user) {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('isAdmin');
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
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
    { label: 'DB Connection', href: '/admin/tools/database-connection', icon: Database },
    { label: 'Email Connection', href: '/admin/tools/email-connection', icon: Mail },
    { label: 'System Info', href: '/admin/tools/system-information', icon: Info },
    { label: 'DB Analysis', href: '/admin/tools/database-analysis', icon: BarChart3 },
    { label: 'DB Cleanup', href: '/admin/tools/database-cleanup', icon: Trash2 },
  ];
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Icons.Logo className="h-8 w-8" />
          <span className="font-bold text-lg text-primary tracking-tight">Admin Panel</span>
        </Link>
        <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 transition-all text-sm font-bold rounded-lg",
              pathname === link.href ? "bg-primary text-white shadow-lg" : "text-slate-800 hover:bg-slate-100"
            )}
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        ))}
        <p className="px-3 pt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tools</p>
        {toolLinks.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={cn(
              "flex items-center gap-4 px-4 py-3 transition-all text-sm font-bold rounded-lg",
              pathname === tool.href ? "bg-primary text-white shadow-lg" : "text-slate-800 hover:bg-slate-100"
            )}
          >
            <tool.icon className="w-5 h-5" />
            <span>{tool.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>End Session</span>
        </button>
      </div>
    </div>
  );

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300/50">
            <ShieldCheck className="w-5 h-5 text-slate-600" />
          </div>
          <span className="text-sm font-bold text-slate-700 hidden sm:inline">Admin</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-xl mt-2">
        <div className="px-2 py-2">
          <p className="text-xs font-bold text-slate-400 uppercase">Authenticated User</p>
          <p className="text-sm font-semibold text-slate-800 truncate mt-1">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 font-bold focus:text-red-500 focus:bg-red-50 cursor-pointer rounded-lg h-10 px-2">
          <LogOut className="w-4 h-4 mr-2" />
          End Session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const desktopHeader = (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <Icons.Logo className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight text-slate-800">Wallet Tally</span>
        </Link>
        <nav className="flex items-center gap-1.5">
          {navLinks.map((link) => (
            <TopNavLink key={link.href} href={link.href} currentPath={pathname}>
              {link.label}
            </TopNavLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-md">
                <Settings className="w-4 h-4" />
                Tools
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl p-1.5 shadow-xl mt-2">
              {toolLinks.map(link => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className={cn("flex items-center gap-3 h-10 cursor-pointer font-semibold", pathname === link.href && "bg-slate-100")}>
                    <link.icon className="w-4 h-4 text-slate-500" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
      {userMenu}
    </div>
  );

  const mobileHeader = (
    <div className="w-full flex items-center justify-between">
      <div className="flex-1 flex justify-start">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-700">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 flex justify-center">
        <Link href="/admin/dashboard">
          <Icons.Logo className="h-8 w-8" />
        </Link>
      </div>
      <div className="flex-1 flex justify-end">
        {userMenu}
      </div>
    </div>
  );

  return (
    <>
      {/* Conditionally render sidebar and overlay only on mobile */}
      {!isDesktop && (
        <>
          <aside className={cn(
            "fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <SidebarContent />
          </aside>
          {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-40" />}
        </>
      )}

      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {isDesktop ? desktopHeader : mobileHeader}
        </div>
      </header>

      <main className="container mx-auto max-w-7xl flex-1 w-full p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </>
  );
}
