import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetCategoriesUseCase } from '../GetCategoriesUseCase';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CategoryId, UserId } from '../../../domain/valueObjects';
import { GetCategoriesDto } from '../../dtos/GetCategoriesDto';

// Mock repository
const mockCategoryRepository: ICategoryRepository = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdAndName: jest.fn(),
  findDefaultByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  isUsedInRoutines: jest.fn(),
  countUsedInRoutines: jest.fn(),
  countByUserId: jest.fn(),
  countActiveByUserId: jest.fn(),
};

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase;
  let mockCategories: Category[];
  let mockAllCategories: Category[];

  beforeEach(() => {
    useCase = new GetCategoriesUseCase(mockCategoryRepository);

    // Create mock active categories
    mockCategories = [
      new Category(
        new CategoryId('550e8400-e29b-41d4-a716-446655440001'),
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        '健康',
        '#4CAF50',
        false,
        true
      ),
      new Category(
        new CategoryId('550e8400-e29b-41d4-a716-446655440002'),
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        '学習',
        '#2196F3',
        false,
        true
      ),
    ];

    // Create mock with inactive category
    mockAllCategories = [
      ...mockCategories,
      new Category(
        new CategoryId('550e8400-e29b-41d4-a716-446655440003'),
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        '非アクティブ',
        '#FF0000',
        false,
        false
      )
    ];

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC021: ユーザーの全アクティブカテゴリを取得できる', async () => {
      // Arrange
      const dto: GetCategoriesDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockCategoryRepository.findByUserId = jest.fn().mockResolvedValue(mockCategories);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.categories).toHaveLength(2);
      expect(result.categories[0].getName()).toBe('健康');
      expect(result.categories[1].getName()).toBe('学習');
      expect(mockCategoryRepository.findByUserId).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        false
      );
    });

    it('TC022: 非アクティブカテゴリも含めて取得できる', async () => {
      // Arrange
      const dto: GetCategoriesDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        includeInactive: true
      };
      mockCategoryRepository.findByUserId = jest.fn().mockResolvedValue(mockAllCategories);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.categories).toHaveLength(3);
      expect(result.categories[2].getName()).toBe('非アクティブ');
      expect(result.categories[2].getIsActive()).toBe(false);
      expect(mockCategoryRepository.findByUserId).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        true
      );
    });
  });

  describe('境界値テストケース', () => {
    it('TC031: カテゴリが存在しない場合空配列を返却する', async () => {
      // Arrange
      const dto: GetCategoriesDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockCategoryRepository.findByUserId = jest.fn().mockResolvedValue([]);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.categories).toHaveLength(0);
      expect(result.categories).toEqual([]);
    });
  });
});