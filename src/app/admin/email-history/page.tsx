
'use client';

import React, { useMemo, useState } from 'react';
import { 
  Search, 
  Loader2, 
  Eye, 
  Mail, 
  Star, 
  AlertTriangle, 
  MessageSquareOff, 
  UserMinus,
  Calendar,
  CheckCircle2,
  XCircle,
  Hash,
  User,
  Type,
  KeyRound
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Email History module for administrators.
 * Tracks all system-generated emails sent to users with high-fidelity summaries.
 */
export default function AdminEmailHistoryPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });

  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const logsQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user) return null;
    return query(collection(firestore, 'email_logs'), orderBy('sentAt', 'desc'));
  }, [firestore, user, isUserLoading]);
  const { data: logs, isLoading } = useCollection(logsQuery);

  // Safe date conversion helper
  const getSafeDate = (val: any) => {
    if (!val) return null;
    if (val instanceof Timestamp) return val.toDate();
    if (typeof val.toDate === 'function') return val.toDate();
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(l => {
      const matchesType = appliedFilters.type === 'all' || l.type === appliedFilters.type;
      const matchesStatus = appliedFilters.status === 'all' || l.status === appliedFilters.status;
      const matchesSearch = 
        l.recipientEmail.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        l.recipientName?.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        l.subject.toLowerCase().includes(appliedFilters.search.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [logs, appliedFilters]);

  const stats = useMemo(() => {
    if (!logs) return { appreciation: 0, warning: 0, feedbackDeletion: 0, accountDeletion: 0, otp: 0, reset: 0 };
    return {
      appreciation: logs.filter(l => l.type === 'Appreciation').length,
      warning: logs.filter(l => l.type === 'Warning').length,
      feedbackDeletion: logs.filter(l => l.type === 'Feedback Deletion').length,
      accountDeletion: logs.filter(l => l.type === 'Account Deletion').length,
      otp: logs.filter(l => l.type === 'OTP Verification').length,
      reset: logs.filter(l => l.type === 'Password Reset').length,
    };
  }, [logs]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      type: typeFilter,
      status: statusFilter,
      search: searchTerm
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Appreciation': return Star;
      case 'Warning': return AlertTriangle;
      case 'Feedback Deletion': return MessageSquareOff;
      case 'Account Deletion': return UserMinus;
      case 'OTP Verification': return KeyRound;
      case 'Password Reset': return KeyRound;
      default: return Mail;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Appreciation': return 'bg-emerald-500';
      case 'Warning': return 'bg-amber-500';
      case 'Feedback Deletion': return 'bg-rose-500';
      case 'Account Deletion': return 'bg-slate-700';
      case 'OTP Verification': return 'bg-blue-600';
      case 'Password Reset': return 'bg-purple-600';
      default: return 'bg-blue-500';
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tight">Email History</h1>
              <p className="text-slate-500 font-bold">
                Total Logs: {logs?.length || 0} communications | Viewing: {filteredLogs.length}
              </p>
              <p className="text-sm font-bold text-cyan-500 pt-1">
                Comprehensive audit trail including registration OTPs, password resets, and administrative actions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard icon={Star} count={stats.appreciation} label="Appreciation" color="emerald" />
        <SummaryCard icon={AlertTriangle} count={stats.warning} label="Warning" color="amber" />
        <SummaryCard icon={MessageSquareOff} count={stats.feedbackDeletion} label="Deletion" color="rose" />
        <SummaryCard icon={UserMinus} count={stats.accountDeletion} label="Termination" color="slate" />
        <SummaryCard icon={KeyRound} count={stats.otp} label="OTP Sent" color="blue" />
        <SummaryCard icon={KeyRound} count={stats.reset} label="Pwd Reset" color="purple" />
      </div>

      <Card className="shadow-sm border border-slate-100 rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Email Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-11 rounded-lg border-slate-200">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="OTP Verification">OTP Verification</SelectItem>
                  <SelectItem value="Password Reset">Password Reset</SelectItem>
                  <SelectItem value="Appreciation">Appreciation</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Feedback Deletion">Feedback Deletion</SelectItem>
                  <SelectItem value="Account Deletion">Account Deletion</SelectItem>
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
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600">Search</label>
              <Input 
                placeholder="Email, name, or subject..." 
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
                  <TableHead className="font-bold text-[#1e3a8a]">Type</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Recipient</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Subject</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Status</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a]">Date</TableHead>
                  <TableHead className="font-bold text-[#1e3a8a] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const Icon = getTypeIcon(log.type);
                    const logDate = getSafeDate(log.sentAt);
                    // Calculate sequence ID based on global index in 'logs' to keep latest at top with highest ID
                    const globalIndex = logs?.indexOf(log) ?? 0;
                    const displayId = 1000 + (logs?.length || 0) - globalIndex;
                    
                    return (
                      <TableRow key={log.id} className="hover:bg-slate-50 border-b border-slate-50 last:border-0 group">
                        <TableCell className="text-slate-600 font-medium">#{displayId}</TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1.5 h-6 px-2.5 text-[10px] font-black border-0 uppercase tracking-wider", getTypeColor(log.type))}>
                            <Icon className="w-3 h-3" />
                            {log.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-black text-slate-700 leading-none">{log.recipientName || 'Anonymous'}</p>
                            <p className="text-[10px] font-medium text-slate-400">{log.recipientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-xs text-slate-600 font-medium truncate">
                            {log.subject}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "h-5 px-2 text-[9px] font-black uppercase tracking-widest border-0",
                            log.status === 'Success' ? "bg-emerald-500" : "bg-rose-500"
                          )}>
                            {log.status === 'Success' ? <CheckCircle2 className="w-2 h-2 mr-1" /> : <XCircle className="w-2 h-2 mr-1" />}
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-[10px] font-black text-slate-400">
                            <p className="text-slate-600">{logDate ? format(logDate, 'MMM dd, yyyy') : 'N/A'}</p>
                            <p className="opacity-70">{logDate ? format(logDate, 'HH:mm:ss') : ''}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => { setSelectedLog(log); setIsDetailOpen(true); }}
                              className="h-8 w-8 bg-[#23414d] hover:bg-[#23414d]/90 text-white rounded-lg flex items-center justify-center shadow-sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Mail className="w-16 h-16 text-slate-100" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No email logs found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] p-10 bg-white border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1e3a8a] flex items-center gap-3">
              <Mail className="w-6 h-6 text-[#1e3a8a]" /> Email Log Detail
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-400">Audit trail for communication #{selectedLog?.id?.slice(-4)}</DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-4">
                <DetailItem icon={User} label="Recipient" value={`${selectedLog.recipientName} <${selectedLog.recipientEmail}>`} />
                <DetailItem icon={Type} label="Email Type" badge={selectedLog.type} badgeColor={getTypeColor(selectedLog.type)} />
                <DetailItem icon={Hash} label="Subject" value={selectedLog.subject} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <Badge className={cn("font-bold text-[10px]", selectedLog.status === 'Success' ? "bg-emerald-500" : "bg-rose-500")}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sender</p>
                    <p className="text-sm font-bold text-slate-700">{selectedLog.admin || 'System'}</p>
                  </div>
                </div>

                {selectedLog.reason && (
                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Reason / Error</p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-600 italic leading-relaxed">
                      "{selectedLog.reason}"
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                <Calendar className="h-4 w-4 shrink-0" />
                Dispatched on {getSafeDate(selectedLog.sentAt) ? format(getSafeDate(selectedLog.sentAt)!, 'PPP p') : 'Unknown Date'}
              </div>

              <Button 
                onClick={() => setIsDetailOpen(false)}
                className="w-full h-12 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-bold rounded-xl shadow-lg mt-2"
              >
                Close View
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, badge, badgeColor }: { icon: any, label: string, value?: string, badge?: string, badgeColor?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-3 h-3 text-slate-400" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      {badge ? (
        <Badge className={cn("font-bold text-[10px]", badgeColor)}>{badge}</Badge>
      ) : (
        <p className="text-sm font-bold text-slate-700 leading-tight">{value}</p>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, count, label, color }: { icon: any, count: number, label: string, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 border-l-emerald-500',
    amber: 'text-amber-600 border-l-amber-500',
    rose: 'text-rose-600 border-l-rose-500',
    slate: 'text-slate-600 border-l-slate-700',
    blue: 'text-blue-600 border-l-blue-600',
    purple: 'text-purple-600 border-l-purple-600'
  };

  return (
    <Card className={cn("shadow-sm border-0 border-l-[4px] rounded-xl bg-white", colorMap[color])}>
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <Icon className="w-6 h-6 opacity-80 mb-2" strokeWidth={2.5} />
        <div>
          <div className="text-2xl font-black text-[#1e293b] tracking-tighter">{count}</div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
