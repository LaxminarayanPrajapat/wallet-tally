'use client';

import React from 'react';
import { Info, Cpu, Cloud, Globe, Hash, Zap, Code2, Layers, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SystemInformationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <Card className="shadow-sm border border-slate-100 rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-inner">
              <Info className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#1e3a8a] tracking-tight">System Information</h1>
              <p className="text-slate-500 font-bold">Wallet Tally Platform Specifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard icon={Cpu} label="Runtime" value="Next.js 15.5" badge="Turbopack" />
        <InfoCard icon={Cloud} label="Platform" value="Firebase Hosting" badge="App Hosting" />
        <InfoCard icon={Hash} label="Build" value="Production" badge="v1.0.4" />
      </div>

      <Card className="rounded-3xl border-0 shadow-xl overflow-hidden bg-white">
        <CardContent className="p-10 space-y-10">
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-4">Technology Stack</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <TechItem icon={Code2} label="Framework" value="React 19 / TypeScript" />
              <TechItem icon={Layers} label="UI Library" value="Shadcn/UI & Radix" />
              <TechItem icon={Globe} label="Styling" value="Tailwind CSS v3.4" />
              <TechItem icon={ShieldCheck} label="Security" value="Firebase Auth / Rules" />
              <TechItem icon={Zap} label="Backend" value="Server Actions (Node.js)" />
              <TechItem icon={Layers} label="Database" value="NoSQL Cloud Firestore" />
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Infrastructure Status</p>
              <p className="text-slate-600 font-bold leading-relaxed">
                All systems are operating within nominal parameters. This prototype is powered by Google Cloud Platform regions.
              </p>
            </div>
            <Badge className="h-8 px-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] border-0 rounded-full shadow-lg shadow-emerald-100">
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
    <Card className="rounded-3xl border-0 shadow-xl overflow-hidden bg-white group hover:shadow-2xl transition-all duration-500">
      <CardContent className="p-8 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-lg font-black text-slate-700 leading-none mb-2">{value}</p>
          <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold border-0 text-[9px] uppercase tracking-tighter">
            {badge}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function TechItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary/40 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
