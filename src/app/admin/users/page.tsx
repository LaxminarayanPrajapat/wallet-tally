'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Trash2, UserPlus, Eye, ShieldCheck, ShieldOff, Loader2, ChevronDown, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { deleteUser, toggleAdmin } from '@/app/actions/users';
import Swal from 'sweetalert2';
import { countries } from '@/lib/countries';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const usersQuery = useMemoFirebase(() => 
    query(collection(firestore, 'users'), orderBy('displayName')),
    [firestore]
  );
  const { data: users, isLoading, mutate } = useCollection(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      (roleFilter === 'all' || (roleFilter === 'admin' ? u.isAdmin : !u.isAdmin)) &&
      (u.displayName.toLowerCase().includes(search.toLowerCase()) || 
       u.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [users, search, roleFilter]);

  const getCountryName = (code: string) => {
      const country = countries.find(c => c.code.toUpperCase() === code?.toUpperCase());
      return country ? country.name : code;
  };

  const handleDelete = useCallback(async (uid: string) => {
    Swal.fire({
        title: 'Delete User?',
        text: "This will permanently remove the user and all their data. This is irreversible.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteUser(uid);
            mutate();
            Swal.fire('Deleted!', 'The user has been removed.', 'success');
          } catch (error: any) {
            Swal.fire('Error!', error.message, 'error');
          }
        }
      });
  }, [mutate]);

  const handleToggleAdmin = useCallback(async (uid: string, isAdmin: boolean) => {
    const actionText = isAdmin ? 'remove admin privileges from' : 'grant admin privileges to';
    Swal.fire({
        title: `Confirm Action`,
        text: `Are you sure you want to ${actionText} this user?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await toggleAdmin(uid, !isAdmin);
            mutate();
            Swal.fire('Success!', `User admin status updated.`,'success');
          } catch (error: any) {
            Swal.fire('Error!', error.message, 'error');
          }
        }
      });
  }, [mutate]);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User Management</h1>
                <p className="text-sm text-slate-500 mt-1">Total Users: {users?.length || 0}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg font-bold"><UserPlus className="w-4 h-4 mr-2"/>Add New User</Button>
        </div>

        <Card className="shadow-lg border-slate-200/80 rounded-2xl bg-white">
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input placeholder="Search by name or email..." className="pl-10 h-10 rounded-lg border-slate-300 w-full" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <RoleFilterDropdown value={roleFilter} onValueChange={setRoleFilter} />
                </div>
            </CardContent>
        </Card>

        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50"><TableRow className="border-slate-100">{[ 'User', 'Email', 'Role', 'Country', 'Actions'].map(h => <TableHead key={h} className="text-xs font-bold text-slate-600">{h}</TableHead>)}</TableRow></TableHeader>
                <TableBody>{filteredUsers.map(user => <UserRow key={user.uid} user={user} onSelect={setSelectedUser} getCountryName={getCountryName} onDelete={handleDelete} onToggleAdmin={handleToggleAdmin}/>)}</TableBody>
            </Table>
        </div>

        {selectedUser && <UserDetailModal user={selectedUser} onOpenChange={() => setSelectedUser(null)} getCountryName={getCountryName} />} 
    </div>
  );
}

const RoleFilterDropdown = ({ value, onValueChange }: { value: string, onValueChange: (val: string) => void }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 rounded-lg border-slate-300 w-full sm:w-auto min-w-[150px] justify-between">
            <span className="flex items-center"><Filter className="w-4 h-4 mr-2"/> {value === 'all' ? 'All Roles' : value.charAt(0).toUpperCase() + value.slice(1)}</span><ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full sm:w-[150px] rounded-lg">
        <DropdownMenuItem onSelect={() => onValueChange('all')}>All Roles</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onValueChange('user')}>User</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onValueChange('admin')}>Admin</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

const UserRow = ({ user, onSelect, getCountryName, onDelete, onToggleAdmin }: any) => (
    <TableRow className="hover:bg-slate-50/50 border-b-slate-100">
        <TableCell className="font-medium max-w-xs">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-primary">{user.displayName.charAt(0).toUpperCase()}</div>
                <div><p className="font-bold text-slate-800 truncate">{user.displayName}</p></div>
            </div>
        </TableCell>
        <TableCell className="text-slate-600">{user.email}</TableCell>
        <TableCell><RoleBadge isAdmin={user.isAdmin} /></TableCell>
        <TableCell className="text-slate-600 font-medium">{getCountryName(user.country)}</TableCell>
        <TableCell className="text-right space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onSelect(user)}><Eye className="w-4 h-4 text-slate-500" /></Button>
            <Button variant="ghost" size="icon" onClick={() => onToggleAdmin(user.uid, user.isAdmin)}>{user.isAdmin ? <ShieldOff className="w-4 h-4 text-orange-500"/> : <ShieldCheck className="w-4 h-4 text-green-500"/>}</Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(user.uid)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </TableCell>
    </TableRow>
);

const RoleBadge = ({ isAdmin }: { isAdmin: boolean }) => (
    <Badge variant={isAdmin ? 'default' : 'secondary'} className={isAdmin ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 text-slate-600 border-slate-200'}>{isAdmin ? 'Admin' : 'User'}</Badge>
);

const UserDetailModal = ({ user, onOpenChange, getCountryName }: any) => (
    <Dialog open={!!user} onOpenChange={onOpenChange}><DialogContent className="max-w-md w-[95vw] rounded-2xl">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-primary">{user.displayName.charAt(0).toUpperCase()}</div><div><p className="text-2xl font-bold text-slate-800">{user.displayName}</p><p className="text-sm font-normal text-slate-500">{user.email}</p></div></DialogTitle>
        </DialogHeader>
        <div className="py-4 text-sm">
            <p><strong>UID:</strong> <span className="font-mono text-xs bg-slate-100 p-1 rounded">{user.uid}</span></p>
            <p><strong>Role:</strong> <RoleBadge isAdmin={user.isAdmin} /></p>
            <p><strong>Country:</strong> {getCountryName(user.country)}</p>
        </div>
    </DialogContent></Dialog>
);
