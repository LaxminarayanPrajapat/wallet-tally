'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Clock, MessageSquare, Ban, Scale, Wallet } from 'lucide-react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1e3a8a] to-[#064e3b] py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Icons.Logo className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Terms & Conditions</h1>
          <p className="text-blue-100 font-medium max-w-xl">
            Please read these terms carefully before using Wallet Tally. By using our service, you agree to these rules.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 -mt-10 pb-20">
        <Card className="rounded-[2.5rem] shadow-2xl border-0 overflow-hidden bg-white">
          <CardContent className="p-8 md:p-12 space-y-12">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Scale className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">1. Acceptance of Terms</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Wallet Tally is a personal finance management tool. By accessing or using the platform, you signify that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
              <div className="p-4 bg-blue-50 border-l-4 border-primary rounded-r-xl">
                <p className="text-primary font-bold text-sm">
                  Disclaimer: This application is just to keep and maintain cash transactions only that entered manually by the user. No Online/UPI transactions are maintained or No Bank transactions are Maintains.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <ShieldCheck className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">2. Account Responsibility</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Users can register using an email/OTP or a unique username. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. We reserve the right to terminate accounts that violate our security policies.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Clock className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">3. Transaction Accuracy</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                To promote financial integrity, Wallet Tally implements a <strong>24-hour edit window</strong>. Transactions can be modified or deleted within 24 hours of creation. After this period, records become permanent to ensure a reliable historical audit trail of your manually entered cash flow.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <MessageSquare className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">4. Feedback & Content</h2>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                User feedback is vital to our community. By submitting feedback, you grant Wallet Tally the right to feature approved reviews as testimonials. Our administrative team reserves the right to remove feedback that is found to be false, misleading, or inappropriate.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <Ban className="w-6 h-6" />
                <h2 className="text-2xl font-bold tracking-tight">5. Prohibited Conduct</h2>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-2 font-medium">
                <li>Attempting to bypass security rules or access other users' data.</li>
                <li>Providing false information during registration or feedback submission.</li>
                <li>Spamming system features or automated email services.</li>
                <li>Using the service for illegal financial activities.</li>
              </ul>
            </section>

            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Last Updated: October 2026
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
