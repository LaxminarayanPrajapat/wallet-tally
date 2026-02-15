'use client';

import { Plus, Minus } from 'lucide-react';
import { AddTransactionSheet } from '../transactions/add-transaction-sheet';
import { Button } from '../ui/button';

export function FloatingActionButtons() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50 md:hidden">
      <AddTransactionSheet defaultType="income">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full bg-[#10b981] hover:bg-[#059669] text-white shadow-2xl transition-all active:scale-90 border-0 flex items-center justify-center"
        >
          <Plus className="h-8 w-8" strokeWidth={3} />
        </Button>
      </AddTransactionSheet>
      <AddTransactionSheet defaultType="expense">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white shadow-2xl transition-all active:scale-90 border-0 flex items-center justify-center"
        >
          <Minus className="h-8 w-8" strokeWidth={3} />
        </Button>
      </AddTransactionSheet>
    </div>
  );
}
