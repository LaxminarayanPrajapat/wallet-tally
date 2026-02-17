'use client';

import React, { useMemo, useState } from 'react';
import { 
  Trash2, 
  Search, 
  Loader2, 
  AlertTriangle,
  Send,
  Info,
  ShieldAlert,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch, getDocs, updateDoc, increment } from 'firebase/firestore';
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
import { countries } from '@/lib/countries';
import { format } from 'date-fns';
import { sendUserWarningEmail, sendAccountDeletionEmail } from '@/app/actions/email';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState({ search: '', country: 'all', warning: 'all' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [selectedUserForWarning, setSelectedUserForWarning] = useState<any>(null);
  const [warningDetails, setWarningDetails] = useState({ type: '', reason: '' });
  const [isWarningProcessing, setIsWarningProcessing] = useState(false);

  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  const registeredUsers = useMemo(() => users?.filter(u => u.email?.includes('@')) || [], [users]);

  const uniqueCountries = useMemo(() => {
    const codes = [...new Set(registeredUsers.map(u => u.country || 'IN'))];
    return codes.map(code => countries.find(c => c.code === code)).filter(Boolean);
  }, [registeredUsers]);

  const filteredUsers = useMemo(() => {
    return registeredUsers.filter(u => {
      const hasWarning = (u.warningCount || 0) > 0;
      return (
        (u.email?.toLowerCase().includes(appliedFilters.search.toLowerCase()) || u.name?.toLowerCase().includes(appliedFilters.search.toLowerCase())) &&
        (appliedFilters.country === 'all' || u.country === appliedFilters.country) &&
        (appliedFilters.warning === 'all' || (appliedFilters.warning === 'with' && hasWarning) || (appliedFilters.warning === 'without' && !hasWarning))
      );
    });
  }, [registeredUsers, appliedFilters]);

  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleApplyFilters = () => setAppliedFilters(filters);
  const handleResetFilters = () => {
    const initialFilters = { search: '', country: 'all', warning: 'all' };
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const initiateDelete = (user: any) => setUserToDelete(user);
  const initiateWarning = (user: any) => setSelectedUserForWarning(user);

  const handleConfirmDelete = async () => {
    if (!firestore || !userToDelete || !deleteReason.trim()) return;
    setIsDeleteProcessing(true);
    try {
      await sendAccountDeletionEmail(userToDelete.email, userToDelete.name || 'User', deleteReason);
      const batch = writeBatch(firestore);
      const subcollections = ['transactions', 'categories', 'budgets', 'feedback'];
      for (const col of subcollections) {
        const snapshot = await getDocs(collection(firestore, 'users', userToDelete.id, col));
        snapshot.forEach(subDoc => batch.delete(subDoc.ref));
      }
      batch.delete(doc(firestore, 'users', userToDelete.id));
      await batch.commit();
      toast({ title: "Account Terminated", description: `User ${userToDelete.email} has been purged.` });
      setUserToDelete(null); setDeleteReason('');
    } catch (e: any) { toast({ variant: "destructive", title: "Termination Failed", description: e.message }); }
    finally { setIsDeleteProcessing(false); }
  };

  const handleSendWarning = async () => {
    if (!firestore || !selectedUserForWarning || !warningDetails.type || !warningDetails.reason.trim()) return;
    setIsWarningProcessing(true);
    try {
      const result = await sendUserWarningEmail(selectedUserForWarning.email, selectedUserForWarning.name || 'User', warningDetails.type, warningDetails.reason);
      if (!result.success) throw new Error(result.error);
      await updateDoc(doc(firestore, 'users', selectedUserForWarning.id), { 
        warningCount: increment(1), 
        lastWarningReason: warningDetails.type, 
        lastWarningDate: new Date().toISOString() 
      });
      toast({ title: "Warning Issued", description: `Official notice sent to ${selectedUserForWarning.email}.` });
      setSelectedUserForWarning(null); setWarningDetails({ type: '', reason: '' });
    } catch (e: any) { toast({ variant: "destructive", title: "Process Failed", description: e.message }); }
    finally { setIsWarningProcessing(false); }
  };

  if (isAuthLoading || isUsersLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold text-slate-800">User Account Management</CardTitle>
          <p className="text-xs sm:text-sm text-slate-500">Registered: {registeredUsers.length} | Filtered: {filteredUsers.length}</p>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Input placeholder="Search by name or email..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="h-10 rounded-md border-slate-300 lg:col-span-2" />
            <FilterSelect label="Country" value={filters.country} onValueChange={v => handleFilterChange('country', v)} options={[{value: 'all', label: 'All Countries'}, ...uniqueCountries.map(c => ({ value: c!.code, label: c!.name }))]} />
            <FilterSelect label="Warnings" value={filters.warning} onValueChange={v => handleFilterChange('warning', v)} options={[{value: 'all', label: 'All Users'}, {value: 'with', label: 'With Warnings'}, {value: 'without', label: 'Without Warnings'}]} />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button onClick={handleApplyFilters} className="h-9 sm:h-10 bg-primary hover:bg-primary/90 text-white rounded-md px-4 sm:px-6 font-bold flex items-center justify-center gap-2 text-sm">
              <Search className="w-4 h-4" /> Apply
            </Button>
            <Button onClick={handleResetFilters} variant="ghost" className="h-9 sm:h-10 font-bold text-slate-600 rounded-md text-sm">Reset</Button>
          </div>
        </CardContent>
      </Card>

      <div className="md:hidden space-y-4">
        {filteredUsers.length > 0 ? filteredUsers.map((u, i) => <UserCard key={u.id} user={u} index={i} onWarn={initiateWarning} onDelete={initiateDelete} />) : <EmptyState />}
      </div>

      <div className="hidden md:block">
        <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-100">
                {['ID', 'Username', 'Email', 'Country', 'Joined', 'Actions'].map(h => <TableHead key={h} className="font-bold text-slate-600 text-xs">{h}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((u, i) => <UserRow key={u.id} user={u} index={i} onWarn={initiateWarning} onDelete={initiateDelete} />) : <TableRow><TableCell colSpan={6}><EmptyState /></TableCell></TableRow>}
            </TableBody>
          </Table>
        </Card>
      </div>

      <WarningDialog isOpen={!!selectedUserForWarning} onOpenChange={() => setSelectedUserForWarning(null)} user={selectedUserForWarning} details={warningDetails} setDetails={setWarningDetails} onConfirm={handleSendWarning} isProcessing={isWarningProcessing} />
      <DeleteDialog isOpen={!!userToDelete} onOpenChange={() => setUserToDelete(null)} user={userToDelete} reason={deleteReason} setReason={setDeleteReason} onConfirm={handleConfirmDelete} isProcessing={isDeleteProcessing} />
    </div>
  );
}

const UserRow = ({ user, index, onWarn, onDelete }: any) => {
  const country = countries.find(c => c.code === user.country);
  return (
    <TableRow className="hover:bg-slate-50/50 border-slate-100 text-sm">
      <TableCell className="font-semibold text-slate-600 pl-6">{1001 + index}</TableCell>
      <TableCell>
        <div className="font-bold text-slate-800">{user.name || '-'}</div>
        {(user.warningCount || 0) > 0 && <Badge variant="destructive" className="mt-1 text-[9px] h-4 font-black">Warned {user.warningCount}x</Badge>}
      </TableCell>
      <TableCell className="text-slate-500 font-medium">{user.email}</TableCell>
      <TableCell className="text-slate-500 font-medium">{country?.name || 'Unknown'}</TableCell>
      <TableCell className="text-slate-500 font-medium">{format(new Date(user.joinedAt), 'dd MMM yyyy')}</TableCell>
      <TableCell className="text-right pr-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => onWarn(user)} className="font-semibold text-sm"><AlertTriangle className="w-4 h-4 mr-2"/>Issue Warning</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-500 focus:text-red-500 font-semibold text-sm"><Trash2 className="w-4 h-4 mr-2"/>Terminate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const UserCard = ({ user, index, onWarn, onDelete }: any) => {
    const country = countries.find(c => c.code === user.country);
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div className="w-10/12">
                    <div className="font-bold text-slate-800 truncate">{user.name || 'Anonymous'}</div>
                    <div className="text-xs text-slate-500 font-medium truncate">{user.email}</div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => onWarn(user)} className="font-semibold"><AlertTriangle className="w-4 h-4 mr-2"/>Issue Warning</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-500 focus:text-red-500 font-semibold"><Trash2 className="w-4 h-4 mr-2"/>Terminate</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                <InfoItem label="Country" value={country?.name || '-'}/>
                <InfoItem label="Joined" value={format(new Date(user.joinedAt), 'dd MMM yy')}/>
            </div>
            {(user.warningCount || 0) > 0 && <Badge variant="destructive" className="w-fit text-[10px] h-5 font-black">Warned {user.warningCount} times</Badge>}
        </div>
    );
};

const FilterSelect = ({ label, onValueChange, ...props }: any) => (
  <div>
    <label className="text-xs font-semibold text-slate-500 ml-1">{label}</label>
    <Select onValueChange={onValueChange} {...props}>
      <SelectTrigger className="h-10 rounded-md border-slate-300 w-full"><SelectValue /></SelectTrigger>
      <SelectContent className="rounded-lg">{props.options.map((o: any) => <SelectItem key={o.value} value={o.value} className="font-semibold">{o.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

const WarningDialog = ({ isOpen, onOpenChange, user, details, setDetails, onConfirm, isProcessing }: any) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md w-[95vw] rounded-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-bold text-amber-600"><AlertTriangle/>Official Warning</DialogTitle>
        <DialogDescription>Issue a notice to <strong className="truncate">{user?.email}</strong>.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <FilterSelect label="Violation Type" value={details.type} onValueChange={(v: any) => setDetails({ ...details, type: v })} options={['False Feedback', 'ToS Violation', 'Spam', 'Other'].map(v => ({label: v, value: v}))} />
        <Textarea placeholder="Detailed explanation..." value={details.reason} onChange={(e: any) => setDetails({ ...details, reason: e.target.value })} className="min-h-[100px] rounded-md" />
      </div>
      <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
        <Button variant="ghost" onClick={onOpenChange}>Cancel</Button>
        <Button onClick={onConfirm} disabled={!details.type || !details.reason.trim() || isProcessing} className="bg-amber-500 hover:bg-amber-600 text-white font-bold">
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4"/>} <span className="ml-2">Send Notice</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const DeleteDialog = ({ isOpen, onOpenChange, user, reason, setReason, onConfirm, isProcessing }: any) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md w-[95vw] rounded-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-bold text-red-600"><Trash2/>Account Termination</DialogTitle>
        <DialogDescription>Permanently remove <strong className="truncate">{user?.email}</strong> and all associated data.</DialogDescription>
      </DialogHeader>
      <div className="py-2">
        <Textarea placeholder="Reason for termination (sent to user)..." value={reason} onChange={(e: any) => setReason(e.target.value)} className="min-h-[120px] rounded-md" />
      </div>
      <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
        <Button variant="ghost" onClick={onOpenChange}>Cancel</Button>
        <Button onClick={onConfirm} disabled={!reason.trim() || isProcessing} className="bg-red-600 hover:bg-red-700 text-white font-bold">
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4"/>} <span className="ml-2">Confirm Purge</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
    <ShieldAlert className="w-12 h-12 text-slate-300" />
    <div>
      <h3 className="font-bold text-slate-700">No Matching Users</h3>
      <p className="text-sm text-slate-500">Adjust the filters to find users.</p>
    </div>
  </div>
);

const InfoItem = ({label, value}: any) => <div className="space-y-1"><p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{label}</p><p className="font-semibold text-slate-600 truncate">{value}</p></div>;
