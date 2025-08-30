import { describe, it, expect, beforeEach } from '@jest/globals';
import { UpdateCategoryUseCase } from '../UpdateCategoryUseCase';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { Category } from '../../../domain/entities/Category';
import { CategoryId, UserId } from '../../../domain/valueObjects';
import { UpdateCategoryDto } from '../../dtos/UpdateCategoryDto';
import { 
  DefaultCategoryModificationError,
  CategoryAccessForbiddenError,
  CategoryNotFoundError,
  CategoryNameConflictError,
  CategoryNameEmptyError,
  CategoryNameTooLongError
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

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  let mockCategory: Category;
  let mockDefaultCategory: Category;

  beforeEach(() => {
    useCase = new UpdateCategoryUseCase(mockCategoryRepository);

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
    it('TC041: カテゴリ名を更新できる', async () => {
      // Arrange
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        name: '更新された健康'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);
      mockCategoryRepository.findByUserIdAndName = jest.fn().mockResolvedValue(null);
      mockCategoryRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getName()).toBe('更新された健康');
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC042: カラーを更新できる', async () => {
      // Arrange
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        color: '#FF0000'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);
      mockCategoryRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getColor()).toBe('#FF0000');
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC043: アクティブ状態を更新できる', async () => {
      // Arrange
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        isActive: false
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);
      mockCategoryRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getIsActive()).toBe(false);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('異常系テストケース', () => {
    it('TC051: デフォルトカテゴリの更新を拒否する', async () => {
      // Arrange
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440002',
        name: '更新名'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockDefaultCategory);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(DefaultCategoryModificationError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('TC052: 他ユーザーのカテゴリ更新を拒否する', async () => {
      // Arrange
      const otherUserCategory = new Category(
        new CategoryId('550e8400-e29b-41d4-a716-446655440001'),
        new UserId('550e8400-e29b-41d4-a716-446655440999'), // Different user
        '健康',
        '#4CAF50',
        false,
        true
      );
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        name: '更新名'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(otherUserCategory);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryAccessForbiddenError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('TC053: 存在しないカテゴリの更新を拒否する', async () => {
      // Arrange
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440777',
        name: '更新名'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryNotFoundError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('TC054: 重複する名前での更新を拒否する', async () => {
      // Arrange
      const existingCategory = new Category(
        new CategoryId('550e8400-e29b-41d4-a716-446655440003'),
        new UserId('550e8400-e29b-41d4-a716-446655440000'),
        '重複名'
      );
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        name: '重複名'
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);
      mockCategoryRepository.findByUserIdAndName = jest.fn().mockResolvedValue(existingCategory);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryNameConflictError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('TC055: 空の名前での更新を拒否する', async () => {
      // Arrange
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        name: ''
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryNameEmptyError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('TC056: 長すぎる名前での更新を拒否する', async () => {
      // Arrange
      const longName = 'a'.repeat(51); // 51文字
      const dto: UpdateCategoryDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: '550e8400-e29b-41d4-a716-446655440001',
        name: longName
      };
      mockCategoryRepository.findById = jest.fn().mockResolvedValue(mockCategory);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(CategoryNameTooLongError);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });
});