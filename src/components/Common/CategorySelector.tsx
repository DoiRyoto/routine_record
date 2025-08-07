'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  placeholder?: string;
  className?: string;
  allowClear?: boolean;
}

// predefinedCategoriesは削除してDBから取得するように変更

const categoryColors = [
  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
];

export default function CategorySelector({
  value,
  onChange,
  placeholder = 'カテゴリを選択または入力...',
  className = '',
  allowClear = true,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // DBからユーザーのカテゴリ名を取得（認証済みユーザーのみ）
  const fetchCategories = async () => {
    if (!user?.id) {
      setDbCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/categories?names=true');

      if (!response.ok) {
        throw new Error('カテゴリの取得に失敗しました');
      }

      const result = await response.json();
      setDbCategories(result.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setDbCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user?.id]);

  // 利用可能なカテゴリを統合（useMemoでメモ化）
  const allCategories = useMemo(() => {
    return (dbCategories || []).sort();
  }, [dbCategories]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue) {
      const filtered = allCategories.filter(
        (category) =>
          category.toLowerCase().includes(inputValue.toLowerCase()) && category !== inputValue
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(allCategories);
    }
  }, [inputValue, allCategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleCategorySelect = (category: string) => {
    setInputValue(category);
    onChange(category);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleCreateNewCategory = async () => {
    if (!inputValue.trim() || allCategories.includes(inputValue.trim())) {
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: inputValue.trim(),
          color: categoryColors[Math.floor(Math.random() * categoryColors.length)],
        }),
      });

      if (!response.ok) {
        throw new Error('カテゴリの作成に失敗しました');
      }

      // データを再取得してカテゴリリストを更新
      await fetchCategories();

      // 新しいカテゴリを選択状態にする
      const newCategory = inputValue.trim();
      onChange(newCategory);
      setIsOpen(false);
      inputRef.current?.blur();
    } catch (error) {
      // エラーハンドリング
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const getCategoryColor = (category: string) => {
    const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return categoryColors[index % categoryColors.length];
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg 
                     bg-white text-gray-900 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white
                     dark:focus:ring-blue-400 dark:focus:border-blue-400
                     transition-colors"
        />

        {value && allowClear && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(value)}`}
            >
              {value}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg
                className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {value && !allowClear && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(value)}`}
            >
              {value}
            </span>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            <div className="p-2">
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((category, index) => (
                  <button
                    key={`${category}-${index}`}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full transition-colors
                               hover:opacity-80 ${getCategoryColor(category)}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2">
              {inputValue && !allCategories.includes(inputValue.trim()) ? (
                <button
                  type="button"
                  onClick={handleCreateNewCategory}
                  disabled={loading}
                  className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 
                           hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + "{inputValue.trim()}" を作成
                </button>
              ) : (
                <div className="p-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                  {loading ? '読み込み中...' : error ? `エラー: ${error}` : 'カテゴリがありません'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
