import React, { useState, useEffect } from 'react';
import './styles/global.css';
import { Category, Transaction, RecurringPayment } from './types';
import { storage } from './utils/storage';
import { generateId, getRandomColor } from './utils/helpers';
import { generateAllDummyData } from './utils/dummyData';
import Dashboard from './components/Dashboard/Dashboard';
import Categories from './components/Categories/Categories';
import Transactions from './components/Transactions/Transactions';
import RecurringPayments from './components/RecurringPayments/RecurringPayments';
import Visualization from './components/Visualization/Visualization';

type TabType = 'dashboard' | 'categories' | 'transactions' | 'recurring' | 'visualization';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [showDummyDataPrompt, setShowDummyDataPrompt] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize app with saved data
  useEffect(() => {
    const savedCategories = storage.getCategories();
    const savedTransactions = storage.getTransactions();
    const savedRecurringPayments = storage.getRecurringPayments();

    if (savedCategories.length === 0 && savedTransactions.length === 0) {
      setShowDummyDataPrompt(true);
    } else {
      setCategories(savedCategories);
      setTransactions(savedTransactions);
      setRecurringPayments(savedRecurringPayments);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    storage.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    storage.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    storage.saveRecurringPayments(recurringPayments);
  }, [recurringPayments]);

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const handleLoadDummyData = () => {
    const dummyData = generateAllDummyData();
    setCategories(dummyData.categories);
    setTransactions(dummyData.transactions);
    setRecurringPayments(dummyData.recurringPayments);
    setShowDummyDataPrompt(false);
    
    // Save to storage
    storage.saveCategories(dummyData.categories);
    storage.saveTransactions(dummyData.transactions);
    storage.saveRecurringPayments(dummyData.recurringPayments);
  };

  const handleSkipDummyData = () => {
    setShowDummyDataPrompt(false);
  };

  const handleAddCategory = (name: string, budget: number) => {
    const newCategory: Category = {
      id: generateId(),
      name,
      budget,
      color: getRandomColor()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id ? { ...transaction, ...updates } : transaction
    ));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const handleAddRecurringPayment = (payment: Omit<RecurringPayment, 'id'>) => {
    const newPayment: RecurringPayment = {
      ...payment,
      id: generateId()
    };
    setRecurringPayments(prev => [...prev, newPayment]);
  };

  const handleUpdateRecurringPayment = (id: string, updates: Partial<RecurringPayment>) => {
    setRecurringPayments(prev => prev.map(payment => 
      payment.id === id ? { ...payment, ...updates } : payment
    ));
  };

  const handleDeleteRecurringPayment = (id: string) => {
    setRecurringPayments(prev => prev.filter(payment => payment.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            categories={categories}
            transactions={transactions}
            recurringPayments={recurringPayments}
          />
        );
      case 'categories':
        return (
          <Categories
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case 'transactions':
        return (
          <Transactions
            categories={categories}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'recurring':
        return (
          <RecurringPayments
            categories={categories}
            recurringPayments={recurringPayments}
            onAddRecurringPayment={handleAddRecurringPayment}
            onUpdateRecurringPayment={handleUpdateRecurringPayment}
            onDeleteRecurringPayment={handleDeleteRecurringPayment}
          />
        );
      case 'visualization':
        return (
          <Visualization
            categories={categories}
            transactions={transactions}
          />
        );
      default:
        return <Dashboard categories={categories} transactions={transactions} recurringPayments={recurringPayments} />;
    }
  };

  // Show dummy data prompt if no data exists
  if (showDummyDataPrompt) {
    return (
      <div className="app">
        <div className="dummy-data-prompt">
          <div className="prompt-container">
            <div className="prompt-icon">🚀</div>
            <h1 className="prompt-title">Welcome to Budget Tracker!</h1>
            <p className="prompt-description">
              Get started quickly by loading sample data, or start fresh with an empty budget.
            </p>
            <div className="prompt-actions">
              <button onClick={handleLoadDummyData} className="btn btn-primary">
                Load Sample Data
              </button>
              <button onClick={handleSkipDummyData} className="btn btn-secondary">
                Start Fresh
              </button>
            </div>
            <div className="prompt-info">
              <h3>Sample data includes:</h3>
              <ul>
                <li>8 budget categories with realistic budgets</li>
                <li>Sample transactions for the last 3 months</li>
                <li>Recurring payments (rent, utilities, etc.)</li>
                <li>Perfect for testing all features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="main-navigation">
        <div className="nav-container">
          <h1 className="nav-title">Budget Tracker</h1>
          
          {/* Desktop Navigation */}
          <div className="nav-tabs desktop-nav">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'categories', label: 'Categories', icon: '🏷️' },
              { id: 'transactions', label: 'Transactions', icon: '💳' },
              { id: 'recurring', label: 'Recurring', icon: '🔄' },
              { id: 'visualization', label: 'Charts', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-nav-menu">
            <div className="mobile-nav-container">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'categories', label: 'Categories', icon: '🏷️' },
                { id: 'transactions', label: 'Transactions', icon: '💳' },
                { id: 'recurring', label: 'Recurring', icon: '🔄' },
                { id: 'visualization', label: 'Charts', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`mobile-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className="mobile-nav-icon">{tab.icon}</span>
                  <span className="mobile-nav-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="container">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
