import { describe, it, expect, beforeEach } from '@jest/globals';
import { UpdateUserSettingsUseCase } from '../UpdateUserSettingsUseCase';
import { IUserSettingsRepository } from '../../../domain/repositories/IUserSettingsRepository';
import { UserSettings } from '../../../domain/entities/UserSettings';
import { UserSettingsId, UserId } from '../../../domain/valueObjects';
import { UpdateUserSettingsDto } from '../../dtos/UpdateUserSettingsDto';
import {
  UserSettingsInvalidThemeError,
  UserSettingsInvalidLanguageError,
  UserSettingsInvalidTimeFormatError,
  UserSettingsEmptyUpdateError
} from '../../../shared/types/UserSettingsErrors';

// Mock repository
const mockUserSettingsRepository: IUserSettingsRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  create: jest.fn()
};

describe('UpdateUserSettingsUseCase', () => {
  let useCase: UpdateUserSettingsUseCase;
  let existingUserSettings: UserSettings;

  beforeEach(() => {
    useCase = new UpdateUserSettingsUseCase(mockUserSettingsRepository);

    // Create mock existing settings
    existingUserSettings = new UserSettings(
      new UserSettingsId('550e8400-e29b-41d4-a716-446655440001'),
      new UserId('550e8400-e29b-41d4-a716-446655440000'),
      'auto',
      'ja',
      '24h',
      new Date('2025-08-30T00:00:00Z'),
      new Date('2025-08-30T00:00:00Z')
    );

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC006: theme設定の更新', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        theme: 'dark'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('dark');
      expect(result.getLanguage()).toBe('ja'); // 変更されていない
      expect(result.getTimeFormat()).toBe('24h'); // 変更されていない
      expect(mockUserSettingsRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC007: language設定の更新', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        language: 'en'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('auto'); // 変更されていない
      expect(result.getLanguage()).toBe('en');
      expect(result.getTimeFormat()).toBe('24h'); // 変更されていない
      expect(mockUserSettingsRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC008: timeFormat設定の更新', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        timeFormat: '12h'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('auto'); // 変更されていない
      expect(result.getLanguage()).toBe('ja'); // 変更されていない
      expect(result.getTimeFormat()).toBe('12h');
      expect(mockUserSettingsRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC009: 複数フィールド同時更新', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        theme: 'light',
        language: 'en',
        timeFormat: '12h'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('light');
      expect(result.getLanguage()).toBe('en');
      expect(result.getTimeFormat()).toBe('12h');
      expect(mockUserSettingsRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC010: 設定が存在しない場合の自動作成と更新', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        theme: 'dark'
      };
      const newUserSettings = UserSettings.createDefault(new UserId(dto.userId));
      
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(null);
      mockUserSettingsRepository.create = jest.fn().mockResolvedValue(newUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('dark');
      expect(result.getLanguage()).toBe('ja'); // デフォルト値
      expect(result.getTimeFormat()).toBe('24h'); // デフォルト値
      expect(mockUserSettingsRepository.create).toHaveBeenCalled();
      expect(mockUserSettingsRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('境界値テストケース', () => {
    it('TC011: theme境界値テスト - light', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        theme: 'light'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('light');
    });

    it('TC011: theme境界値テスト - dark', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        theme: 'dark'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('dark');
    });

    it('TC011: theme境界値テスト - auto', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        theme: 'auto'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTheme()).toBe('auto');
    });

    it('TC012: language境界値テスト - ja', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        language: 'ja'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getLanguage()).toBe('ja');
    });

    it('TC012: language境界値テスト - en', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        language: 'en'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getLanguage()).toBe('en');
    });

    it('TC013: timeFormat境界値テスト - 12h', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        timeFormat: '12h'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTimeFormat()).toBe('12h');
    });

    it('TC013: timeFormat境界値テスト - 24h', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        timeFormat: '24h'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);
      mockUserSettingsRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getTimeFormat()).toBe('24h');
    });
  });

  describe('異常系テストケース', () => {
    it('TC014: 無効なtheme値', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        theme: 'invalid' as any
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(UserSettingsInvalidThemeError);
      expect(mockUserSettingsRepository.save).not.toHaveBeenCalled();
    });

    it('TC015: 無効なlanguage値', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        language: 'invalid' as any
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(UserSettingsInvalidLanguageError);
      expect(mockUserSettingsRepository.save).not.toHaveBeenCalled();
    });

    it('TC016: 無効なtimeFormat値', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        timeFormat: 'invalid' as any
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(UserSettingsInvalidTimeFormatError);
      expect(mockUserSettingsRepository.save).not.toHaveBeenCalled();
    });

    it('TC017: 空のリクエスト', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockUserSettingsRepository.findByUserId = jest.fn().mockResolvedValue(existingUserSettings);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(UserSettingsEmptyUpdateError);
      expect(mockUserSettingsRepository.save).not.toHaveBeenCalled();
    });

    it('TC018: 無効なユーザーID', async () => {
      // Arrange
      const dto: UpdateUserSettingsDto = {
        userId: 'invalid-uuid',
        theme: 'dark'
      };

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('UserIdはUUID形式である必要があります');
      expect(mockUserSettingsRepository.findByUserId).not.toHaveBeenCalled();
      expect(mockUserSettingsRepository.save).not.toHaveBeenCalled();
    });
  });
});