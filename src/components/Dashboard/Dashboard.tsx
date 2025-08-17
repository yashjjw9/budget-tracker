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

  // Calculate spending insights
  const calculateSpendingInsights = () => {
    const today = new Date();
    const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    
    const daysElapsed = Math.min(today.getDate(), endOfMonth.getDate());
    const totalDaysInMonth = endOfMonth.getDate();
    
    const dailySpendingRate = currentMonthData.totalSpent / daysElapsed;
    const projectedMonthlySpending = dailySpendingRate * totalDaysInMonth;
    const dailyBudgetRate = currentMonthData.totalBudget / totalDaysInMonth;
    
    // Calculate spending velocity
    const spendingVelocity = dailySpendingRate / dailyBudgetRate;
    
    // Get top spending categories
    const topSpendingCategories = currentMonthData.categorySummaries
      .filter(summary => summary.budget > 0)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3);
    
    // Calculate budget health score (0-100)
    const budgetHealthScore = Math.max(0, 100 - Math.round((currentMonthData.totalSpent / currentMonthData.totalBudget) * 100));
    
    return {
      daysElapsed,
      totalDaysInMonth,
      dailySpendingRate,
      projectedMonthlySpending,
      dailyBudgetRate,
      spendingVelocity,
      topSpendingCategories,
      budgetHealthScore,
      isOverSpending: dailySpendingRate > dailyBudgetRate,
      spendingTrend: projectedMonthlySpending > currentMonthData.totalBudget ? 'increasing' : 'decreasing'
    };
  };

  const insights = calculateSpendingInsights();

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

      {/* Budget Health & Insights */}
      <div className="insights-grid">
        <div className="card insight-card">
          <div className="card-header">
            <h3 className="card-title">Budget Health Score</h3>
            <div className="health-indicator">
              <div className={`health-score ${insights.budgetHealthScore >= 80 ? 'excellent' : insights.budgetHealthScore >= 60 ? 'good' : insights.budgetHealthScore >= 40 ? 'fair' : 'poor'}`}>
                {insights.budgetHealthScore}
              </div>
              <span className="health-label">/100</span>
            </div>
          </div>
          <div className="health-status">
            {insights.budgetHealthScore >= 80 && (
              <div className="status-message success">
                🎉 Excellent! You're managing your budget very well.
              </div>
            )}
            {insights.budgetHealthScore >= 60 && insights.budgetHealthScore < 80 && (
              <div className="status-message good">
                👍 Good job! You're staying within your budget.
              </div>
            )}
            {insights.budgetHealthScore >= 40 && insights.budgetHealthScore < 60 && (
              <div className="status-message warning">
                ⚠️ Fair - Consider reducing spending to improve your score.
              </div>
            )}
            {insights.budgetHealthScore < 40 && (
              <div className="status-message danger">
                🚨 Poor - Immediate action needed to get back on track.
              </div>
            )}
          </div>
        </div>

        <div className="card insight-card">
          <div className="card-header">
            <h3 className="card-title">Spending Velocity</h3>
            <span className="text-sm text-gray-500">Daily Rate vs Budget</span>
          </div>
          <div className="velocity-content">
            <div className="velocity-metric">
              <div className="velocity-value">
                {insights.spendingVelocity.toFixed(1)}x
              </div>
              <div className="velocity-label">
                {insights.spendingVelocity > 1.2 ? 'Too Fast' : insights.spendingVelocity > 1 ? 'Slightly Fast' : 'On Track'}
              </div>
            </div>
            <div className="velocity-details">
              <div className="detail-item">
                <span className="detail-label">Daily Spending:</span>
                <span className="detail-value">{formatCurrency(insights.dailySpendingRate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Daily Budget:</span>
                <span className="detail-value">{formatCurrency(insights.dailyBudgetRate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card insight-card">
          <div className="card-header">
            <h3 className="card-title">Month Progress</h3>
            <span className="text-sm text-gray-500">Time & Spending</span>
          </div>
          <div className="progress-content">
            <div className="time-progress">
              <div className="progress-circle">
                <svg className="progress-ring" width="80" height="80">
                  <circle
                    className="progress-ring-bg"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="transparent"
                    r="32"
                    cx="40"
                    cy="40"
                  />
                  <circle
                    className="progress-ring-fill"
                    stroke={insights.daysElapsed / insights.totalDaysInMonth > 0.8 ? '#ef4444' : '#3b82f6'}
                    strokeWidth="6"
                    fill="transparent"
                    r="32"
                    cx="40"
                    cy="40"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - insights.daysElapsed / insights.totalDaysInMonth)}`}
                  />
                </svg>
                <div className="progress-text">
                  <div className="progress-number">{insights.daysElapsed}</div>
                  <div className="progress-label">days</div>
                </div>
              </div>
            </div>
            <div className="progress-stats">
              <div className="stat-item">
                <span className="stat-label">Month Progress:</span>
                <span className="stat-value">{Math.round((insights.daysElapsed / insights.totalDaysInMonth) * 100)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Spending Progress:</span>
                <span className="stat-value">{Math.round((currentMonthData.totalSpent / currentMonthData.totalBudget) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Spending Categories */}
      {insights.topSpendingCategories.length > 0 && (
        <div className="card mb-8">
          <div className="card-header">
            <h3 className="card-title">Top Spending Categories</h3>
            <span className="text-sm text-gray-500">This Month's Biggest Expenses</span>
          </div>
          <div className="top-categories">
            {insights.topSpendingCategories.map((summary, index) => {
              const category = categories.find(c => c.id === summary.categoryId);
              const percentage = summary.budget > 0 ? (summary.spent / summary.budget) * 100 : 0;
              
              return (
                <div key={summary.categoryId} className="top-category-item">
                  <div className="category-rank">
                    <span className="rank-number">#{index + 1}</span>
                  </div>
                  <div className="category-info">
                    <div className="category-icon">
                      {category?.icon || '💰'}
                    </div>
                    <div className="category-details">
                      <div className="category-name">{summary.categoryName}</div>
                      <div className="category-amounts">
                        <span className="spent">{formatCurrency(summary.spent)}</span>
                        <span className="separator">/</span>
                        <span className="budget">{formatCurrency(summary.budget)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="category-progress">
                    <div className="mini-progress-bar">
                      <div 
                        className={`mini-progress-fill ${percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : ''}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="mini-progress-text">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Progress */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="card-title">Category Progress</h3>
          <span className="text-sm text-gray-500">Budget vs. Spending Overview</span>
        </div>
        <div className="card-content">
          {currentMonthData.categorySummaries.length > 0 ? (
            <div className="category-grid">
              {currentMonthData.categorySummaries
                .filter(summary => summary.budget > 0)
                .map(summary => {
                  const percentage = summary.budget > 0 ? (summary.spent / summary.budget) * 100 : 0;
                  const isOverBudget = summary.spent > summary.budget;
                  
                  return (
                    <div key={summary.categoryId} className="category-card">
                      <div className="card-header-compact">
                        <div className="category-icon">
                          {categories.find(c => c.id === summary.categoryId)?.icon || '💰'}
                        </div>
                        <div className="category-title">
                          <div className="category-name">{summary.categoryName}</div>
                          <div className="category-amounts">
                            <span className="spent">{formatCurrency(summary.spent)}</span>
                            <span className="separator">/</span>
                            <span className="budget">{formatCurrency(summary.budget)}</span>
                          </div>
                        </div>
                        <div className="category-percentage">
                          <span className="percentage-value">{percentage.toFixed(0)}%</span>
                        </div>
                      </div>
                      
                      <div className="progress-section">
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${isOverBudget ? 'danger' : percentage > 80 ? 'warning' : ''}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="progress-labels">
                          <span className="progress-label-left">$0</span>
                          <span className="progress-label-right">{formatCurrency(summary.budget)}</span>
                        </div>
                      </div>
                      
                      {isOverBudget && (
                        <div className="over-budget-alert">
                          <span className="alert-icon">⚠️</span>
                          <span className="alert-text">Over by {formatCurrency(summary.spent - summary.budget)}</span>
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
