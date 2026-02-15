'use client';

import React, { useMemo, useState } from 'react';
import { 
  Search, 
  Loader2, 
  Eye, 
  CheckCircle, 
  XCircle,
  Trash2, 
  MessageSquare,
  Star,
  Info,
  Send,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, collectionGroup, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { sendFeedbackApprovalEmail, sendFeedbackDeletionEmail } from '@/app/actions/email';

/**
 * @fileOverview Review Moderation page for administrators.
 * Manages user feedback, allows approval for landing page testimonials, and deletion of improper entries.
 */
export default function AdminFeedbackPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  
  // UI Filter State
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Deletion Modal State
  const [feedbackToDelete, setFeedbackToDelete] = useState<any>(null);
  const [isDeleteReasonOpen, setIsDeleteReasonOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    rating: 'all',
    status: 'all',
    sort: 'latest',
    search: ''
  });

  // Data Fetching: Users - Guarded
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user, isAuthLoading]);
  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  // Data Fetching: All Feedback (Collection Group) - Guarded
  const feedbackQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || !user) return null;
    return collectionGroup(firestore, 'feedback');
  }, [firestore, user, isAuthLoading]);
  const { data: rawFeedback, isLoading: isFeedbackLoading } = useCollection(feedbackQuery);

  // Safe date conversion helper
  const getSafeDate = (val: any) => {
    if (!val) return null;
    if (val instanceof Timestamp) return val.toDate();
    if (typeof val.toDate === 'function') return val.toDate();
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  // Process and Filter Feedback
  const processedFeedback = useMemo(() => {
    if (!rawFeedback || !users) return [];

    return rawFeedback.map(f => {
      // Robust userId extraction: Check explicitly saved field first, then parse parent segment from doc path
      // Path format: users/{userId}/feedback/current
      const userIdFromPath = f.path?.split('/')[1];
      const targetUserId = (f as any).userId || userIdFromPath;

      const u = users.find(u => u.id === targetUserId);
      const isApproved = !!(f as any).isApproved;

      return {
        ...f,
        userId: targetUserId,
        userName: u?.name || 'Unknown User',
        userEmail: u?.email || 'unknown@example.com',
        isApproved,
        displayStatus: isApproved ? 'Approved' : 'Not Approved'
      };
    }).filter(f => {
      const matchesRating = appliedFilters.rating === 'all' || Number(f.rating) === Number(appliedFilters.rating);
      
      const matchesStatus = appliedFilters.status === 'all' || 
        (appliedFilters.status === 'approved' && f.isApproved) ||
        (appliedFilters.status === 'not-approved' && !f.isApproved);

      const matchesSearch = 
        f.userName.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        f.userEmail.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        f.comment?.toLowerCase().includes(appliedFilters.search.toLowerCase());
      
      return matchesRating && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      const dateA = getSafeDate(a.updatedAt)?.getTime() || 0;
      const dateB = getSafeDate(b.updatedAt)?.getTime() || 0;
      return appliedFilters.sort === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [rawFeedback, users, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      rating: ratingFilter,
      status: statusFilter,
      sort: sortBy,
      search: searchTerm
    });
  };

  const handleToggleApproval = async (feedback: any) => {
    if (!firestore || !feedback.userId) {
      toast({ variant: "destructive", title: "Action Blocked", description: "User identity context missing for this feedback." });
      return;
    }
    const newStatus = !feedback.isApproved;
    try {
      // Hardcoded 'current' document ID as per feedback-card logic
      const feedbackRef = doc(firestore, 'users', feedback.userId, 'feedback', 'current');
      await updateDoc(feedbackRef, { isApproved: newStatus });
      
      if (newStatus) {
        await sendFeedbackApprovalEmail(feedback.userEmail, feedback.userName);
        toast({ 
          title: "Feedback Approved", 
          description: "Appreciation email sent and review featured." 
        });
      } else {
        toast({ 
          title: "Feedback Disapproved", 
          description: "Removed from public showcase." 
        });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Process Error", description: error.message });
    }
  };

  const initiateDelete = (feedback: any) => {
    setFeedbackToDelete(feedback);
    setDeleteReason('');
    setIsDeleteReasonOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!firestore || !feedbackToDelete?.userId || !deleteReason.trim()) return;
    
    setIsActionProcessing(true);
    try {
      const feedbackRef = doc(firestore, 'users', feedbackToDelete.userId, 'feedback', 'current');
      await sendFeedbackDeletionEmail(feedbackToDelete.userEmail, feedbackToDelete.userName, deleteReason);
      await deleteDoc(feedbackRef);
      
      toast({ 
        title: "Feedback Removed", 
        description: `Deleted and notification sent to ${feedbackToDelete.userEmail}` 
      });
      
      setIsDeleteReasonOpen(false);
      setFeedbackToDelete(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsActionProcessing(false);
    }
  };

  const handleShowDetail = (feedback: any) => {
    setSelectedFeedback(feedback);
    setIsDetailOpen(true);
  };

  if (isAuthLoading || isUsersLoading || isFeedbackLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Header Card */}
      <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tight">Review Moderation</h1>
              <p className="text-slate-500 font-medium">
                Manage how feedback is displayed to the public
              </p>
              <p className="text-sm font-bold text-cyan-500 pt-1 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Approved reviews trigger appreciation emails. Deletions require a reason sent to users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Card */}
      <Card className="shadow-sm border border-slate-100 rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Rating</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  {[5, 4, 3, 2, 1].map(r => (
                    <SelectItem key={r} value={r.toString()}>{r} Stars</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="not-approved">Not Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-bold text-slate-600">Search</label>
              <Input 
                placeholder="Username or email..." 
                className="h-11 rounded-lg border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleApplyFilters}
              className="h-11 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-lg px-8 font-bold flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Feedback Table */}
          <div className="rounded-lg border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#f1f5f9]">
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="w-16 font-bold text-[#1e3a8a]">ID</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">User</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Email</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Rating</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Feedback Preview</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Date</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Status</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedFeedback.length > 0 ? (
                  processedFeedback.map((f, index) => {
                    const feedbackDate = getSafeDate(f.updatedAt);
                    return (
                      <TableRow key={f.id + index} className="hover:bg-slate-50 border-b border-slate-50 last:border-0 group">
                        <TableCell className="text-slate-600 font-medium">#{1001 + index}</TableCell>
                        <TableCell className="font-bold text-slate-700">{f.userName}</TableCell>
                        <TableCell className="text-slate-600 text-xs font-medium">{f.userEmail}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={cn("w-3 h-3", s <= Number(f.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-xs text-slate-600 line-clamp-1 italic">"{f.comment}"</p>
                        </TableCell>
                        <TableCell className="text-slate-500 text-[11px] font-bold">
                          {feedbackDate ? format(feedbackDate, 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "text-[9px] font-black uppercase tracking-wider h-5 px-2 border-0",
                            f.isApproved ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
                          )}>
                            {f.displayStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleShowDetail(f)}
                                    className="h-8 w-8 bg-[#23414d] hover:bg-[#23414d]/90 text-white rounded-lg flex items-center justify-center"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Showcase Feedback Detail</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleToggleApproval(f)}
                                    className={cn(
                                      "h-8 w-8 text-white rounded-lg flex items-center justify-center transition-colors",
                                      f.isApproved ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"
                                    )}
                                  >
                                    {f.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{f.isApproved ? "Disapprove Testimonial" : "Approve for Testimonials"}</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => initiateDelete(f)}
                                    className="h-8 w-8 bg-[#dc2626] hover:bg-[#dc2626]/90 text-white rounded-lg flex items-center justify-center"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Improper Feedback</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <MessageSquare className="w-16 h-16 text-slate-100" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-10 bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1e3a8a]">Feedback Showcase</DialogTitle>
            <DialogDescription className="font-bold text-slate-400 pt-1">Detailed user sentiment report</DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm text-primary font-black text-xl">
                  {selectedFeedback.userName[0]}
                </div>
                <div>
                  <p className="font-black text-slate-700">{selectedFeedback.userName}</p>
                  <p className="text-xs font-medium text-slate-400">{selectedFeedback.userEmail}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sentiment Rating</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={cn("w-5 h-5", s <= Number(selectedFeedback.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                  ))}
                  <span className="ml-2 text-sm font-black text-slate-700">{selectedFeedback.rating}.0 / 5.0</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete Message</p>
                <div className="p-6 bg-[#f8fafc] rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                  "{selectedFeedback.comment}"
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                <Info className="h-4 w-4 shrink-0" />
                Submitted on {getSafeDate(selectedFeedback.updatedAt) ? format(getSafeDate(selectedFeedback.updatedAt)!, 'PPP') : 'Unknown Date'}
              </div>

              <Button 
                onClick={() => setIsDetailOpen(false)}
                className="w-full h-12 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold rounded-xl shadow-lg shadow-blue-100 mt-2"
              >
                Close Showcase
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Reason Dialog */}
      <Dialog open={isDeleteReasonOpen} onOpenChange={setIsDeleteReasonOpen}>
        <DialogContent className="max-w-md rounded-[2rem] p-10 bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-red-600 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" /> Remove Feedback
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-400 pt-1">
              A notification will be sent to the user with your explanation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Removal</label>
              <Textarea 
                placeholder="e.g., Inappropriate language, false information, or spam content..."
                className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-red-500 focus:border-red-500 p-4 italic text-sm"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-3">
              <Button 
                onClick={handleConfirmDelete}
                disabled={!deleteReason.trim() || isActionProcessing}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-100 flex items-center justify-center gap-2"
              >
                {isActionProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Confirm Deletion & Notify User
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setIsDeleteReasonOpen(false)}
                className="w-full font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel Action
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}