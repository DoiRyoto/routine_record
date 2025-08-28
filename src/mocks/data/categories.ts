import type { Category } from '@/lib/db/schema';

export const mockCategories: Category[] = [
  {
    id: '1',
    userId: 'user1',
    name: '健康',
    color: '#4CAF50',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: 'user1',
    name: '学習',
    color: '#2196F3',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    userId: 'user1',
    name: '仕事',
    color: '#FF9800',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    userId: 'user1',
    name: '趣味',
    color: '#E91E63',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '5',
    userId: 'user2',
    name: '健康',
    color: '#4CAF50',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    userId: 'user2',
    name: '趣味',
    color: '#E91E63',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  },
  {
    id: '7',
    userId: 'user1',
    name: '家事',
    color: '#9C27B0',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
  },
  {
    id: '8',
    userId: 'user1',
    name: 'メンタルケア',
    color: '#00BCD4',
    isDefault: false,
    isActive: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
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
    id: Math.random().toString(36).substring(2, 11),
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