'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, collectionGroup, query } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquareQuote, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Dynamic Testimonials component for the Landing Page.
 * Fetches feedback via collection group and filters approved ones in memory to avoid complex index requirements.
 */
export function Testimonials() {
  const firestore = useFirestore();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Fetch all feedback (Filtering isApproved in memory to avoid missing index errors)
  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, 'feedback');
  }, [firestore]);
  const { data: allFeedback, isLoading: isFeedbackLoading } = useCollection(feedbackQuery);

  // Fetch all users to map avatars and names
  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  // Map feedback to user data and filter for approved ones
  const testimonials = useMemo(() => {
    if (!allFeedback || !users) return [];
    
    return allFeedback
      .filter(f => !!f.isApproved) // Filter in memory
      .map(f => {
        const userIdFromPath = f.path?.split('/')[1];
        const targetUserId = f.userId || userIdFromPath;
        const user = users.find(u => u.id === targetUserId);

        return {
          id: f.id,
          name: user?.name || 'Happy User',
          avatar: user?.photoURL || `https://api.dicebear.com/9.x/lorelei/svg?seed=${f.id}`,
          rating: Number(f.rating) || 5,
          comment: f.comment || '',
        };
      });
  }, [allFeedback, users]);

  // Handle pagination/rotation
  const paginatedTestimonials = useMemo(() => {
    if (testimonials.length <= itemsPerPage) return testimonials;
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return testimonials.slice(start, end);
  }, [testimonials, currentPage]);

  useEffect(() => {
    if (testimonials.length <= itemsPerPage) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => {
        const totalPages = Math.ceil(testimonials.length / itemsPerPage);
        return (prev + 1) % totalPages;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (isFeedbackLoading || isUsersLoading) {
    return (
      <section id="testimonials" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center sm:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-8">
            What Our Users Say?
          </h2>
          <p className="text-center text-muted-foreground font-medium italic">
            "We're waiting for our first batch of approved reviews. Be the first to share your journey!"
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-20 sm:py-32 overflow-hidden bg-slate-50/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black sm:text-5xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            What Our Users Say?
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-primary to-accent rounded-full" />
          <p className="max-w-2xl text-muted-foreground font-medium">
            Real stories from people who have transformed their relationship with money using Wallet Tally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ease-in-out">
          {paginatedTestimonials.map((t, idx) => (
            <Card 
              key={t.id + idx} 
              className="border-0 shadow-xl rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500 bg-white"
            >
              <CardContent className="p-8 space-y-6 relative">
                <div className="absolute top-6 right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MessageSquareQuote className="w-16 h-16 text-primary" />
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary/10 bg-slate-50">
                      <Avatar className="w-full h-full rounded-none">
                        <AvatarImage src={t.avatar} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {t.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 border-2 border-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1e293b] leading-tight">{t.name}</h4>
                  </div>
                </div>

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={cn(
                        "w-4 h-4",
                        star <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"
                      )} 
                    />
                  ))}
                </div>

                <blockquote className="text-slate-600 italic leading-relaxed text-sm">
                  "{t.comment}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        {testimonials.length > itemsPerPage && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(testimonials.length / itemsPerPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  currentPage === i ? "w-8 bg-primary" : "w-2 bg-slate-200 hover:bg-slate-300"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
