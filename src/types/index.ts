export interface Category {
  id: string;
  name: string;
  budget: number;
  color: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  type: 'expense' | 'income';
}

export interface RecurringPayment {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  recurrenceDate: number; // Day of month (1-31)
  isActive: boolean;
  lastProcessed?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categorySummaries: CategorySummary[];
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  budget: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface DashboardData {
  currentMonth: BudgetSummary;
  previousMonth: BudgetSummary;
  topCategories: CategorySummary[];
  recentTransactions: Transaction[];
}
