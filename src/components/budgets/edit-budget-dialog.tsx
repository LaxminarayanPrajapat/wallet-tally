'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categories } from '@/lib/data';
import type { Budget } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';

type EditBudgetDialogProps = {
  budget: Budget;
};

export function EditBudgetDialog({ budget }: EditBudgetDialogProps) {
  const category = categories.find((c) => c.id === budget.categoryId);
  const [amount, setAmount] = React.useState(budget.amount);

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('New budget amount:', amount);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Edit Budget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Budget for {category?.name}</DialogTitle>
          <DialogDescription>
            Update the monthly budget amount for this category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
