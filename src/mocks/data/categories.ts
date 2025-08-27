import type { Category } from '@/lib/db/schema';

export const mockCategories: Category[] = [
  {
    id: '1',
    userId: 'user1',
    name: '健康',
    description: '健康に関するルーティン',
    color: '#4CAF50',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: 'user1',
    name: '学習',
    description: '学習・スキルアップに関するルーティン',
    color: '#2196F3',
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    userId: 'user1',
    name: '仕事',
    description: '仕事・キャリアに関するルーティン',
    color: '#FF9800',
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    userId: 'user1',
    name: '趣味',
    description: '趣味・娯楽に関するルーティン',
    color: '#E91E63',
    isActive: true,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
];

// モック関数
export const getMockCategories = (userId: string) =>
  mockCategories.filter(category => category.userId === userId);

export const getMockCategoryById = (id: string) =>
  mockCategories.find(category => category.id === id);

export const getMockActiveCategories = (userId: string) =>
  mockCategories.filter(category => category.userId === userId && category.isActive);

export const createMockCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newCategory: Category = {
    id: Math.random().toString(36).substr(2, 9),
    ...categoryData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockCategories.push(newCategory);
  return newCategory;
};

export const updateMockCategory = (id: string, updates: Partial<Category>) => {
  const index = mockCategories.findIndex(category => category.id === id);
  if (index !== -1) {
    mockCategories[index] = {
      ...mockCategories[index],
      ...updates,
      updatedAt: new Date(),
    };
    return mockCategories[index];
  }
  return null;
};

export const deleteMockCategory = (id: string) => {
  const index = mockCategories.findIndex(category => category.id === id);
  if (index !== -1) {
    return mockCategories.splice(index, 1)[0];
  }
  return null;
};