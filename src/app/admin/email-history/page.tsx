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
  KeyRound,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
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
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const getSafeDate = (val: any): Date | null => {
    if (val instanceof Timestamp) {
        return val.toDate();
    }
    if (val?.toDate) {
        return val.toDate();
    }
    const d = new Date(val);
    if (d instanceof Date && !isNaN(d.getTime())) {
        return d;
    }
    return null;
};

export default function AdminEmailHistoryPage() {
  const firestore = useFirestore();
  const [filters, setFilters] = useState({ type: 'all', status: 'all', search: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const logsQuery = useMemoFirebase(() => query(collection(firestore, 'email_logs'), orderBy('sentAt', 'desc')), [firestore]);
  const { data: logs, isLoading } = useCollection(logsQuery);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(l => 
      (appliedFilters.type === 'all' || l.type === appliedFilters.type) &&
      (appliedFilters.status === 'all' || l.status === appliedFilters.status) &&
      (l.recipientEmail.toLowerCase().includes(appliedFilters.search.toLowerCase()) || l.recipientName?.toLowerCase().includes(appliedFilters.search.toLowerCase()) || l.subject.toLowerCase().includes(appliedFilters.search.toLowerCase()))
    );
  }, [logs, appliedFilters]);

  const stats = useMemo(() => {
    if (!logs) return {};
    return logs.reduce((acc, log) => ({...acc, [log.type]: (acc[log.type] || 0) + 1}), {} as Record<string, number>);
  }, [logs]);

  const handleFilterChange = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleApplyFilters = () => setAppliedFilters(filters);
  const handleResetFilters = () => {
    const initial = { type: 'all', status: 'all', search: '' };
    setFilters(initial); setAppliedFilters(initial);
  }

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const emailTypes = ['OTP Verification','Password Reset','Appreciation','Warning','Feedback Deletion','Account Deletion'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {emailTypes.map(type => <SummaryCard key={type} type={type} count={stats[type] || 0} /> )}
      </div>

      <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white">
        <CardHeader><CardTitle className="text-base sm:text-lg font-bold text-slate-800">Email Log Filters</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="sm:flex-[2_2_0%] w-full">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Search</label>
                    <Input placeholder="Search email, name, or subject..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="h-10 rounded-md border-slate-300 w-full" />
                </div>
                <div className="sm:flex-1 w-full">
                    <FilterSelect label="Email Type" value={filters.type} onValueChange={(v: string) => handleFilterChange('type', v)} options={[{value: 'all', label: 'All Types'}, ...emailTypes.map(t => ({value: t, label: t}))]} />
                </div>
                <div className="sm:flex-1 w-full">
                    <FilterSelect label="Status" value={filters.status} onValueChange={(v: string) => handleFilterChange('status', v)} options={[{value: 'all', label: 'All Status'}, {value: 'Success', label: 'Success'}, {value: 'Failed', label: 'Failed'}]} />
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={handleApplyFilters} className="h-10 bg-primary hover:bg-primary/90 text-white rounded-md px-4 font-bold flex items-center justify-center gap-2 text-sm w-full sm:w-auto">
                        <Filter className="w-4 h-4"/> Apply
                    </Button>
                    <Button onClick={handleResetFilters} variant="outline" className="h-10 font-bold text-slate-600 rounded-md text-sm w-full sm:w-auto">Reset</Button>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="md:hidden space-y-4">
        {filteredLogs.length > 0 ? filteredLogs.map(log => <LogCard key={log.id} log={log} onView={setSelectedLog} />) : <EmptyState />}
      </div>

      <div className="hidden md:block">
        <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50"><TableRow className="border-slate-100">{[ 'Type', 'Recipient', 'Subject', 'Status', 'Date', 'Actions'].map(h => <TableHead key={h} className="text-xs font-bold text-slate-600">{h}</TableHead>)}</TableRow></TableHeader>
            <TableBody>{filteredLogs.length > 0 ? filteredLogs.map(log => <LogRow key={log.id} log={log} onView={setSelectedLog}/>) : <TableRow><TableCell colSpan={6}><EmptyState /></TableCell></TableRow>}</TableBody>
          </Table>
        </Card>
      </div>

      <DetailDialog isOpen={!!selectedLog} onOpenChange={() => setSelectedLog(null)} log={selectedLog} />
    </div>
  );
}

const SummaryCard = ({ type, count }: { type: string, count: number }) => {
  const { Icon, color } = getEmailTypeVisuals(type);
  return (
    <div className={cn("bg-white rounded-xl p-3 sm:p-4 shadow-lg border-l-4", color)}>
      <div className="flex items-center justify-between"><p className="text-[10px] sm:text-xs font-bold text-slate-500 truncate">{type}</p><Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400"/></div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{count}</p>
    </div>
  );
};

const LogRow = ({ log, onView }: any) => {
  const safeDate = getSafeDate(log.sentAt);
  const date = safeDate ? formatDistanceToNow(safeDate, { addSuffix: true }) : 'N/A';
  return (
    <TableRow className="hover:bg-slate-50/50 border-slate-100 text-sm">
      <TableCell className="pl-6"><EmailTypeBadge type={log.type} /></TableCell>
      <TableCell><div className="font-bold text-slate-800">{log.recipientName || '-'}</div><div className="text-xs text-slate-500 font-medium">{log.recipientEmail}</div></TableCell>
      <TableCell className="max-w-xs"><p className="text-slate-600 truncate">{log.subject}</p></TableCell>
      <TableCell><StatusBadge status={log.status} /></TableCell>
      <TableCell className="text-slate-500 font-medium text-xs">{date}</TableCell>
      <TableCell className="text-right pr-6"><Button variant="outline" size="sm" onClick={() => onView(log)} className="h-8"><Eye className="w-4 h-4 mr-2"/>View</Button></TableCell>
    </TableRow>
  );
};

const LogCard = ({ log, onView }: any) => {
    const safeDate = getSafeDate(log.sentAt);
    const date = safeDate ? formatDistanceToNow(safeDate, { addSuffix: true }) : 'N/A';
    return (
        <div className="bg-white rounded-xl shadow-lg border-l-4 p-4 space-y-3" style={{ borderLeftColor: getEmailTypeVisuals(log.type).plainColor }}>
            <div className="flex justify-between items-start">
                <div className="w-10/12">
                    <div className="font-bold text-slate-800 truncate">{log.recipientName || '-'}</div>
                    <div className="text-xs text-slate-500 font-medium truncate">{log.recipientEmail}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onView(log)} className="h-8 w-8 -mt-1 -mr-1"><Eye className="w-4 h-4 text-slate-500" /></Button>
            </div>
            <div className="font-semibold text-sm text-slate-600 truncate">{log.subject}</div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <EmailTypeBadge type={log.type} />
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

const DetailDialog = ({ isOpen, onOpenChange, log }: any) => {
    const safeDate = log ? getSafeDate(log.sentAt) : null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}><DialogContent className="max-w-lg w-[95vw] rounded-2xl">
            <DialogHeader><DialogTitle className="flex items-center gap-3"><EmailTypeBadge type={log?.type} /><span>Log Details</span></DialogTitle></DialogHeader>
            {log && <div className="space-y-3 py-2 text-sm">
                <p><strong>To:</strong> {log.recipientName} &lt;{log.recipientEmail}&gt;</p>
                <p><strong>Subject:</strong> {log.subject}</p>
                <p><strong>Status:</strong> <StatusBadge status={log.status} /></p>
                <p><strong>Date:</strong> {safeDate ? format(safeDate, 'PPP p') : 'N/A'}</p>
                {log.reason && <div className="pt-2"><strong className="block mb-1">Reason/Error:</strong><p className="italic bg-slate-50 p-3 rounded-md border text-xs">{log.reason}</p></div>}
            </div>}
        </DialogContent></Dialog>
    );
};

const EmptyState = () => <div className="flex flex-col items-center justify-center gap-4 py-12 text-center"><Mail className="w-12 h-12 text-slate-300" /><div><h3 className="font-bold text-slate-700">No Email Logs Found</h3><p className="text-sm text-slate-500">No records match the current filters.</p></div></div>;

const EmailTypeBadge = ({ type }: {type?: string}) => {
    if (!type) return null;
    const { Icon, textColor, bgColor } = getEmailTypeVisuals(type);
    return <Badge className={cn("gap-1.5 items-center font-bold text-[10px]", textColor, bgColor)}><Icon className="w-3 h-3"/>{type}</Badge>
}

const StatusBadge = ({ status }: { status: string}) => (
    <Badge className={cn("font-bold text-[10px]", status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>{status}</Badge>
);

const getEmailTypeVisuals = (type: string) => {
    switch (type) {
        case 'Appreciation': return { Icon: Star, color: 'border-l-green-500', textColor: 'text-green-800', bgColor: 'bg-green-100', plainColor: '#22c55e' };
        case 'Warning': return { Icon: AlertTriangle, color: 'border-l-amber-500', textColor: 'text-amber-800', bgColor: 'bg-amber-100', plainColor: '#f59e0b' };
        case 'Feedback Deletion': return { Icon: MessageSquareOff, color: 'border-l-red-500', textColor: 'text-red-800', bgColor: 'bg-red-100', plainColor: '#ef4444' };
        case 'Account Deletion': return { Icon: UserMinus, color: 'border-l-slate-600', textColor: 'text-slate-800', bgColor: 'bg-slate-200', plainColor: '#475569' };
        case 'OTP Verification': return { Icon: KeyRound, color: 'border-l-blue-500', textColor: 'text-blue-800', bgColor: 'bg-blue-100', plainColor: '#3b82f6' };
        case 'Password Reset': return { Icon: KeyRound, color: 'border-l-purple-500', textColor: 'text-purple-800', bgColor: 'bg-purple-100', plainColor: '#8b5cf6' };
        default: return { Icon: Mail, color: 'border-l-gray-400', textColor: 'text-gray-800', bgColor: 'bg-gray-100', plainColor: '#9ca3af' };
    }
};
