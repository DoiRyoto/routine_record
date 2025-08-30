import { describe, it, expect, beforeEach } from '@jest/globals';
import { DeleteCategoryUseCase } from '../DeleteCategoryUseCase';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CategoryId, UserId } from '../../../domain/valueObjects';
import { DeleteCategoryDto } from '../../dtos/DeleteCategoryDto';
import { 
  DefaultCategoryModificationError,
  CategoryInUseError,
  CategoryAccessForbiddenError,
  CategoryNotFoundError
} from '../../../shared/types/CategoryErrors';

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

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let mockCategory: Category;
  let mockDefaultCategory: Category;

  beforeEach(() => {
    useCase = new DeleteCategoryUseCase(mockCategoryRepository);

    mockCategory = new Category(
      new CategoryId('550e8400-e29b-41d4-a716-446655440001'),
      new UserId('550e8400-e29b-41d4-a716-446655440000'),
      '健康',
      '#4CAF50',
      false,
      true
    );

    mockDefaultCategory = new Category(
      new CategoryId('550e8400-e29b-41d4-a716-446655440002'),
      new UserId('550e8400-e29b-41d4-a716-446655440000'),
      'デフォルト',
      '#000000',
      true, // isDefault = true
      true
    );

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC061: 未使用カテゴリを削除できる', async () => {
      // Arrange
      const dto: DeleteCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);
      mockCategoryRepository.isUsedInRoutines = jest.fn().mockResolvedValue(false);
      mockCategoryRepository.delete = jest.fn().mockResolvedValue(void 0);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockCategoryRepository.findById).toHaveBeenCalledWith(
        new CategoryId('550e8400-e29b-41d4-a716-446655440001')
      );
      expect(mockCategoryRepository.isUsedInRoutines).toHaveBeenCalledWith(
        new CategoryId('550e8400-e29b-41d4-a716-446655440001')
      );
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(
        new CategoryId('550e8400-e29b-41d4-a716-446655440001')
      );
    });
  });

  describe('異常系テストケース', () => {
    it('TC071: デフォルトカテゴリの削除を拒否する', async () => {
      // Arrange
      const dto: DeleteCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440002'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockDefaultCategory);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(DefaultCategoryModificationError);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('TC072: 使用中カテゴリの削除を拒否する', async () => {
      // Arrange
      const dto: DeleteCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);
      mockCategoryRepository.isUsedInRoutines = jest.fn().mockResolvedValue(true);
      mockCategoryRepository.countUsedInRoutines = jest.fn().mockResolvedValue(3);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryInUseError);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('TC073: 他ユーザーのカテゴリ削除を拒否する', async () => {
      // Arrange
      const otherUserCategory = new Category(
        new CategoryId('550e8400-e29b-41d4-a716-446655440001'),
        new UserId('550e8400-e29b-41d4-a716-446655440999'), // Different user
        '健康'
      );
      const dto: DeleteCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(otherUserCategory);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryAccessForbiddenError);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('TC074: 存在しないカテゴリの削除を拒否する', async () => {
      // Arrange
      const dto: DeleteCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440777'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryNotFoundError);
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});