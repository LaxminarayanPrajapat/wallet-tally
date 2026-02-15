'use client';

import React, { useMemo, useState } from 'react';
import { 
  Trash2, 
  Search, 
  Loader2, 
  Eye,
  AlertTriangle,
  Send,
  Info,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, deleteDoc, updateDoc, increment, getDocs, writeBatch } from 'firebase/firestore';
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
import { useToast } from '@/hooks/use-toast';
import { countries } from '@/lib/countries';
import { format } from 'date-fns';
import { sendUserWarningEmail, sendAccountDeletionEmail } from '@/app/actions/email';
import { cn } from '@/lib/utils';

/**
 * @fileOverview User account management with integrated official warning and termination systems.
 * Implements cascading deletion of user data upon account termination.
 */
export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [warningFilter, setWarningFilter] = useState('all');

  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    country: 'all',
    currency: 'all',
    warning: 'all'
  });

  // Action Modals State
  const [selectedUserForWarning, setSelectedUserForWarning] = useState<any>(null);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [violationType, setViolationType] = useState('');
  const [detailedReason, setDetailedReason] = useState('');
  const [isWarningProcessing, setIsWarningProcessing] = useState(false);

  // Termination Modal State
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleteReasonOpen, setIsDeleteReasonOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);

  // Data Fetching
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || isAuthLoading || !user) return null;
    return collection(firestore, 'users');
  }, [firestore, user, isAuthLoading]);
  const { data: users, isLoading: isUsersLoading } = useCollection(usersQuery);

  const registeredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => u.email && u.email.includes('@'));
  }, [users]);

  const uniqueCountries = useMemo(() => {
    const codes = Array.from(new Set(registeredUsers.map(u => u.country || 'IN')));
    return codes.map(code => countries.find(c => c.code === code)).filter(Boolean);
  }, [registeredUsers]);

  const uniqueCurrencies = useMemo(() => {
    const codes = Array.from(new Set(registeredUsers.map(u => u.country || 'IN')));
    const symbols = Array.from(new Set(codes.map(code => {
      const c = countries.find(item => item.code === code);
      return c?.currency.symbol || '$';
    })));
    return symbols;
  }, [registeredUsers]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchTerm,
      country: countryFilter,
      currency: currencyFilter,
      warning: warningFilter
    });
  };

  const filteredUsers = useMemo(() => {
    return registeredUsers.filter(u => {
      const matchesSearch = 
        u.email?.toLowerCase().includes(appliedFilters.search.toLowerCase()) || 
        u.name?.toLowerCase().includes(appliedFilters.search.toLowerCase());
      
      const matchesCountry = appliedFilters.country === 'all' || u.country === appliedFilters.country;
      
      const userCurrency = countries.find(c => c.code === (u.country || 'IN'))?.currency.symbol || '$';
      const matchesCurrency = appliedFilters.currency === 'all' || userCurrency === appliedFilters.currency;
      
      const userHasWarning = (u.warningCount || 0) > 0;
      const matchesWarning = 
        appliedFilters.warning === 'all' || 
        (appliedFilters.warning === 'with' && userHasWarning) ||
        (appliedFilters.warning === 'without' && !userHasWarning);

      return matchesSearch && matchesCountry && matchesCurrency && matchesWarning;
    });
  }, [registeredUsers, appliedFilters]);

  const initiateDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteReason('');
    setIsDeleteReasonOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!firestore || !userToDelete || !deleteReason.trim()) return;
    
    setIsDeleteProcessing(true);
    try {
      // 1. Dispatch official termination email via Server Action
      await sendAccountDeletionEmail(userToDelete.email, userToDelete.name || 'User', deleteReason);
      
      const userId = userToDelete.id;
      const batch = writeBatch(firestore);

      // 2. Cascading cleanup: Purge all user-related subcollections
      const subcollectionsToPurge = ['transactions', 'categories', 'budgets', 'feedback'];
      
      for (const colName of subcollectionsToPurge) {
        const colRef = collection(firestore, 'users', userId, colName);
        const snapshot = await getDocs(colRef);
        snapshot.forEach((subDoc) => {
          batch.delete(subDoc.ref);
        });
      }

      // 3. Remove the root user profile document
      batch.delete(doc(firestore, 'users', userId));

      // 4. Execute all deletions in a single batch atomic operation
      await batch.commit();
      
      toast({
        title: "Account Terminated",
        description: `Profile and all associated financial records for ${userToDelete.email} have been permanently purged.`,
      });
      
      setIsDeleteReasonOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Termination Failed", description: error.message });
    } finally {
      setIsDeleteProcessing(false);
    }
  };

  const initiateWarning = (user: any) => {
    setSelectedUserForWarning(user);
    setViolationType('');
    setDetailedReason('');
    setIsWarningDialogOpen(true);
  };

  const handleSendWarning = async () => {
    if (!firestore || !selectedUserForWarning || !violationType || !detailedReason.trim()) return;
    
    setIsWarningProcessing(true);
    try {
      const result = await sendUserWarningEmail(
        selectedUserForWarning.email, 
        selectedUserForWarning.name || 'User', 
        violationType,
        detailedReason
      );

      if (result.success) {
        const userRef = doc(firestore, 'users', selectedUserForWarning.id);
        await updateDoc(userRef, {
          warningCount: increment(1),
          lastWarningReason: violationType,
          lastWarningDate: new Date().toISOString()
        });

        toast({ title: "Warning Issued", description: `Official notice sent to ${selectedUserForWarning.email}.` });
        setIsWarningDialogOpen(false);
        setSelectedUserForWarning(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Process Failed", description: error.message });
    } finally {
      setIsWarningProcessing(false);
    }
  };

  if (isAuthLoading || isUsersLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-[#23414d]">User Account Management</h1>
              <p className="text-sm text-slate-500">Registered: {registeredUsers.length} | Showing: {filteredUsers.length}</p>
              <div className="flex items-center gap-2 pt-1 text-[13px] font-medium text-cyan-500">
                <Info className="w-4 h-4" />
                <span>Termination triggers a cascading purge of all user transactions and records.</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-slate-100 rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Country</label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(c => (
                    <SelectItem key={c?.code} value={c?.code || ''}>{c?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Currency</label>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="All Currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  {uniqueCurrencies.map(symbol => (
                    <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Warnings</label>
              <Select value={warningFilter} onValueChange={setWarningFilter}>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="with">With Warnings</SelectItem>
                  <SelectItem value="without">Without Warnings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-sm font-medium text-slate-600">Search</label>
              <Input 
                placeholder="Name or email..." 
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

          <div className="rounded-lg border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#f1f5f9]">
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="w-16 font-bold text-[#1e3a8a]">ID</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Username</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Email</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Country</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Currency</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Joined</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u, index) => {
                    const country = countries.find(c => c.code === u.country);
                    const joinedDate = u.joinedAt ? new Date(u.joinedAt) : new Date();
                    return (
                      <TableRow key={u.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0 group">
                        <TableCell className="text-slate-600 font-medium">{1000 + index}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">{u.name || 'Anonymous'}</span>
                            {(u.warningCount || 0) > 0 && (
                              <Badge className="bg-red-500 text-white text-[9px] h-4 rounded-sm px-1.5 font-black uppercase tracking-tighter">WARNED</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-xs font-medium">{u.email}</TableCell>
                        <TableCell className="text-slate-600 font-medium">{u.country || 'IN'}</TableCell>
                        <TableCell className="text-slate-600 font-medium">
                          {country?.currency.name || 'Unknown'} ({country?.currency.symbol || '$'})
                        </TableCell>
                        <TableCell className="text-slate-500 text-[11px] font-bold">
                          {format(joinedDate, 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 bg-[#23414d] hover:bg-[#23414d]/90 text-white rounded-lg flex items-center justify-center shadow-sm"
                              title="View Information"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => initiateWarning(u)}
                              className="h-8 w-8 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-white rounded-lg flex items-center justify-center shadow-sm"
                              title={`Issue Warning (${u.warningCount || 0})`}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => initiateDelete(u)}
                              className="h-8 w-8 bg-[#dc2626] hover:bg-[#dc2626]/90 text-white rounded-lg flex items-center justify-center shadow-sm"
                              title="Terminate Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <ShieldAlert className="w-16 h-16 text-slate-100" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#f59e0b] flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" /> Official Warning
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-400 pt-1">
              Issue an official notice to <strong>{selectedUserForWarning?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Violation Type</label>
              <Select value={violationType} onValueChange={setViolationType}>
                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-[#f8fafc]">
                  <SelectValue placeholder="Select violation type..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-xl">
                  <SelectItem value="False or Misleading Feedback">False or Misleading Feedback</SelectItem>
                  <SelectItem value="Terms of Service Violation">Terms of Service Violation</SelectItem>
                  <SelectItem value="Inappropriate Behavior">Inappropriate Behavior</SelectItem>
                  <SelectItem value="Spam or Excessive Activity">Spam or Excessive Activity</SelectItem>
                  <SelectItem value="Security Policy Violation">Security Policy Violation</SelectItem>
                  <SelectItem value="Other Violation">Other Violation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Explanation (Required)</label>
              <Textarea 
                placeholder="Provide specific details about the violation..."
                className="min-h-[100px] rounded-2xl border-slate-200 p-4 text-sm bg-[#f8fafc]"
                value={detailedReason}
                onChange={(e) => setDetailedReason(e.target.value)}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-3">
              <Button 
                onClick={handleSendWarning}
                disabled={!violationType || !detailedReason.trim() || isWarningProcessing}
                className="w-full h-14 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 border-0"
              >
                {isWarningProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Send Warning
              </Button>
              <Button variant="ghost" onClick={() => setIsWarningDialogOpen(false)} className="w-full font-bold text-slate-400">Cancel</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Reason Dialog */}
      <Dialog open={isDeleteReasonOpen} onOpenChange={setIsDeleteReasonOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-red-600 flex items-center gap-3">
              <Trash2 className="w-6 h-6" /> Account Termination
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-400 pt-1">
              Terminate account for <strong>{userToDelete?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Termination</label>
              <Textarea 
                placeholder="Explain the reason for this account deletion..."
                className="min-h-[120px] rounded-2xl border-slate-200 p-4 italic text-sm"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-3">
              <Button 
                onClick={handleConfirmDelete}
                disabled={!deleteReason.trim() || isDeleteProcessing}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                {isDeleteProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Terminate & Notify User
              </Button>
              <Button variant="ghost" onClick={() => setIsDeleteReasonOpen(false)} className="w-full font-bold text-slate-400">Abort Action</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
