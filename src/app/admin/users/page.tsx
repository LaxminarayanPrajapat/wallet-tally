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
import { deleteUserAndBlockEmail, toggleAdmin } from '@/app/actions/users'; // Updated import
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

  // Updated handleDelete to accept email and use the new action
  const handleDeleteAndBlock = useCallback(async (uid: string, email: string) => {
    Swal.fire({
        title: 'Block and Delete User?',
        text: `This will permanently block the email '${email}' and delete the user. This is irreversible.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, block and delete!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteUserAndBlockEmail(uid, email);
            mutate(); // Refresh the user list
            Swal.fire('Blocked!', `The user has been deleted and the email '${email}' is now blocked.`, 'success');
          } catch (error: any) {
            Swal.fire('Error!', error.message, 'error');
          }
        }
      });
  }, [mutate]);

  const handleToggleAdmin = useCallback(async (uid: string, isAdmin: boolean) => {
    // ... (existing toggle admin logic)
  }, [mutate]);

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* ... (header JSX) */}

        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-slate-50"><TableRow className="border-slate-100">{[ 'User', 'Email', 'Role', 'Country', 'Actions'].map(h => <TableHead key={h} className="text-xs font-bold text-slate-600">{h}</TableHead>)}</TableRow></TableHeader>
                {/* Updated the onDelete prop to pass the new function */}
                <TableBody>{filteredUsers.map(user => <UserRow key={user.uid} user={user} onSelect={setSelectedUser} getCountryName={getCountryName} onDelete={handleDeleteAndBlock} onToggleAdmin={handleToggleAdmin}/>)}</TableBody>
            </Table>
        </div>

        {selectedUser && <UserDetailModal user={selectedUser} onOpenChange={() => setSelectedUser(null)} getCountryName={getCountryName} />} 
    </div>
  );
}

// ... (RoleFilterDropdown component)

// Updated UserRow to pass both uid and email to onDelete
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
            <Button variant="ghost" size="icon" onClick={() => onDelete(user.uid, user.email)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
        </TableCell>
    </TableRow>
);

// ... (RoleBadge and UserDetailModal components)
