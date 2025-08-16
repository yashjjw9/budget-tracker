import { Category, Transaction, RecurringPayment } from '../types';
import { STORAGE_KEYS } from './constants';

export const storage = {
  // Categories
  getCategories: (): Category[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveCategories: (categories: Category[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  },

  // Transactions
  getTransactions: (): Transaction[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  },

  // Recurring Payments
  getRecurringPayments: (): RecurringPayment[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECURRING_PAYMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveRecurringPayments: (payments: RecurringPayment[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECURRING_PAYMENTS, JSON.stringify(payments));
    } catch (error) {
      console.error('Failed to save recurring payments:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.RECURRING_PAYMENTS);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }
};
