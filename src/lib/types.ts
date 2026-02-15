import type { LucideIcon } from 'lucide-react';

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
};

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  type: 'income' | 'expense';
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly';
};
