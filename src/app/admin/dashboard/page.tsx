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

/**
 * @fileOverview Administrative dashboard providing high-fidelity analytics and system health metrics.
 */
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

  // Robust logic to identify and group demographics
  const countryData = useMemo(() => {
    if (!registeredUsers || registeredUsers.length === 0) return [];
    const counts: Record<string, number> = {};
    
    registeredUsers.forEach(u => {
      // Robust detection for India/IN
      const countryVal = u.country?.trim().toUpperCase() || 'IN'; 
      
      const match = countries.find(c => 
        c.code.toUpperCase() === countryVal || 
        c.name.toUpperCase() === countryVal
      );
      
      const name = match ? match.name : 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [registeredUsers]);

  const COLORS = ['#1e3a8a', '#064e3b', '#10b981', '#00A3AD', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

  if (isUserLoading || isUsersLoading || isFeedbackLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryItem icon={Users} label="Total Users" value={totalUsers} />
        <SummaryItem icon={MessageSquare} label="Total Feedbacks" value={totalFeedbacks} />
        <SummaryItem icon={Star} label="Avg Rating" value={`${avgRating} ★`} />
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl border-0 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="py-6 px-8 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" /> User Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] p-8">
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryData}
                    innerRadius={0}
                    outerRadius={110}
                    paddingAngle={0}
                    dataKey="value"
                    nameKey="name"
                    stroke="#fff"
                    strokeWidth={2}
                    startAngle={90}
                    endAngle={450}
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const total = countryData.reduce((acc, curr) => acc + curr.value, 0);
                        const percent = ((data.value / total) * 100).toFixed(1);
                        return (
                          <div className="bg-[#1a1c1e] text-white p-3 rounded-lg shadow-2xl text-[10px] border border-white/10 min-w-[140px]">
                            <p className="font-bold mb-1.5 text-xs border-b border-white/10 pb-1">{data.name}</p>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                               <span className="font-medium">{data.value} users ({percent}%)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle" 
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingLeft: '30px' }}
                    formatter={(value) => <span className="text-[12px] font-bold text-slate-500">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Globe className="w-12 h-12 text-slate-100 mb-3" />
                <p className="text-sm font-medium text-slate-400">No demographic data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="py-6 px-8 border-b border-slate-50 bg-slate-50/30">
            <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary" /> Feedback Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[380px] flex items-center justify-center p-8">
            {allFeedback && allFeedback.length > 0 ? (
              <div className="w-full space-y-6">
                {[5, 4, 3, 2, 1].map(r => {
                  const count = allFeedback.filter(f => Number(f.rating) === r).length;
                  const percent = (allFeedback.length > 0) ? (count / allFeedback.length) * 100 : 0;
                  return (
                    <div key={r} className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-600 w-8">{r} ★</span>
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000" 
                          style={{ width: `${percent}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-100 mb-3" />
                <p className="text-sm font-medium text-slate-400">No feedback data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health Section */}
      <div className="space-y-6 pb-12">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 px-2">
          <Terminal className="w-4 h-4 text-primary" /> System Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SystemInfoCard icon={Cloud} label="Platform" value="Firebase Hosting" badge="Live" />
          <SystemInfoCard icon={Database} label="Primary DB" value="Cloud Firestore" badge="Stable" />
          <SystemInfoCard icon={Cpu} label="Runtime" value="Next.js v15.5" />
          <SystemInfoCard icon={Activity} label="Monitoring" value="Firebase Vitals" />
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <Card className="shadow-xl border-0 border-l-[6px] border-l-primary rounded-2xl bg-white transition-all hover:scale-[1.02] active:scale-[0.98] group">
      <CardContent className="p-10 flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-[1.5rem] bg-slate-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-inner">
          <Icon className="w-10 h-10" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-5xl font-black text-[#1e293b] tracking-tighter">{value}</div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SystemInfoCard({ icon: Icon, label, value, badge }: { icon: any, label: string, value: string, badge?: string }) {
  return (
    <Card className="shadow-lg border-0 bg-white hover:shadow-2xl transition-all duration-500 rounded-[1.5rem]">
      <CardContent className="p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <div className="text-sm font-black text-[#1e293b]">{value}</div>
          {badge && <Badge className="h-5 px-3 text-[9px] font-black bg-emerald-500 hover:bg-emerald-600 border-0 rounded-full shadow-lg shadow-emerald-100">{badge}</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
