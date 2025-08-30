import { describe, it, expect, beforeEach } from '@jest/globals';

import { UserSettings } from '../../../domain/entities/UserSettings';
import { IUserSettingsRepository } from '../../../domain/repositories/IUserSettingsRepository';
import { UserSettingsId, UserId } from '../../../domain/valueObjects';
import { GetUserSettingsDto } from '../../dtos/GetUserSettingsDto';
import { GetUserSettingsUseCase } from '../GetUserSettingsUseCase';

// Mock repository
const mockUserSettingsRepository: IUserSettingsRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
};

describe('GetUserSettingsUseCase', () => {
  let useCase: GetUserSettingsUseCase;
  let existingUserSettings: UserSettings;

  beforeEach(() => {
    useCase = new GetUserSettingsUseCase(mockUserSettingsRepository);

    // Create mock existing settings
    existingUserSettings = new UserSettings(
      new UserSettingsId('550e8400-e29b-41d4-a716-446655440001'),
      new UserId('550e8400-e29b-41d4-a716-446655440000'),
      'dark',
      'en',
      '12h',
      new Date('2025-08-30T00:00:00Z'),
      new Date('2025-08-30T01:00:00Z')
    );

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC001: 既存設定の正常取得', async () => {
      // Arrange
      const dto: GetUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('dark');
      expect(result.getLanguage()).toBe('en');
      expect(result.getTimeFormat()).toBe('12h');
      expect(mockUserSettingsRepository.findByUserId).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440000')
      );
      expect(mockUserSettingsRepository.create).not.toHaveBeenCalled();
    });

    it('TC002: 非存在設定の自動作成と取得', async () => {
      // Arrange
      const dto: GetUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000'
      };
      const newUserSettings = UserSettings.createDefault(new UserId(dto.userId));
      
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(null);
      mockUserSettingsRepository.create = jest.fn().mockResolvedValue(newUserSettings);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('auto');
      expect(result.getLanguage()).toBe('ja');
      expect(result.getTimeFormat()).toBe('24h');
      expect(mockUserSettingsRepository.findByUserId).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440000')
      );
      expect(mockUserSettingsRepository.create).toHaveBeenCalled();
    });
  });

  describe('境界値テストケース', () => {
    it('TC003: 有効なUUID形式のユーザーID', async () => {
      // Arrange
      const dto: GetUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBe(existingUserSettings);
    });
  });

  describe('異常系テストケース', () => {
    it('TC004: 無効なユーザーID形式', async () => {
      // Arrange
      const dto: GetUserSettingsDto = {
        userId: 'invalid-uuid'
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('UserIdはUUID形式である必要があります');
    });

    it('TC005: 空のユーザーID', async () => {
      // Arrange
      const dto: GetUserSettingsDto = {
        userId: ''
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('UserIdは空にできません');
    });

    it('null値のユーザーID', async () => {
      // Arrange
      const dto: GetUserSettingsDto = {
        userId: null as any
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('UserIdは空にできません');
    });

    it('undefined値のユーザーID', async () => {
      // Arrange
      const dto: GetUserSettingsDto = {
        userId: undefined as any
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('UserIdは空にできません');
    });
  });
});