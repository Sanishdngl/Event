import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Check, X, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import api from '../../../utils/api';

const CategoriesManagement = ({ isDarkMode }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editParentCategory, setEditParentCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const componentClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.safeGet('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Organize categories into a hierarchical structure
  const organizeCategories = () => {
    const categoryMap = new Map();
    const rootCategories = [];

    // First, create a map of all categories
    categories.forEach(category => {
      categoryMap.set(category._id, { ...category, children: [] });
    });

    // Then, organize them into a tree structure
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category._id);
      if (category.parentCategory?._id) {
        const parent = categoryMap.get(category.parentCategory._id);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  };

  const getCategoryNameById = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.categoryName : '';
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Recursive component to render category and its children
  const CategoryRow = ({ category, level = 0, parentPath = [] }) => {
    const isExpanded = expandedCategories.has(category._id);
    const hasChildren = category.children && category.children.length > 0;
    const indentation = level * 24; // 24px indentation per level

    return (
      <>
        <tr className={`border-b border-gray-700 ${!category.isActive ? 'opacity-50' : ''}`}>
          <td className="py-4">
            <div className="flex items-center" style={{ paddingLeft: `${indentation}px` }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 mr-2"
                  onClick={() => toggleExpand(category._id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-8" />}
              {editingCategory === category._id ? (
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                category.categoryName
              )}
            </div>
          </td>
          <td className="py-4">
            {editingCategory === category._id ? (
              <Select 
                value={editParentCategory}
                onValueChange={setEditParentCategory}
              >
                <SelectTrigger className="w-48">
                <SelectValue>
        {editParentCategory ? getCategoryNameById(editParentCategory) : "Parent Category"}
      </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories
                    .filter(cat => 
                      cat._id !== category._id && 
                      !parentPath.includes(cat._id) &&
                      cat.isActive
                    )
                    .map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            ) : (
              category.parentCategory?.categoryName || '-'
            )}
          </td>
          <td className="py-4">
            <span className={`px-2 py-1 rounded-full text-sm ${
              category.isActive
                ? 'bg-green-500/20 text-green-500'
                : 'bg-red-500/20 text-red-500'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="py-4">
            <div className="flex justify-end gap-2">
              {editingCategory === category._id ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateCategory(category._id)}
                    className="text-green-400 hover:text-green-500 hover:bg-green-500/10"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEditing}
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  {category.isActive ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(category)}
                        className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeactivateCategory(category._id)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReactivateCategory(category._id)}
                      className="text-green-400 hover:text-green-500 hover:bg-green-500/10"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && (
          category.children.map(child => (
            <CategoryRow 
              key={child._id} 
              category={child} 
              level={level + 1}
              parentPath={[...parentPath, category._id]}
            />
          ))
        )}
      </>
    );
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setError(null);
      const response = await api.safePost('/categories', {
        categoryName: newCategoryName,
        parentCategory: parentCategory || null
      });

      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setParentCategory('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.message);
    }
  };

  const handleDeactivateCategory = async (categoryId) => {
    try {
      setError(null);
      await api.safePatch(`/categories/${categoryId}/deactivate`);
      
      setCategories(categories.map(category => 
        category._id === categoryId 
          ? { ...category, isActive: false }
          : category
      ));
    } catch (err) {
      console.error('Error deactivating category:', err);
      setError(err.message || 'Failed to deactivate category');
    }
  };

  const handleReactivateCategory = async (categoryId) => {
    try {
      setError(null);
      await api.safePatch(`/categories/${categoryId}/reactivate`);
      
      setCategories(categories.map(category => 
        category._id === categoryId 
          ? { ...category, isActive: true }
          : category
      ));
    } catch (err) {
      console.error('Error reactivating category:', err);
      setError(err.message);
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    try {
      setError(null);
      const response = await api.safePut(`/categories/${categoryId}`, {
        categoryName: editName,
        parentCategory: editParentCategory || null
      });

      setCategories(categories.map(cat => 
        cat._id === categoryId ? response.data : cat
      ));
      setEditingCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message);
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category._id);
    setEditName(category.categoryName);
    setEditParentCategory(category.parentCategory?._id || '');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
    setEditParentCategory('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const activeCategories = categories.filter(cat => cat.isActive);
  const organizedCategories = organizeCategories();

  return (
    <div className="space-y-6">
      {error && (
        <div className={`p-4 border-l-4 rounded-md ${
          isDarkMode ? 'bg-red-900/20 border-red-500 text-red-300' : 'bg-red-100 border-red-500 text-red-700'
        }`}>
          <p>Error: {error}</p>
        </div>
      )}

      <div className={`${componentClass} border rounded-xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Categories Management</h3>
              <p className="text-sm opacity-60">Manage event categories</p>
            </div>
            <Tag className="w-6 h-6 text-indigo-500" />
          </div>

          {/* Add Category Form */}
          <div className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1"
                />
                <Select 
                  value={parentCategory}
                  onValueChange={setParentCategory}
                >
                  <SelectTrigger className="w-48">
                  <SelectValue>
        {parentCategory ? getCategoryNameById(parentCategory) : "Parent Category"}
      </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {activeCategories.map(category => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddCategory}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-left font-medium opacity-60">Name</th>
                  <th className="pb-3 text-left font-medium opacity-60">Parent Category</th>
                  <th className="pb-3 text-left font-medium opacity-60">Status</th>
                  <th className="pb-3 text-right font-medium opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizedCategories.map(category => (
                  <CategoryRow 
                    key={category._id} 
                    category={category}
                    parentPath={[]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement;