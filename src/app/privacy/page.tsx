'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, Eye, Database, Cpu, Mail, Wallet } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a8a] to-[#064e3b] py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Icons.Logo className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-blue-100 font-medium max-w-xl">
            Your financial privacy is our top priority. Learn how we protect and manage your information.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 -mt-10 pb-20">
        <Card className="rounded-[2.5rem] shadow-2xl border-0 overflow-hidden bg-white">
          <CardContent className="p-8 md:p-12 space-y-12">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Wallet className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">1. Manual Transaction Registry</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                This application is just to keep and maintain cash transactions only that entered manually by the user. No Online/UPI transactions are maintained or No Bank transactions are Maintains.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Database className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">2. Information We Collect</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                To provide our financial tracking services, we collect:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 font-medium pl-4">
                <li><strong>Identity Data</strong>: Your username, email address, and country selection.</li>
                <li><strong>Manual Entry Data</strong>: Daily cash income and expense amounts, categories, and descriptions provided by you.</li>
                <li><strong>System Logs</strong>: Timestamps of account activities and sent automated emails.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Cpu className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">3. How We Use Data</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Your data is processed exclusively to:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 font-medium pl-4">
                <li>Calculate your real-time cash balance and category distributions based on your manual inputs.</li>
                <li>Dispatch verification codes (OTP) and account security alerts.</li>
                <li>Provide downloadable PDF reports of your financial history.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Lock className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">4. Data Security</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                We leverage Google Firebase for all authentication and database services. Your data is protected by industry-standard encryption and Firestore Security Rules that ensure only you (or an authorized administrator for moderation) can access your manually entered financial records.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Mail className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">5. Your Rights</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                You have the right to access your financial data at any time via the dashboard or PDF exports. You can update your profile icon or password in the Settings page. For full account deletion, please contact our support team.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Compliance Status: GDPR Ready
              </div>
              <Button asChild className="bg-gradient-to-r from-[#1e3a8a] to-[#064e3b] hover:opacity-90 text-white rounded-xl px-8 h-12 font-bold shadow-lg border-0 transition-all active:scale-95">
                <Link href="/register">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Registration
                </Link>
              </Button>
            </div>

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
