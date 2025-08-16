import { Category, Transaction, RecurringPayment } from '../types';
import { generateId, getRandomColor } from './helpers';

// Sample categories with realistic budgets and icons
export const generateDummyCategories = (): Category[] => {
  return [
    {
      id: generateId(),
      name: 'Groceries',
      budget: 800,
      color: '#4CAF50',
      icon: '🛒'
    },
    {
      id: generateId(),
      name: 'Food & Dining',
      budget: 400,
      color: '#FF9800',
      icon: '🍽️'
    },
    {
      id: generateId(),
      name: 'Transportation',
      budget: 300,
      color: '#00BCD4',
      icon: '🚗'
    },
    {
      id: generateId(),
      name: 'Entertainment',
      budget: 200,
      color: '#E91E63',
      icon: '🎬'
    },
    {
      id: generateId(),
      name: 'Shopping',
      budget: 250,
      color: '#FF5722',
      icon: '🛍️'
    },
    {
      id: generateId(),
      name: 'Utilities',
      budget: 150,
      color: '#607D8B',
      icon: '⚡'
    },
    {
      id: generateId(),
      name: 'Healthcare',
      budget: 100,
      color: '#F44336',
      icon: '🏥'
    },
    {
      id: generateId(),
      name: 'Savings',
      budget: 500,
      color: '#8BC34A',
      icon: '💰'
    }
  ];
};

// Sample transactions for the current month
export const generateDummyTransactions = (categories: Category[]): Transaction[] => {
  const transactions: Transaction[] = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Generate transactions for the last 3 months
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const month = (currentMonth - monthOffset + 12) % 12;
    const year = monthOffset === 0 ? currentYear : currentYear - 1;
    
    // Income transactions
    transactions.push({
      id: generateId(),
      amount: 3500 + Math.floor(Math.random() * 1000), // ₹3500-₹4500
      categoryId: categories.find(c => c.name === 'Savings')?.id || categories[0].id,
      description: 'Salary',
      date: new Date(year, month, 15).toISOString().split('T')[0],
      type: 'income'
    });
    
    // Groceries
    for (let i = 0; i < 8; i++) {
      transactions.push({
        id: generateId(),
        amount: 20 + Math.floor(Math.random() * 80), // ₹20-₹100
        categoryId: categories.find(c => c.name === 'Groceries')?.id || categories[0].id,
        description: `Grocery shopping ${i + 1}`,
        date: new Date(year, month, 5 + i * 3).toISOString().split('T')[0],
        type: 'expense'
      });
    }
    
    // Food & Dining
    for (let i = 0; i < 6; i++) {
      transactions.push({
        id: generateId(),
        amount: 15 + Math.floor(Math.random() * 35), // ₹15-₹50
        categoryId: categories.find(c => c.name === 'Food & Dining')?.id || categories[0].id,
        description: `Restaurant ${i + 1}`,
        date: new Date(year, month, 2 + i * 4).toISOString().split('T')[0],
        type: 'expense'
      });
    }
    
    // Transportation
    for (let i = 0; i < 4; i++) {
      transactions.push({
        id: generateId(),
        amount: 25 + Math.floor(Math.random() * 25), // ₹25-₹50
        categoryId: categories.find(c => c.name === 'Transportation')?.id || categories[0].id,
        description: `Gas ${i + 1}`,
        date: new Date(year, month, 7 + i * 7).toISOString().split('T')[0],
        type: 'expense'
      });
    }
    
    // Entertainment
    for (let i = 0; i < 3; i++) {
      transactions.push({
        id: generateId(),
        amount: 30 + Math.floor(Math.random() * 70), // ₹30-₹100
        categoryId: categories.find(c => c.name === 'Entertainment')?.id || categories[0].id,
        description: `Movie night ${i + 1}`,
        date: new Date(year, month, 10 + i * 8).toISOString().split('T')[0],
        type: 'expense'
      });
    }
    
    // Shopping
    for (let i = 0; i < 2; i++) {
      transactions.push({
        id: generateId(),
        amount: 50 + Math.floor(Math.random() * 100), // ₹50-₹150
        categoryId: categories.find(c => c.name === 'Shopping')?.id || categories[0].id,
        description: `Shopping ${i + 1}`,
        date: new Date(year, month, 12 + i * 15).toISOString().split('T')[0],
        type: 'expense'
      });
    }
    
    // Utilities
    transactions.push({
      id: generateId(),
      amount: 120 + Math.floor(Math.random() * 30), // ₹120-₹150
      categoryId: categories.find(c => c.name === 'Utilities')?.id || categories[0].id,
      description: 'Electricity bill',
      date: new Date(year, month, 25).toISOString().split('T')[0],
      type: 'expense'
    });
    
    // Healthcare
    if (Math.random() > 0.7) { // 30% chance
      transactions.push({
        id: generateId(),
        amount: 80 + Math.floor(Math.random() * 120), // ₹80-₹200
        categoryId: categories.find(c => c.name === 'Healthcare')?.id || categories[0].id,
        description: 'Doctor visit',
        date: new Date(year, month, 20 + Math.floor(Math.random() * 10)).toISOString().split('T')[0],
        type: 'expense'
      });
    }
  }
  
  return transactions;
};

// Sample recurring payments
export const generateDummyRecurringPayments = (categories: Category[]): RecurringPayment[] => {
  return [
    {
      id: generateId(),
      amount: 1200,
      categoryId: categories.find(c => c.name === 'Savings')?.id || categories[0].id,
      description: 'Rent',
      recurrenceDate: 1,
      isActive: true
    },
    {
      id: generateId(),
      amount: 150,
      categoryId: categories.find(c => c.name === 'Utilities')?.id || categories[0].id,
      description: 'Internet & Phone',
      recurrenceDate: 15,
      isActive: true
    },
    {
      id: generateId(),
      amount: 80,
      categoryId: categories.find(c => c.name === 'Transportation')?.id || categories[0].id,
      description: 'Car Insurance',
      recurrenceDate: 20,
      isActive: true
    },
    {
      id: generateId(),
      amount: 25,
      categoryId: categories.find(c => c.name === 'Entertainment')?.id || categories[0].id,
      description: 'Netflix & Spotify',
      recurrenceDate: 28,
      isActive: true
    }
  ];
};

// Generate all dummy data
export const generateAllDummyData = () => {
  const categories = generateDummyCategories();
  const transactions = generateDummyTransactions(categories);
  const recurringPayments = generateDummyRecurringPayments(categories);
  
  return {
    categories,
    transactions,
    recurringPayments
  };
};
