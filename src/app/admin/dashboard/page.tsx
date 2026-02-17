'use client';

import React, { useMemo } from 'react';
import { 
  Users, 
  MessageSquare, 
  Star,
  Globe,
  Terminal,
  Cpu,
  Loader2,
  Cloud,
  Activity,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, collectionGroup } from 'firebase/firestore';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { countries } from '@/lib/countries';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user, isUserLoading]);
  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user) return null;
    return collectionGroup(firestore, 'feedback');
  }, [firestore, user, isUserLoading]);
  const { data: allFeedback, isLoading: isFeedbackLoading } = useCollection(feedbackQuery);

  const registeredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => u.email && u.email.includes('@'));
  }, [users]);

  const totalUsers = registeredUsers.length;
  const totalFeedbacks = allFeedback?.length || 0;
  
  const avgRating = useMemo(() => {
    if (!allFeedback || allFeedback.length === 0) return "0.0";
    const sum = allFeedback.reduce((acc, f) => acc + (Number(f.rating) || 0), 0);
    return (sum / allFeedback.length).toFixed(1);
  }, [allFeedback]);

  const countryData = useMemo(() => {
    if (!registeredUsers || registeredUsers.length === 0) return [];
    const counts: Record<string, number> = {};
    registeredUsers.forEach(u => {
      const countryVal = u.country?.trim().toUpperCase() || 'IN'; 
      const match = countries.find(c => c.code.toUpperCase() === countryVal || c.name.toUpperCase() === countryVal);
      const name = match ? match.name : 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [registeredUsers]);

  const COLORS = ['#1e3a8a', '#064e3b', '#10b981', '#00A3AD', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

  if (isUserLoading || isUsersLoading || isFeedbackLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SummaryItem icon={Users} label="Total Users" value={totalUsers} />
        <SummaryItem icon={MessageSquare} label="Total Feedbacks" value={totalFeedbacks} />
        <SummaryItem icon={Star} label="Avg Rating" value={`${avgRating} ★`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-6">
        <Card className="xl:col-span-3 shadow-lg border border-slate-200/80 rounded-2xl bg-white">
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-3">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> User Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] p-2 sm:p-4">
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={countryData} innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" nameKey="name" stroke="#fff">
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip colors={COLORS} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: '15px' }} formatter={(value) => <span className="text-[10px] sm:text-xs font-semibold text-slate-500">{value}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState icon={Globe} text="No demographic data available" />}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 shadow-lg border border-slate-200/80 rounded-2xl bg-white">
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-3">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Feedback Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[350px] flex items-center justify-center p-4 sm:p-6">
            {allFeedback && allFeedback.length > 0 ? (
              <div className="w-full space-y-3 sm:space-y-4">
                {[5, 4, 3, 2, 1].map(r => {
                  const count = allFeedback.filter(f => Number(f.rating) === r).length;
                  const percent = (allFeedback.length > 0) ? (count / allFeedback.length) * 100 : 0;
                  return (
                    <div key={r} className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-600 w-6 text-right">{r} ★</span>
                      <div className="flex-1 h-2 sm:h-2.5 bg-slate-100 rounded-full shadow-inner">
                        <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState icon={MessageSquare} text="No feedback data available" />}
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-3 mt-8 md:mt-10 mb-4">
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> System Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <SystemInfoCard icon={Cloud} label="Platform" value="Firebase Hosting" badge="Live" />
          <SystemInfoCard icon={Database} label="Primary DB" value="Cloud Firestore" badge="Stable" />
          <SystemInfoCard icon={Cpu} label="Runtime" value="Next.js v15.5" />
          <SystemInfoCard icon={Activity} label="Monitoring" value="Firebase Vitals" />
        </div>
      </div>
    </div>
  );
}

const SummaryItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
  <Card className="shadow-lg border-slate-200/80 rounded-xl sm:rounded-2xl bg-white transition-all hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]">
    <CardContent className="p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
      <div className="p-2 sm:p-3 rounded-full bg-slate-100 text-primary shadow-sm">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div>
        <p className="text-xl sm:text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const SystemInfoCard = ({ icon: Icon, label, value, badge }: { icon: React.ElementType, label: string, value: string, badge?: string }) => (
    <Card className="shadow-lg border-slate-200/80 rounded-xl sm:rounded-2xl bg-white">
        <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-slate-100 text-primary shadow-sm">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">{value}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            </div>
            {badge && <Badge className="ml-auto h-4 px-2 sm:h-5 sm:px-2.5 text-[8px] sm:text-[9px] font-bold bg-emerald-100 text-emerald-800 border-0 rounded-full">{badge}</Badge>}
        </CardContent>
    </Card>
);

const CustomTooltip = ({ active, payload, colors }: { active?: boolean; payload?: any[]; colors: string[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload.reduce((acc: number, curr: any) => acc + curr.payload.value, 0);
    const percent = ((data.value / total) * 100).toFixed(1);
    const color = colors[data.payload.index % colors.length];

    return (
      <div className="bg-slate-800 text-white p-2 text-[10px] sm:p-2.5 sm:text-xs rounded-lg shadow-lg border border-slate-700">
        <p className="font-bold mb-1 border-b border-slate-600 pb-1">{data.name}</p>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
           <span>{data.value} users ({percent}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

const EmptyState = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2 sm:space-y-3">
    <div className="p-3 sm:p-4 bg-slate-100 rounded-full">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
    </div>
    <p className="text-xs sm:text-sm font-semibold">{text}</p>
  </div>
);
