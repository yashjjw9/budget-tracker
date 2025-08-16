import React, { useState, useEffect } from 'react';
import { Category, RecurringPayment, Transaction } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import './RecurringPayments.css';

interface RecurringPaymentsProps {
  categories: Category[];
  recurringPayments: RecurringPayment[];
  onAddRecurringPayment: (payment: Omit<RecurringPayment, 'id'>) => void;
  onUpdateRecurringPayment: (id: string, updates: Partial<RecurringPayment>) => void;
  onDeleteRecurringPayment: (id: string) => void;
}

const RecurringPayments: React.FC<RecurringPaymentsProps> = ({
  categories,
  recurringPayments,
  onAddRecurringPayment,
  onUpdateRecurringPayment,
  onDeleteRecurringPayment
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    description: '',
    recurrenceDate: '1',
    isActive: true
  });

  // Check for recurring payments that need to be processed
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    
    recurringPayments.forEach(payment => {
      if (payment.isActive && payment.recurrenceDate === currentDay) {
        // Check if we already processed this payment today
        const lastProcessed = payment.lastProcessed ? new Date(payment.lastProcessed) : null;
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        if (!lastProcessed || lastProcessed < todayStart) {
          // Process the recurring payment
          const newTransaction: Omit<Transaction, 'id'> = {
            amount: payment.amount,
            categoryId: payment.categoryId,
            description: payment.description,
            date: today.toISOString().split('T')[0],
            type: 'expense'
          };
          
          // Update the last processed date
          onUpdateRecurringPayment(payment.id, {
            lastProcessed: today.toISOString()
          });
          
          // Note: In a real app, you'd want to add this transaction to the transactions list
          // For now, we'll just update the last processed date
          console.log('Recurring payment processed:', newTransaction);
        }
      }
    });
  }, [recurringPayments, onUpdateRecurringPayment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    const recurrenceDate = parseInt(formData.recurrenceDate);
    
    if (!formData.description.trim() || !formData.categoryId || isNaN(amount) || amount <= 0) {
      return;
    }

    const paymentData = {
      amount,
      categoryId: formData.categoryId,
      description: formData.description.trim(),
      recurrenceDate,
      isActive: formData.isActive
    };

    if (editingPayment) {
      onUpdateRecurringPayment(editingPayment.id, paymentData);
      setEditingPayment(null);
    } else {
      onAddRecurringPayment(paymentData);
    }

    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      recurrenceDate: '1',
      isActive: true
    });
    setShowAddForm(false);
  };

  const handleEdit = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setFormData({
      amount: payment.amount.toString(),
      categoryId: payment.categoryId,
      description: payment.description,
      recurrenceDate: payment.recurrenceDate.toString(),
      isActive: payment.isActive
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingPayment(null);
    setFormData({
      amount: '',
      categoryId: '',
      description: '',
      recurrenceDate: '1',
      isActive: true
    });
  };

  const handleToggleActive = (payment: RecurringPayment) => {
    onUpdateRecurringPayment(payment.id, { isActive: !payment.isActive });
  };

  const totalMonthlyRecurring = recurringPayments
    .filter(p => p.isActive)
    .reduce((sum, p) => sum + p.amount, 0);

  const getNextOccurrence = (recurrenceDate: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    
    if (recurrenceDate >= currentDay) {
      // This month
      return new Date(today.getFullYear(), today.getMonth(), recurrenceDate);
    } else {
      // Next month
      return new Date(today.getFullYear(), today.getMonth() + 1, recurrenceDate);
    }
  };

  const formatRecurrenceDate = (day: number) => {
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
    return `${day}${suffix}`;
  };

  return (
    <div className="recurring-payments">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Recurring Payments</h1>
          <p className="page-subtitle">Manage your monthly recurring expenses</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Recurring Payments Summary</h3>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Active:</span>
            <span className="summary-value">{recurringPayments.filter(p => p.isActive).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Inactive:</span>
            <span className="summary-value">{recurringPayments.filter(p => !p.isActive).length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Monthly Total:</span>
            <span className="summary-value">{formatCurrency(totalMonthlyRecurring)}</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">
              {editingPayment ? 'Edit Recurring Payment' : 'Add New Recurring Payment'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="recurring-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="payment-amount" className="form-label">Amount</label>
                <input
                  type="number"
                  id="payment-amount"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="payment-category" className="form-label">Category</label>
                <select
                  id="payment-category"
                  className="form-select"
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="payment-description" className="form-label">Description</label>
                <input
                  type="text"
                  id="payment-description"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter payment description"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="payment-recurrence" className="form-label">Recurrence Date</label>
                <select
                  id="payment-recurrence"
                  className="form-select"
                  value={formData.recurrenceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrenceDate: e.target.value }))}
                  required
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>
                      {formatRecurrenceDate(day)} of month
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="form-checkbox"
                />
                <span className="ml-2">Active</span>
              </label>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingPayment ? 'Update Payment' : 'Add Payment'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Payment Button */}
      {!showAddForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            + Add New Recurring Payment
          </button>
        </div>
      )}

      {/* Recurring Payments List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Recurring Payments</h3>
        </div>
        <div className="recurring-list">
          {recurringPayments.length === 0 ? (
            <div className="no-payments">
              <p className="text-gray-500 text-center py-8">
                No recurring payments yet. Add your first recurring payment to get started!
              </p>
            </div>
          ) : (
            recurringPayments
              .sort((a, b) => a.recurrenceDate - b.recurrenceDate)
              .map(payment => {
                const category = categories.find(c => c.id === payment.categoryId);
                const nextOccurrence = getNextOccurrence(payment.recurrenceDate);
                
                return (
                  <div key={payment.id} className={`recurring-item ${!payment.isActive ? 'inactive' : ''}`}>
                    <div className="recurring-info">
                      <div className="recurring-icon" style={{ backgroundColor: category?.color || '#6b7280' }}>
                        {category?.icon || '🔄'}
                      </div>
                      <div className="recurring-details">
                        <h4 className="recurring-description">{payment.description}</h4>
                        <div className="recurring-meta">
                          <span className="recurring-category">{category?.name || 'Unknown'}</span>
                          <span className="recurring-date">
                            {formatRecurrenceDate(payment.recurrenceDate)} of month
                          </span>
                          <span className="next-occurrence">
                            Next: {nextOccurrence.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="recurring-amount-section">
                      <span className="recurring-amount">
                        {formatCurrency(payment.amount)}
                      </span>
                      
                      <div className="recurring-actions">
                        <button
                          onClick={() => handleToggleActive(payment)}
                          className={`btn btn-sm ${payment.isActive ? 'btn-secondary' : 'btn-success'}`}
                        >
                          {payment.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(payment)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteRecurringPayment(payment.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default RecurringPayments;
