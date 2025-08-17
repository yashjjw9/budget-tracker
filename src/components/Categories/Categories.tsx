import React, { useState } from 'react';
import { Category } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { DEFAULT_CATEGORIES } from '../../utils/constants';
import './Categories.css';

interface CategoriesProps {
  categories: Category[];
  onAddCategory: (name: string, budget: number) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', budget: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budget = parseFloat(formData.budget);
    
    if (!formData.name.trim() || isNaN(budget) || budget < 0) {
      return;
    }

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, {
        name: formData.name.trim(),
        budget
      });
      setEditingCategory(null);
    } else {
      onAddCategory(formData.name.trim(), budget);
    }

    setFormData({ name: '', budget: '' });
    setShowAddForm(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, budget: category.budget.toString() });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: '', budget: '' });
  };

  const handleQuickAdd = (name: string) => {
    onAddCategory(name, 0);
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const availableSuggestions = DEFAULT_CATEGORIES.filter(
    suggestion => !categories.some(cat => cat.name === suggestion.name)
  );

  return (
    <div className="categories">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Budget Categories</h1>
          <p className="page-subtitle">Manage your spending categories and budget limits</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Budget Summary</h3>
        </div>
        <div className="budget-summary">
          <div className="summary-item">
            <span className="summary-label">Total Categories:</span>
            <span className="summary-value">{categories.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Budget:</span>
            <span className="summary-value">{formatCurrency(totalBudget)}</span>
          </div>
        </div>
      </div>

      {/* Quick Add Suggestions - Enhanced for new users */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">
            {categories.length === 0 ? 'Get Started with Categories' : 'Quick Add Categories'}
          </h3>
          {categories.length === 0 && (
            <p className="card-subtitle">Choose from our suggested categories to begin tracking your budget</p>
          )}
        </div>
        <div className="quick-add-suggestions">
          {availableSuggestions.length > 0 ? (
            availableSuggestions.map(suggestion => (
              <button
                key={suggestion.name}
                onClick={() => handleQuickAdd(suggestion.name)}
                className="suggestion-btn"
                style={{ borderLeftColor: suggestion.color }}
              >
                <span className="suggestion-icon">{suggestion.icon}</span>
                <span className="suggestion-name">{suggestion.name}</span>
                <span className="suggestion-hint">Click to add</span>
              </button>
            ))
          ) : (
            <div className="all-categories-added">
              <p className="text-gray-500 text-center py-6">
                🎉 All suggested categories have been added! You can now create custom categories below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="category-name" className="form-label">Category Name</label>
              <input
                type="text"
                id="category-name"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category-budget" className="form-label">Monthly Budget</label>
              <input
                type="number"
                id="category-budget"
                className="form-input"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Button */}
      {!showAddForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
          >
            + Add Custom Category
          </button>
        </div>
      )}

      {/* Categories List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Categories</h3>
          {categories.length > 0 && (
            <span className="card-subtitle">{categories.length} category{categories.length !== 1 ? 's' : ''} created</span>
          )}
        </div>
        <div className="categories-grid">
          {categories.length === 0 ? (
            <div className="no-categories">
              <div className="no-categories-content">
                <div className="no-categories-icon">🏷️</div>
                <h3 className="no-categories-title">No categories yet</h3>
                <p className="no-categories-description">
                  Start by adding some categories from the suggestions above, or create your own custom category.
                </p>
                <div className="no-categories-actions">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-primary"
                  >
                    Create Custom Category
                  </button>
                </div>
              </div>
            </div>
          ) : (
            categories.map(category => (
              <div key={category.id} className="category-card">
                <div className="card-header-compact">
                  <div className="category-icon" style={{ backgroundColor: category.color }}>
                    {category.icon || '📊'}
                  </div>
                  <div className="category-title">
                    <h4 className="category-name">{category.name}</h4>
                    <div className="category-budget">
                      Monthly Budget: {formatCurrency(category.budget)}
                    </div>
                  </div>
                </div>
                
                <div className="category-actions">
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteCategory(category.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
