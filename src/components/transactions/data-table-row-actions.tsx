'use client';

import { Eye, Pencil, Trash2, Check, List, Loader2, Info } from 'lucide-react';
import type { Row } from '@tanstack/react-table';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore, useUser, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useCurrencySymbol } from '@/hooks/use-currency';
import { categories } from '@/lib/data';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  categoryName: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
});

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const transaction = row.original as any;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const currencySymbol = useCurrencySymbol();

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Check for 24-hour edit restriction
  useEffect(() => {
    if (!transaction.date) return;
    
    const checkExpiry = () => {
      const txDate = transaction.date instanceof Timestamp 
        ? transaction.date.toDate() 
        : new Date(transaction.date);
      
      const now = new Date();
      const diffMs = now.getTime() - txDate.getTime();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      
      setIsExpired(diffMs >= twentyFourHoursMs);
    };

    checkExpiry();
    // Re-check every minute to update the UI if the 24h mark is hit while viewing
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [transaction.date]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transaction.type || 'expense',
      amount: transaction.amount || 0,
      categoryName: transaction.category || '',
      description: transaction.description || '',
    },
  });

  const selectedType = form.watch('type');
  const availableCategories = categories.filter(c => c.type === selectedType);

  const handleDelete = () => {
    if (!user || !firestore || !transaction.id || isExpired) return;
    const docRef = doc(firestore, 'users', user.uid, 'transactions', transaction.id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Transaction Deleted",
      description: "The record has been removed from your history.",
    });
  };

  const onEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !firestore || !transaction.id || isExpired) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(firestore, 'users', user.uid, 'transactions', transaction.id);
      updateDocumentNonBlocking(docRef, {
        amount: values.amount,
        type: values.type,
        category: values.categoryName,
        description: values.description || '',
      });
      toast({
        title: "Transaction Updated",
        description: "The changes have been saved successfully.",
      });
      setIsEditOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save changes. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: any) => {
    if (date instanceof Timestamp) return date.toDate().toLocaleString();
    if (date instanceof Date) return date.toLocaleString();
    return 'N/A';
  };

  const handleCategorySelect = (categoryName: string) => {
    form.setValue('categoryName', categoryName, { shouldValidate: true });
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => setIsViewOpen(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>View Details</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={isExpired}
                className={cn(
                  "h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50",
                  isExpired && "opacity-30 grayscale cursor-not-allowed"
                )}
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {isExpired ? "Edit locked after 24 hours" : "Edit Transaction"}
          </TooltipContent>
        </Tooltip>
        
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={isExpired}
                    className={cn(
                      "h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50",
                      isExpired && "opacity-30 grayscale cursor-not-allowed"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {isExpired ? "Delete locked after 24 hours" : "Delete Transaction"}
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent className="rounded-[2.5rem] bg-white border-0 shadow-2xl p-10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-[#1e293b]">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-[#64748b]">
                This action cannot be undone. This will permanently delete the transaction
                of <span className="font-bold text-red-500">{currencySymbol}{transaction.amount?.toFixed(2)}</span> from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-6">
              <AlertDialogCancel className="rounded-xl border-[#cbd5e1] h-12 font-bold text-[#64748b] hover:bg-[#f8fafc]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="rounded-xl bg-red-500 hover:bg-red-600 h-12 font-bold text-white shadow-lg shadow-red-200"
              >
                Delete Transaction
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipProvider>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] bg-white border-0 shadow-2xl p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</span>
                <p className="text-sm font-semibold capitalize text-[#334155]">{transaction.type}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Date</span>
                <p className="text-sm font-semibold text-[#334155]">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</span>
              <p className="text-sm font-semibold text-[#334155]">{transaction.category}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amount</span>
              <p className={cn(
                "text-2xl font-black",
                transaction.type === 'income' ? "text-[#10b981]" : "text-[#ef4444]"
              )}>
                {currencySymbol}{transaction.amount?.toFixed(2)}
              </p>
            </div>
            {transaction.description && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Description</span>
                <p className="text-sm text-[#475569] leading-relaxed bg-[#f8fafc] p-4 rounded-xl border border-[#cbd5e1]">
                  {transaction.description}
                </p>
              </div>
            )}
            {isExpired && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium border border-blue-100">
                <Info className="h-4 w-4 shrink-0" />
                This transaction is over 24 hours old and can no longer be edited or deleted.
              </div>
            )}
            <Button 
              className="w-full h-12 rounded-xl bg-muted text-[#475569] font-bold hover:bg-[#e2e8f0] transition-colors"
              onClick={() => setIsViewOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl bg-white">
          <DialogHeader className="px-10 pt-10 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-3xl font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
              Edit {selectedType === 'income' ? 'Income' : 'Expense'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="px-10 pb-10 space-y-6 pt-6">
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
                                {availableCategories.map((category) => (
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
                                ))}
                              </div>
                            </ScrollArea>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <FormMessage />
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
                    <FormMessage />
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-tr from-primary to-accent hover:opacity-95 text-white font-bold text-lg rounded-2xl transition-all shadow-xl mt-4 border-0 active:scale-[0.98]"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
