import React, { useState, useMemo } from 'react';
import { Category, Transaction } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import './Visualization.css';

interface VisualizationProps {
  categories: Category[];
  transactions: Transaction[];
}

const Visualization: React.FC<VisualizationProps> = ({ categories, transactions }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedChart, setSelectedChart] = useState<'monthly' | 'category' | 'trends'>('monthly');

  // Generate months for the selected year
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthName = new Date(selectedYear, i, 1).toLocaleDateString('en-US', { month: 'short' });
      return { month, monthName, monthIndex: i };
    });
  }, [selectedYear]);

  // Calculate monthly data for stacked bar chart
  const monthlyData = useMemo(() => {
    return months.map(({ month, monthName, monthIndex }) => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === selectedYear && 
               transactionDate.getMonth() === monthIndex;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expenses;

      return {
        month: monthName,
        income,
        expenses: Math.abs(expenses), // Make expenses positive for stacked bar
        net,
        monthIndex
      };
    });
  }, [transactions, selectedYear, months]);

  // Calculate category spending data
  const categoryData = useMemo(() => {
    const categorySpending = new Map<string, { name: string; amount: number; color: string; icon: string }>();
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = categories.find(c => c.id === transaction.categoryId);
        if (category) {
          const existing = categorySpending.get(category.id);
          if (existing) {
            existing.amount += transaction.amount;
          } else {
            categorySpending.set(category.id, {
              name: category.name,
              amount: transaction.amount,
              color: category.color,
              icon: category.icon || '💰'
            });
          }
        }
      }
    });

    return Array.from(categorySpending.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories
  }, [transactions, categories]);

  // Calculate spending trends over time
  const trendData = useMemo(() => {
    const monthlyTrends = months.map(({ month, monthName, monthIndex }) => {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === selectedYear && 
               transactionDate.getMonth() === monthIndex;
      });

      const totalSpent = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: monthName,
        spending: totalSpent,
        income: totalIncome,
        monthIndex
      };
    });

    return monthlyTrends;
  }, [transactions, selectedYear, months]);

  // Generate year options (current year and 2 years back)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - i);
  }, []);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const handleChartChange = (chartType: 'monthly' | 'category' | 'trends') => {
    setSelectedChart(chartType);
  };

  return (
    <div className="visualization">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Data Visualization</h1>
          <p className="page-subtitle">Analyze your spending patterns and financial trends</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Chart Controls</h3>
        </div>
        <div className="controls-container">
          <div className="control-group">
            <label className="control-label">Select Year</label>
            <select 
              className="form-select" 
              value={selectedYear}
              onChange={handleYearChange}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <div className="chart-type-selector">
            <button
              className={`chart-type-btn ${selectedChart === 'monthly' ? 'active' : ''}`}
              onClick={() => handleChartChange('monthly')}
            >
              📊 Monthly Comparison
            </button>
            <button
              className={`chart-type-btn ${selectedChart === 'category' ? 'active' : ''}`}
              onClick={() => handleChartChange('category')}
            >
              🥧 Category Breakdown
            </button>
            <button
              className={`chart-type-btn ${selectedChart === 'trends' ? 'active' : ''}`}
              onClick={() => handleChartChange('trends')}
            >
              📈 Spending Trends
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Comparison Chart - Stacked Bar */}
      {selectedChart === 'monthly' && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Monthly Income vs Expenses</h3>
            <span className="card-subtitle">Stacked bar chart showing monthly comparison for {selectedYear}</span>
          </div>
          <div className="chart-container">
            {monthlyData.some(d => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Bar dataKey="income" stackId="a" fill="#059669" name="Income" />
                  <Bar dataKey="expenses" stackId="a" fill="#dc2626" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No data available for {selectedYear}. Try selecting a different year or add some transactions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Breakdown Chart - Pie Chart */}
      {selectedChart === 'category' && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Spending by Category</h3>
            <span className="card-subtitle">Top spending categories for {selectedYear}</span>
          </div>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No spending data available for {selectedYear}. Try selecting a different year or add some expense transactions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spending Trends Chart - Line Chart */}
      {selectedChart === 'trends' && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Income vs Spending Trends</h3>
            <span className="card-subtitle">Monthly trends for {selectedYear}</span>
          </div>
          <div className="chart-container">
            {trendData.some(d => d.spending > 0 || d.income > 0) ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(Number(value)), 
                      name === 'spending' ? 'Spending' : 'Income'
                    ]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    name="Spending"
                    dot={{ fill: '#dc2626', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#059669" 
                    strokeWidth={3}
                    name="Income"
                    dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>No data available for {selectedYear}. Try selecting a different year or add some transactions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Summary Statistics</h3>
          <span className="card-subtitle">Key metrics for {selectedYear}</span>
        </div>
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-label">Total Income</div>
            <div className="stat-value income">
              {formatCurrency(monthlyData.reduce((sum, d) => sum + d.income, 0))}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value expense">
              {formatCurrency(monthlyData.reduce((sum, d) => sum + d.expenses, 0))}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Net Savings</div>
            <div className={`stat-value ${monthlyData.reduce((sum, d) => sum + d.net, 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(Math.abs(monthlyData.reduce((sum, d) => sum + d.net, 0)))}
              {monthlyData.reduce((sum, d) => sum + d.net, 0) >= 0 ? ' +' : ' -'}
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Best Month</div>
            <div className="stat-value">
              {monthlyData.reduce((best, current) => 
                current.net > best.net ? current : best
              ).month}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization;
