import { Category, Transaction, CategorySummary, BudgetSummary } from '../types';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { CURRENCY_SYMBOL } from './constants';

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${Math.abs(amount).toFixed(2)}`;
};

export const formatDate = (date: string): string => {
  return format(parseISO(date), 'MMM dd, yyyy');
};

export const getCurrentMonth = (): { start: Date; end: Date } => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now)
  };
};

export const getMonthTransactions = (transactions: Transaction[], month: Date): Transaction[] => {
  const { start, end } = {
    start: startOfMonth(month),
    end: endOfMonth(month)
  };

  return transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date);
    return isWithinInterval(transactionDate, { start, end });
  });
};

export const calculateCategorySummary = (
  category: Category,
  transactions: Transaction[],
  month: Date
): CategorySummary => {
  const monthTransactions = getMonthTransactions(transactions, month);
  const categoryTransactions = monthTransactions.filter(t => t.categoryId === category.id);
  
  const spent = categoryTransactions.reduce((sum, t) => {
    return sum + (t.type === 'expense' ? t.amount : 0);
  }, 0);

  const remaining = category.budget - spent;
  const percentageUsed = category.budget > 0 ? (spent / category.budget) * 100 : 0;
  const isOverBudget = spent > category.budget;

  return {
    categoryId: category.id,
    categoryName: category.name,
    budget: category.budget,
    spent,
    remaining,
    percentageUsed,
    isOverBudget
  };
};

export const calculateBudgetSummary = (
  categories: Category[],
  transactions: Transaction[],
  month: Date
): BudgetSummary => {
  const categorySummaries = categories.map(category =>
    calculateCategorySummary(category, transactions, month)
  );

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categorySummaries.reduce((sum, summary) => sum + summary.spent, 0);
  const remaining = totalBudget - totalSpent;

  return {
    totalBudget,
    totalSpent,
    remaining,
    categorySummaries
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getRandomColor = (): string => {
  const colors = [
    '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#795548',
    '#607D8B', '#E91E63', '#00BCD4', '#8BC34A', '#F44336'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
