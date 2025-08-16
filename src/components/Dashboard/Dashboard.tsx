import React, { useState } from 'react';
import { Category, Transaction, RecurringPayment } from '../../types';
import { calculateBudgetSummary, formatCurrency } from '../../utils/helpers';
import './Dashboard.css';

interface DashboardProps {
  categories: Category[];
  transactions: Transaction[];
  recurringPayments: RecurringPayment[];
}

const Dashboard: React.FC<DashboardProps> = ({ categories, transactions, recurringPayments }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const currentMonthData = calculateBudgetSummary(categories, transactions, selectedMonth);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = event.target.value.split('-');
    setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
  };

  const getMonthLabel = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your budget and spending for {getMonthLabel(selectedMonth)}</p>
          
          <div className="month-selector">
            <label className="form-label">Select Month</label>
            <select 
              className="form-select" 
              value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
              onChange={handleMonthChange}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(selectedMonth.getFullYear(), i, 1);
                return (
                  <option key={i} value={`${date.getFullYear()}-${String(i + 1).padStart(2, '0')}`}>
                    {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Combined Budget Overview Card */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="card-title">Budget Overview</h3>
          <span className="text-sm text-gray-500">{getMonthLabel(selectedMonth)}</span>
        </div>
        <div className="budget-overview">
          <div className="budget-metrics">
            <div className="metric-item">
              <div className="metric-label">Total Budget</div>
              <div className="metric-value budget-value">
                {formatCurrency(currentMonthData.totalBudget)}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Total Spent</div>
              <div className={`metric-value ${
                currentMonthData.totalSpent > currentMonthData.totalBudget ? 'spent-value' : 'spent-value-ok'
              }`}>
                {formatCurrency(currentMonthData.totalSpent)}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Remaining</div>
              <div className={`metric-value ${
                currentMonthData.remaining < 0 ? 'remaining-negative' : 'remaining-positive'
              }`}>
                {formatCurrency(Math.abs(currentMonthData.remaining))}
                {currentMonthData.remaining < 0 ? ' (Over Budget)' : ''}
              </div>
            </div>
          </div>
          
          <div className="budget-progress">
            <div className="progress-info">
              <span className="progress-label">Budget Usage</span>
              <span className="progress-percentage">
                {currentMonthData.totalBudget > 0 
                  ? Math.round((currentMonthData.totalSpent / currentMonthData.totalBudget) * 100)
                  : 0}%
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${
                  currentMonthData.totalSpent > currentMonthData.totalBudget ? 'danger' : 
                  (currentMonthData.totalSpent / currentMonthData.totalBudget) > 0.8 ? 'warning' : ''
                }`}
                style={{ 
                  width: `${currentMonthData.totalBudget > 0 
                    ? Math.min((currentMonthData.totalSpent / currentMonthData.totalBudget) * 100, 100)
                    : 0}%` 
                }}
              ></div>
            </div>
            <div className="progress-status">
              {currentMonthData.totalSpent > currentMonthData.totalBudget ? (
                <span className="status-badge danger">Over Budget</span>
              ) : (currentMonthData.totalSpent / currentMonthData.totalBudget) > 0.8 ? (
                <span className="status-badge warning">Near Limit</span>
              ) : (
                <span className="status-badge success">On Track</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="card-title">Category Progress</h3>
        </div>
        <div className="card-content">
          {currentMonthData.categorySummaries.length > 0 ? (
            <div className="category-progress">
              {currentMonthData.categorySummaries
                .filter(summary => summary.budget > 0)
                .map(summary => {
                  const percentage = summary.budget > 0 ? (summary.spent / summary.budget) * 100 : 0;
                  const isOverBudget = summary.spent > summary.budget;
                  
                  return (
                    <div key={summary.categoryId} className="category-item">
                      <div className="category-header">
                        <div className="category-info">
                          <div className="category-icon">
                            {categories.find(c => c.id === summary.categoryId)?.icon || '💰'}
                          </div>
                          <div>
                            <div className="category-name">{summary.categoryName}</div>
                            <div className="category-amounts">
                              <span className="spent">{formatCurrency(summary.spent)}</span>
                              <span className="separator">/</span>
                              <span className="budget">{formatCurrency(summary.budget)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="progress-container">
                        <span className="progress-text">{percentage.toFixed(0)}%</span>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${isOverBudget ? 'danger' : percentage > 80 ? 'warning' : ''}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {isOverBudget && (
                        <div className="over-budget-warning">
                          ⚠️ Over budget by {formatCurrency(summary.spent - summary.budget)}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="no-data">
              <p>No categories with budgets set for this month</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
        </div>
        <div className="card-content">
          {transactions.length > 0 ? (
            <div className="recent-transactions">
              {transactions
                .filter(t => {
                  const transactionDate = new Date(t.date);
                  return transactionDate.getMonth() === selectedMonth.getMonth() && 
                         transactionDate.getFullYear() === selectedMonth.getFullYear();
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map(transaction => {
                  const category = categories.find(c => c.id === transaction.categoryId);
                  return (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <div className="transaction-icon">
                          {category?.icon || '💰'}
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-description">{transaction.description}</div>
                          <div className="transaction-category">{category?.name || 'Uncategorized'}</div>
                        </div>
                      </div>
                      <div className="transaction-amount">
                        <div className={`amount ${transaction.type === 'expense' ? 'expense' : 'income'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="transaction-date">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="no-data">
              <p>No transactions for this month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
