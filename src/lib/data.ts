import {
  Car,
  Film,
  HeartPulse,
  Home,
  Landmark,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';
import type { Budget, Category, Transaction } from './types';

export const categories: Category[] = [
  { id: 'cat-1', name: 'Salary', icon: Landmark, type: 'income' },
  { id: 'cat-2', name: 'Food', icon: UtensilsCrossed, type: 'expense' },
  { id: 'cat-3', name: 'Transport', icon: Car, type: 'expense' },
  { id: 'cat-4', name: 'Shopping', icon: ShoppingBag, type: 'expense' },
  { id: 'cat-5', name: 'Housing', icon: Home, type: 'expense' },
  { id: 'cat-6', name: 'Entertainment', icon: Film, type: 'expense' },
  { id: 'cat-7', name: 'Health', icon: HeartPulse, type: 'expense' },
];

export const transactions: Transaction[] = [];

export const budgets: Budget[] = [];
