'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function FeedbackCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const feedbackDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid, 'feedback', 'current');
  }, [firestore, user]);

  const { data: existingFeedback, isLoading: isFeedbackLoading } = useDoc(feedbackDocRef);

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with existing data from Firestore
  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating || 0);
      setFeedback(existingFeedback.comment || '');
    }
  }, [existingFeedback]);

  const handleSubmit = async () => {
    if (!user || !firestore) return;
    
    setIsSubmitting(true);
    try {
      const docRef = doc(firestore, 'users', user.uid, 'feedback', 'current');
      await setDoc(docRef, {
        userId: user.uid,
        rating,
        comment: feedback,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({
        title: "Feedback Saved",
        description: "Your feedback has been updated successfully!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFeedbackLoading) {
    return (
      <Card className="shadow-md h-full flex flex-col items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="py-4">
        <CardTitle className="text-lg font-bold text-[#1e293b]">Rate Your Experience</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center p-6 bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1]">
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors",
                    star <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#e2e8f0]"
                  )}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-[#94a3b8] mt-3 uppercase tracking-wider">Click to rate</span>
        </div>

        <Textarea
          placeholder="Share your feedback with us..."
          className="resize-none h-32 border-[#cbd5e1] focus:ring-primary rounded-xl p-4 text-sm"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <Button
          className="w-full mt-auto bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold h-12 rounded-xl gap-2 shadow-lg border-0"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Send className="h-5 w-5" />
              Submit Feedback
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}