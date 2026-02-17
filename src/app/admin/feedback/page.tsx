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
  Send,
  AlertTriangle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { sendFeedbackApprovalEmail, sendFeedbackDeletionEmail } from '@/app/actions/email';

export default function AdminFeedbackPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({ rating: 'all', status: 'all', sort: 'latest', search: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [feedbackToDelete, setFeedbackToDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isActionProcessing, setIsActionProcessing] = useState(false);

  const { data: users, isLoading: isUsersLoading } = useCollection(useMemoFirebase(() => collection(firestore, 'users'), [firestore]));
  const { data: rawFeedback, isLoading: isFeedbackLoading } = useCollection(useMemoFirebase(() => collectionGroup(firestore, 'feedback'), [firestore]));

  const getSafeDate = (val: any) => val instanceof Timestamp ? val.toDate() : (val?.toDate ? val.toDate() : (new Date(val) instanceof Date && !isNaN(new Date(val).getTime()) ? new Date(val) : null));

  const processedFeedback = useMemo(() => {
    if (!rawFeedback || !users) return [];
    return rawFeedback.map(f => {
      const userId = (f as any).userId || f.path?.split('/')[1];
      const user = users.find(u => u.id === userId);
      return { ...f, userId, userName: user?.name || '-', userEmail: user?.email || '-', isApproved: !!(f as any).isApproved };
    }).filter(f => 
      (appliedFilters.rating === 'all' || Number(f.rating) === Number(appliedFilters.rating)) &&
      (appliedFilters.status === 'all' || (appliedFilters.status === 'approved' && f.isApproved) || (appliedFilters.status === 'not-approved' && !f.isApproved)) &&
      (f.userName.toLowerCase().includes(appliedFilters.search.toLowerCase()) || f.userEmail.toLowerCase().includes(appliedFilters.search.toLowerCase()) || f.comment?.toLowerCase().includes(appliedFilters.search.toLowerCase()))
    ).sort((a, b) => {
      const dateA = getSafeDate(a.updatedAt)?.getTime() || 0;
      const dateB = getSafeDate(b.updatedAt)?.getTime() || 0;
      return appliedFilters.sort === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [rawFeedback, users, appliedFilters]);

  const handleApplyFilters = () => setAppliedFilters(filters);
  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleResetFilters = () => {
    const initial = { rating: 'all', status: 'all', sort: 'latest', search: '' };
    setFilters(initial); setAppliedFilters(initial);
  };

  const handleToggleApproval = async (fb: any) => {
    if (!firestore || !fb.userId) return toast({ variant: "destructive", title: "Action Blocked", description: "User context missing." });
    const newStatus = !fb.isApproved;
    try {
      await updateDoc(doc(firestore, 'users', fb.userId, 'feedback', 'current'), { isApproved: newStatus });
      if (newStatus) {
        await sendFeedbackApprovalEmail(fb.userEmail, fb.userName);
        toast({ title: "Feedback Approved", description: "Appreciation email sent." });
      } else toast({ title: "Feedback Disapproved", description: "Removed from showcase." });
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const handleConfirmDelete = async () => {
    if (!firestore || !feedbackToDelete?.userId || !deleteReason.trim()) return;
    setIsActionProcessing(true);
    try {
      await sendFeedbackDeletionEmail(feedbackToDelete.userEmail, feedbackToDelete.userName, deleteReason);
      await deleteDoc(doc(firestore, 'users', feedbackToDelete.userId, 'feedback', 'current'));
      toast({ title: "Feedback Removed", description: `Deleted and notification sent to ${feedbackToDelete.userEmail}` });
      setFeedbackToDelete(null); setDeleteReason('');
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setIsActionProcessing(false); }
  };
  
  if (isUsersLoading || isFeedbackLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold text-slate-800">Review Moderation</CardTitle>
          <p className="text-xs sm:text-sm text-slate-500">Total Reviews: {processedFeedback.length}</p>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Input placeholder="Search user or comment..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="h-10 rounded-md border-slate-300 lg:col-span-2"/>
                <FilterSelect label="Rating" value={filters.rating} onValueChange={v => handleFilterChange('rating', v)} options={[{value: 'all', label: 'All Ratings'}, ...[5,4,3,2,1].map(r => ({value: r.toString(), label: `${r} Stars`}))]}/>
                <FilterSelect label="Status" value={filters.status} onValueChange={v => handleFilterChange('status', v)} options={[{value: 'all', label: 'All Status'}, {value: 'approved', label: 'Approved'}, {value: 'not-approved', label: 'Not Approved'}]}/>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button onClick={handleApplyFilters} className="h-9 sm:h-10 bg-primary hover:bg-primary/90 text-white rounded-md px-4 sm:px-6 font-bold flex items-center justify-center gap-2 text-sm"><Filter className="w-4 h-4"/>Apply</Button>
                <Button onClick={handleResetFilters} variant="ghost" className="h-9 sm:h-10 font-bold text-slate-600 rounded-md text-sm">Reset</Button>
            </div>
        </CardContent>
      </Card>

      <div className="md:hidden space-y-4">
          {processedFeedback.length > 0 ? processedFeedback.map(f => <FeedbackCard key={f.id} feedback={f} onApprove={handleToggleApproval} onDelete={setFeedbackToDelete} onView={setSelectedFeedback}/>) : <EmptyState />}
      </div>

      <div className="hidden md:block">
        <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50"><TableRow className="border-slate-100">{[ 'User', 'Rating', 'Comment', 'Date', 'Status', 'Actions'].map(h => <TableHead key={h} className="text-xs font-bold text-slate-600">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{processedFeedback.length > 0 ? processedFeedback.map(f => <FeedbackRow key={f.id} feedback={f} onApprove={handleToggleApproval} onDelete={setFeedbackToDelete} onView={setSelectedFeedback}/>) : <TableRow><TableCell colSpan={6}><EmptyState /></TableCell></TableRow>}</TableBody>
          </Table>
        </Card>
      </div>

      <DetailDialog isOpen={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)} feedback={selectedFeedback} getSafeDate={getSafeDate} />
      <DeleteDialog isOpen={!!feedbackToDelete} onOpenChange={() => setFeedbackToDelete(null)} onConfirm={handleConfirmDelete} reason={deleteReason} setReason={setDeleteReason} isProcessing={isActionProcessing}/>
    </div>
  );
}

const FeedbackRow = ({ feedback, onApprove, onDelete, onView }: any) => {
  const date = feedback.updatedAt ? formatDistanceToNow(getSafeDate(feedback.updatedAt), { addSuffix: true }) : 'N/A';
  return (
    <TableRow className="hover:bg-slate-50/50 border-slate-100 text-sm">
      <TableCell className="pl-6 font-semibold"><div className="text-slate-800">{feedback.userName}</div><div className="text-slate-500 text-xs font-medium">{feedback.userEmail}</div></TableCell>
      <TableCell><div className="flex items-center gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} className={cn("w-4 h-4",s<=feedback.rating?"fill-amber-400 text-amber-400":"text-slate-300")}/>)}</div></TableCell>
      <TableCell className="max-w-xs"><p className="text-slate-600 truncate">{feedback.comment}</p></TableCell>
      <TableCell className="text-slate-500 font-medium text-xs">{date}</TableCell>
      <TableCell><Badge className={cn("font-bold text-[10px]", feedback.isApproved ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600")}>{feedback.isApproved ? 'Approved' : 'Pending'}</Badge></TableCell>
      <TableCell className="text-right pr-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => onView(feedback)} className="font-semibold text-sm"><Eye className="w-4 h-4 mr-2"/>View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onApprove(feedback)} className="font-semibold text-sm">{feedback.isApproved ? <XCircle className="w-4 h-4 mr-2"/> : <CheckCircle className="w-4 h-4 mr-2"/>}{feedback.isApproved ? 'Disapprove' : 'Approve'}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(feedback)} className="text-red-500 focus:text-red-500 font-semibold text-sm"><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const FeedbackCard = ({ feedback, onApprove, onDelete, onView }: any) => {
    const date = feedback.updatedAt ? formatDistanceToNow(getSafeDate(feedback.updatedAt), { addSuffix: true }) : 'N/A';
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div className="w-10/12">
                    <div className="font-bold text-slate-800 truncate">{feedback.userName}</div>
                    <div className="text-xs text-slate-500 font-medium truncate">{feedback.userEmail}</div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => onView(feedback)} className="font-semibold"><Eye className="w-4 h-4 mr-2"/>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onApprove(feedback)} className="font-semibold">{feedback.isApproved ? <XCircle className="w-4 h-4 mr-2"/> : <CheckCircle className="w-4 h-4 mr-2"/>}{feedback.isApproved ? 'Disapprove' : 'Approve'}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(feedback)} className="text-red-500 focus:text-red-500 font-semibold"><Trash2 className="w-4 h-4 mr-2"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="flex items-center gap-1">{[1,2,3,4,5].map(s=><Star key={s} className={cn("w-4 h-4",s<=feedback.rating?"fill-amber-400 text-amber-400":"text-slate-300")}/>)}</div>
            <p className="text-sm text-slate-600 line-clamp-2 italic">"{feedback.comment}"</p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <Badge className={cn("font-bold", feedback.isApproved ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600")}>{feedback.isApproved ? 'Approved' : 'Pending'}</Badge>
                <div className="text-slate-500 font-medium">{date}</div>
            </div>
        </div>
    );
};

const FilterSelect = ({ label, onValueChange, ...props }: any) => (
    <div>
        <label className="text-xs font-semibold text-slate-500 ml-1">{label}</label>
        <Select onValueChange={onValueChange} {...props}><SelectTrigger className="h-10 rounded-md border-slate-300 w-full"><SelectValue /></SelectTrigger><SelectContent className="rounded-lg">{props.options.map((o: any) => <SelectItem key={o.value} value={o.value} className="font-semibold">{o.label}</SelectItem>)}</SelectContent></Select>
    </div>
);

const DetailDialog = ({ isOpen, onOpenChange, feedback, getSafeDate }: any) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}><DialogContent className="max-w-lg w-[95vw] rounded-2xl">
        <DialogHeader><DialogTitle>Feedback Details</DialogTitle></DialogHeader>
        {feedback && <div className="space-y-4 py-2">
            <div className="font-bold text-sm sm:text-base">{feedback.userName} <span className="font-normal text-slate-500">({feedback.userEmail})</span></div>
            <div className="flex items-center gap-1">{[1,2,3,4,5].map(s=><Star key={s} className={cn("w-5 h-5",s<=feedback.rating?"fill-amber-400 text-amber-400":"text-slate-200")}/>)}</div>
            <p className="italic bg-slate-50 p-3 sm:p-4 rounded-md border text-sm sm:text-base">"{feedback.comment}"</p>
            <div className="text-xs text-slate-500">Submitted: {getSafeDate(feedback.updatedAt) ? format(getSafeDate(feedback.updatedAt), 'PPP p') : 'N/A'}</div>
        </div>}
        <DialogFooter><Button onClick={onOpenChange} className="w-full sm:w-auto">Close</Button></DialogFooter>
    </DialogContent></Dialog>
);

const DeleteDialog = ({ isOpen, onOpenChange, onConfirm, reason, setReason, isProcessing }: any) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}><DialogContent className="max-w-md w-[95vw] rounded-2xl">
        <DialogHeader><DialogTitle className="flex items-center gap-2 font-bold text-red-600"><AlertTriangle/>Remove Feedback</DialogTitle><DialogDescription>A notification with your explanation will be sent to the user.</DialogDescription></DialogHeader>
        <div className="py-2"><Textarea placeholder="Reason for removal..." value={reason} onChange={(e: any) => setReason(e.target.value)} className="min-h-[100px] rounded-md" /></div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2"><Button variant="ghost" onClick={onOpenChange}>Cancel</Button><Button onClick={onConfirm} disabled={!reason.trim() || isProcessing} className="bg-red-600 hover:bg-red-700 text-white font-bold">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>} <span className="ml-2">Confirm & Notify</span></Button></DialogFooter>
    </DialogContent></Dialog>
);

const EmptyState = () => <div className="flex flex-col items-center justify-center gap-4 py-12 text-center"><MessageSquare className="w-12 h-12 text-slate-300" /><div><h3 className="font-bold text-slate-700">No Reviews Found</h3><p className="text-sm text-slate-500">Adjust filters to find reviews.</p></div></div>;
