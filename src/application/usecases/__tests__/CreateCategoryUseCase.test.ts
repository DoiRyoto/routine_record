import { describe, it, expect, beforeEach } from '@jest/globals';

import { Category } from '../../../domain/entities/Category';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CategoryId, UserId } from '../../../domain/valueObjects';
import { 
  CategoryNameConflictError,
  CategoryNameEmptyError,
  CategoryNameTooLongError
} from '../../../shared/types/CategoryErrors';
import { CreateCategoryDto } from '../../dtos/CreateCategoryDto';
import { CreateCategoryUseCase } from '../CreateCategoryUseCase';

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

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let validDto: CreateCategoryDto;

  beforeEach(() => {
    useCase = new CreateCategoryUseCase(mockCategoryRepository);

    validDto = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'テストカテゴリ',
      color: '#4CAF50'
    };

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC001: 有効なデータでカテゴリを作成できる', async () => {
      // Arrange
      mockCategoryRepository.findByUserIdAndName = jest.fn().mockResolvedValue(null);
      mockCategoryRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result).toBeInstanceOf(Category);
      expect(result.getName()).toBe('テストカテゴリ');
      expect(result.getColor()).toBe('#4CAF50');
      expect(result.getIsDefault()).toBe(false);
      expect(result.getIsActive()).toBe(true);
      expect(mockCategoryRepository.findByUserIdAndName).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        'テストカテゴリ'
      );
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC002: デフォルトカラーでカテゴリを作成できる', async () => {
      // Arrange
      const dtoWithoutColor = { ...validDto, color: undefined };
      mockCategoryRepository.findByUserIdAndName = jest.fn().mockResolvedValue(null);
      mockCategoryRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dtoWithoutColor);

      // Assert
      expect(result).toBeInstanceOf(Category);
      expect(result.getColor()).toBe('bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200');
    });
  });

  describe('異常系テストケース', () => {
    it('TC011: 空の名前でカテゴリ作成を拒否する', async () => {
      // Arrange
      const dtoWithEmptyName = { ...validDto, name: '' };

      // Act & Assert
      await expect(useCase.execute(dtoWithEmptyName)).rejects.toThrow(CategoryNameEmptyError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('TC012: 長すぎる名前でカテゴリ作成を拒否する', async () => {
      // Arrange
      const longName = 'a'.repeat(51); // 51文字
      const dtoWithLongName = { ...validDto, name: longName };

      // Act & Assert
      await expect(useCase.execute(dtoWithLongName)).rejects.toThrow(CategoryNameTooLongError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('TC013: 重複する名前でカテゴリ作成を拒否する', async () => {
      // Arrange
      const existingCategory = new Category(
        new CategoryId('550e8400-e29b-41d4-a716-446655440001'),
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        'テストカテゴリ'
      );
      mockCategoryRepository.findByUserIdAndName = jest.fn().mockResolvedValue(existingCategory);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(CategoryNameConflictError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });
});