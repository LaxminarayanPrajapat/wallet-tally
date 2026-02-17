'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { List, Check, Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import React, { useState, useMemo } from 'react';
import { useCurrencySymbol } from '@/hooks/use-currency';
import { cn } from '@/lib/utils';
import { categories } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Swal from 'sweetalert2';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  categoryName: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});

type AddTransactionProps = {
  children?: React.ReactNode;
  defaultType?: 'income' | 'expense';
};

export function AddTransactionSheet({ 
  children, 
  defaultType = 'expense' 
}: AddTransactionProps) {
  const currencySymbol = useCurrencySymbol();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'transactions');
  }, [firestore, user]);

  const { data: transactions } = useCollection(transactionsQuery);

  const currentBalance = useMemo(() => {
    if (!transactions) return 0;
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    return income - expenses;
  }, [transactions]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultType,
      amount: 0,
      categoryName: '',
      description: '',
    },
  });

  const selectedType = form.watch('type');
  const availableCategories = categories.filter(c => c.type === selectedType);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    if (values.type === 'expense' && values.amount > currentBalance) {
      Swal.fire({
        icon: 'error',
        title: 'Insufficient Balance',
        text: `Your current balance is ${currencySymbol || '₹'}${currentBalance.toFixed(2)}. You cannot spend more than you have.`,
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const colRef = collection(firestore, 'users', user.uid, 'transactions');
      await addDoc(colRef, {
        userId: user.uid,
        amount: values.amount,
        type: values.type,
        category: values.categoryName,
        description: values.description || '',
        date: serverTimestamp(),
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `${values.type === 'income' ? 'Income' : 'Expense'} recorded successfully.`,
      });
      setOpen(false);
      form.reset();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: "Failed to save transaction. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCategorySelect = (categoryName: string) => {
    form.setValue('categoryName', categoryName, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
  };

  const title = selectedType === 'income' ? 'Add Income' : 'Add Expense';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl bg-white">
        <DialogHeader className="px-10 pt-10 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-10 pb-10 space-y-6 pt-6">
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-bold text-[#334155] uppercase tracking-wider ml-1">Category</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        placeholder="Enter category name" 
                        className="rounded-xl h-14 border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-14"
                        {...field} 
                      />
                    </FormControl>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-lg text-[#64748b] hover:bg-muted"
                          >
                            <List className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          className="w-[300px] p-2 rounded-2xl shadow-xl border-muted bg-white overflow-hidden" 
                          align="end"
                          side="bottom"
                        >
                          <div className="px-2 py-2 border-b bg-[#f8fafc] mb-1 -mx-2 -mt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Select Category</span>
                          </div>
                          <ScrollArea className="h-[200px]">
                            <div className="p-1 space-y-1">
                              {availableCategories.length > 0 ? (
                                availableCategories.map((category) => (
                                  <DropdownMenuItem
                                    key={category.id}
                                    onSelect={() => handleCategorySelect(category.name)}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors cursor-pointer group",
                                      field.value === category.name ? "bg-[#f1f5f9]" : "bg-transparent hover:bg-[#f1f5f9]"
                                    )}
                                  >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                      <category.icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-[#334155] flex-1">{category.name}</span>
                                    {field.value === category.name && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  No categories found
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-bold text-[#334155] uppercase tracking-wider ml-1">Amount</FormLabel>
                  <div className="flex group">
                    <div className="flex items-center justify-center px-5 border border-r-0 border-[#cbd5e1] rounded-l-xl bg-[#f8fafc] text-[#64748b] font-bold text-lg min-w-[4rem]">
                      {currencySymbol || '₹'}
                    </div>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00" 
                        className="rounded-r-xl rounded-l-none h-14 border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-lg font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-bold text-[#334155] uppercase tracking-wider ml-1">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a note for this transaction..." 
                      className="min-h-[100px] rounded-xl border-[#cbd5e1] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none p-4"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="ml-1" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-tr from-primary to-accent hover:opacity-95 text-white font-bold text-lg rounded-2xl transition-all shadow-xl mt-4 border-0 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Transaction'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
