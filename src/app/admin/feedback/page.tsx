'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Star, 
  Search, 
  Loader2, 
  MessageSquare, 
  User, 
  Calendar, 
  Trash2, 
  Smile, 
  Meh, 
  Frown, 
  ChevronDown, 
  Filter 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { deleteFeedback } from '@/app/actions/feedback';
import Swal from 'sweetalert2';
import { format, formatDistanceToNow } from 'date-fns';

const getSafeDate = (val: any): Date | null => {
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  if(val?.toDate) {
      return val.toDate();
  }
  const d = new Date(val);
  if (d instanceof Date && !isNaN(d.getTime())) {
    return d;
  }
  return null;
};

export default function AdminFeedbackPage() {
  const firestore = useFirestore();
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');

  const feedbackQuery = useMemoFirebase(() => 
    query(collectionGroup(firestore, 'feedback'), orderBy('submittedAt', 'desc')), 
    [firestore]
  );
  const { data: allFeedback, isLoading, mutate } = useCollection(feedbackQuery);

  const filteredFeedback = useMemo(() => {
    if (!allFeedback) return [];
    return allFeedback.filter(f => 
      (ratingFilter === 'all' || f.rating === ratingFilter) &&
      (f.user.displayName.toLowerCase().includes(search.toLowerCase()) || 
       f.user.email.toLowerCase().includes(search.toLowerCase()) ||
       f.text.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allFeedback, search, ratingFilter]);

  const handleDelete = useCallback(async (userId: string, feedbackId: string) => {
    Swal.fire({
      title: 'Delete Feedback?',
      text: "This will permanently remove the feedback entry. This is irreversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteFeedback(userId, feedbackId);
          mutate(); // Re-fetch data
          Swal.fire('Deleted!', 'The feedback has been removed.', 'success');
        } catch (error: any) {
          Swal.fire('Error!', error.message, 'error');
        }
      }
    });
  }, [mutate]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={MessageSquare} label="Total Feedbacks" value={allFeedback?.length || 0} />
        <SummaryCard icon={Smile} label="Positive (4-5)" value={allFeedback?.filter(f => f.rating >= 4).length || 0} />
        <SummaryCard icon={Meh} label="Neutral (3)" value={allFeedback?.filter(f => f.rating === 3).length || 0} />
        <SummaryCard icon={Frown} label="Negative (1-2)" value={allFeedback?.filter(f => f.rating <= 2).length || 0} />
      </div>

      <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Feedback Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name, email, or message..."
                className="pl-10 h-10 rounded-lg border-slate-300 w-full"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <RatingFilterDropdown value={ratingFilter} onValueChange={setRatingFilter} />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="border-slate-100">
                  {['User', 'Rating', 'Feedback', 'Date', 'Actions'].map(h => <TableHead key={h} className="text-xs font-bold text-slate-600">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length > 0 ? (
                  filteredFeedback.map((f) => <FeedbackRow key={f.id} feedback={f} onDelete={handleDelete} />)
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><MessageSquare className="mx-auto w-12 h-12 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-500">No Feedback Found</p></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const SummaryCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: number }) => (
  <Card className="shadow-md border-slate-200/60 rounded-xl bg-white transition-all hover:shadow-lg hover:-translate-y-1">
    <CardContent className="p-4 flex items-center gap-4">
      <div className="p-3 rounded-full bg-slate-100 text-primary"><Icon className="w-6 h-6" /></div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const RatingFilterDropdown = ({ value, onValueChange }: { value: number | 'all', onValueChange: (val: any) => void}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="h-10 rounded-lg border-slate-300 w-full sm:w-auto min-w-[150px] justify-between">
        <span className="flex items-center"><Filter className="w-4 h-4 mr-2"/> {value === 'all' ? 'All Ratings' : `${value} Stars`}</span><ChevronDown className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-full sm:w-[150px] rounded-lg">
      <DropdownMenuItem onSelect={() => onValueChange('all')}>All Ratings</DropdownMenuItem>
      {[5, 4, 3, 2, 1].map(r => <DropdownMenuItem key={r} onSelect={() => onValueChange(r)}>{r} Stars</DropdownMenuItem>)}
    </DropdownMenuContent>
  </DropdownMenu>
);

const FeedbackRow = ({ feedback, onDelete }: { feedback: any, onDelete: (userId: string, feedbackId: string) => void }) => {
  const safeDate = getSafeDate(feedback.submittedAt);
  const date = safeDate ? formatDistanceToNow(safeDate, { addSuffix: true }) : 'N/A';

  return (
    <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
      <TableCell className="font-medium max-w-xs">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-primary">
                {feedback.user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
                <p className="font-bold text-slate-800 truncate">{feedback.user.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{feedback.user.email}</p>
            </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-sm font-bold bg-amber-100 text-amber-800">
          <Star className="w-3 h-3 mr-1" />{feedback.rating}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-600 max-w-md"><p className="truncate">{feedback.text}</p></TableCell>
      <TableCell className="text-xs text-slate-500 font-medium"><p>{date}</p></TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={() => onDelete(feedback.user.uid, feedback.id)}>
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
};