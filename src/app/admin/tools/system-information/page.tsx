'use client';

import React from 'react';
import { Cpu, Cloud, Hash, Zap, Code2, Layers, ShieldCheck, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SystemInformationPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Information</h1>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard icon={Cpu} label="Runtime" value="Next.js 15.5" badge="Turbopack" />
        <InfoCard icon={Cloud} label="Platform" value="Firebase Hosting" badge="App Hosting" />
        <InfoCard icon={Hash} label="Build" value="Production" badge="v1.0.4" />
      </div>

      <Card className="rounded-xl border-2 border-slate-100 shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <TechItem icon={Code2} label="Framework" value="React 19 / TypeScript" />
              <TechItem icon={Layers} label="UI Library" value="Shadcn/UI & Radix" />
              <TechItem icon={Globe} label="Styling" value="Tailwind CSS v3.4" />
              <TechItem icon={ShieldCheck} label="Security" value="Firebase Auth / Rules" />
              <TechItem icon={Zap} label="Backend" value="Server Actions (Node.js)" />
              <TechItem icon={Layers} label="Database" value="NoSQL Cloud Firestore" />
            </div>

          <div className="p-5 bg-slate-100/80 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Infrastructure Status</p>
              <p className="text-sm text-slate-700 font-semibold">
                All systems are operating within nominal parameters. Powered by Google Cloud.
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs">
              Operational
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, badge }: { icon: any, label: string, value: string, badge: string }) {
  return (
    <Card className="rounded-xl border-2 border-slate-100 shadow-sm bg-white">
      <CardContent className="p-6 flex items-center gap-6">
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <div className='text-left'>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          <Badge variant="secondary" className="bg-slate-200 text-slate-600 font-bold border-none text-[10px] uppercase mt-1">
            {badge}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function TechItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4 p-3 bg-slate-100/70 rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 shrink-0 shadow-sm border border-slate-200/80">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
