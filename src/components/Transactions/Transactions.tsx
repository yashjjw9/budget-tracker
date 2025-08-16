import React, { useState, useMemo } from 'react';
import { Category, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './Transactions.css';

interface TransactionsProps {
  categories: Category[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({
  categories,
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || transaction.categoryId === filterCategory;
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, filterCategory, filterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (!formData.description.trim() || !formData.categoryId || isNaN(amount) || amount <= 0) {
      return;
    }

    const transactionData = {
      amount,
      categoryId: formData.categoryId,
      description: formData.description.trim(),
      date: formData.date,
      type: formData.type
    };

    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
    } else {
      onAddTransaction(transactionData);
    }

    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
    setShowAddForm(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      categoryId: transaction.categoryId,
      description: transaction.description,
      date: transaction.date,
      type: transaction.type
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingTransaction(null);
    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="transactions">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Track your income and expenses</p>
        </div>
      </div>

      {/* Combined Financial Overview Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Financial Overview</h3>
          <span className="text-sm text-gray-500">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} total
          </span>
        </div>
        <div className="financial-overview">
          <div className="financial-metrics">
            <div className="metric-item">
              <div className="metric-label">Total Income</div>
              <div className="metric-value income-value">
                {formatCurrency(totalIncome)}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Total Expenses</div>
              <div className="metric-value expense-value">
                {formatCurrency(totalExpenses)}
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Net Amount</div>
              <div className={`metric-value ${
                netAmount >= 0 ? 'net-positive' : 'net-negative'
              }`}>
                {formatCurrency(Math.abs(netAmount))}
                {netAmount >= 0 ? ' +' : ' -'}
              </div>
            </div>
          </div>
          
          <div className="financial-summary">
            <div className="summary-info">
              <span className="summary-label">Financial Status</span>
              <span className="summary-description">
                {netAmount >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
              </span>
            </div>
            <div className="summary-status">
              {netAmount >= 0 ? (
                <span className="status-badge success">In Profit</span>
              ) : (
                <span className="status-badge danger">In Deficit</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Filters & Search</h3>
        </div>
        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search transactions..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'expense' | 'income')}
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transaction-description" className="form-label">Description</label>
                <input
                  type="text"
                  id="transaction-description"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter transaction description"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="transaction-amount" className="form-label">Amount</label>
                <input
                  type="number"
                  id="transaction-amount"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transaction-category" className="form-label">Category</label>
                <select
                  id="transaction-category"
                  className="form-select"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="transaction-date" className="form-label">Date</label>
                <input
                  type="date"
                  id="transaction-date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <div className="type-selector">
                <label className="type-option">
                  <input
                    type="radio"
                    name="transaction-type"
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'expense' | 'income' }))}
                    className="form-checkbox"
                  />
                  <span className="type-label expense">Expense</span>
                </label>
                
                <label className="type-option">
                  <input
                    type="radio"
                    name="transaction-type"
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'expense' | 'income' }))}
                    className="form-checkbox"
                  />
                  <span className="type-label income">Income</span>
                </label>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Transaction Button */}
      {!showAddForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            + Add Transaction
          </button>
        </div>
      )}

      {/* Transactions List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Transaction History</h3>
          <span className="text-sm text-gray-500">
            {filteredTransactions.length} of {transactions.length} transactions
          </span>
        </div>
        <div className="card-content">
          {filteredTransactions.length === 0 ? (
            <div className="no-transactions">
              {transactions.length === 0 ? (
                <div className="no-transactions-content">
                  <div className="no-transactions-icon">💳</div>
                  <h3 className="no-transactions-title">No transactions yet</h3>
                  <p className="no-transactions-description">
                    Start tracking your income and expenses by adding your first transaction.
                  </p>
                  <div className="no-transactions-actions">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="btn btn-primary"
                    >
                      Add First Transaction
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No transactions match your current filters. Try adjusting your search criteria.
                </p>
              )}
            </div>
          ) : (
            <div className="transactions-list">
              {filteredTransactions.map(transaction => {
                const category = categories.find(c => c.id === transaction.categoryId);
                return (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <div className="transaction-icon" style={{ backgroundColor: category?.color || '#6b7280' }}>
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
                        {formatDate(transaction.date)}
                      </div>
                    </div>
                    
                    <div className="transaction-actions">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(transaction.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
