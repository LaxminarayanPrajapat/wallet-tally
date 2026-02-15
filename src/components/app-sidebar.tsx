'use client';

import { usePathname } from 'next/navigation';
import {
  AreaChart,
  Banknote,
  Cog,
  LayoutDashboard,
  Lightbulb,
  List,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Icons } from './icons';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/budgets', label: 'Budgets', icon: Banknote },
  { href: '/reports', label: 'Reports', icon: AreaChart },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Cog },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.Logo className="h-6 w-6 text-primary-foreground" />
          <span className="text-lg font-semibold text-primary-foreground">Wallet Tally</span>
          <div className="grow" />
          <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label }}
              >
                <a href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
