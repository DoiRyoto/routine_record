import { describe, it, expect, beforeEach } from '@jest/globals';

import { ExecutionRecord } from '../../../domain/entities/ExecutionRecord';
import { IExecutionRecordRepository } from '../../../domain/repositories/IExecutionRecordRepository';
import { ExecutionRecordId, UserId, RoutineId } from '../../../domain/valueObjects';
import { 
  ExecutionRecordNotFoundError,
  ExecutionRecordAccessForbiddenError,
  InvalidExecutionDateError,
  InvalidDurationError,
  MemoTooLongError
} from '../../../shared/types/ExecutionRecordErrors';
import { UpdateExecutionRecordDto } from '../../dtos/UpdateExecutionRecordDto';
import { UpdateExecutionRecordUseCase } from '../UpdateExecutionRecordUseCase';

// Mock repository
const mockExecutionRecordRepository: IExecutionRecordRepository = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByRoutineId: jest.fn(),
  findByUserIdAndRoutineId: jest.fn(),
  findByUserIdAndDateRange: jest.fn(),
  findByRoutineIdAndDateRange: jest.fn(),
  findByUserIdAndDate: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  existsTodayByRoutineId: jest.fn(),
  existsByRoutineIdAndDate: jest.fn(),
  countByUserId: jest.fn(),
  countByRoutineId: jest.fn(),
  countByUserIdAndDateRange: jest.fn(),
  findLatestStreakByRoutineId: jest.fn(),
  findWeeklyByUserIdAndWeek: jest.fn(),
  findMonthlyByUserIdAndMonth: jest.fn(),
};

describe('UpdateExecutionRecordUseCase', () => {
  let useCase: UpdateExecutionRecordUseCase;
  let mockExecutionRecord: ExecutionRecord;

  beforeEach(() => {
    useCase = new UpdateExecutionRecordUseCase(mockExecutionRecordRepository);

    mockExecutionRecord = new ExecutionRecord(
      new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440000'),
      new UserId('550e8400-e29b-41d4-a716-446655440001'),
      new RoutineId('550e8400-e29b-41d4-a716-446655440002'),
      new Date('2024-01-01T10:00:00Z'),
      1800,
      'Original memo'
    );

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC041: 実行時間を更新できる', async () => {
      // Arrange
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000',
        duration: 3600
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(mockExecutionRecord);
      mockExecutionRecordRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getDuration()).toBe(3600);
      expect(mockExecutionRecordRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC042: メモを更新できる', async () => {
      // Arrange
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000',
        memo: 'Updated memo'
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(mockExecutionRecord);
      mockExecutionRecordRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getMemo()).toBe('Updated memo');
      expect(mockExecutionRecordRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC043: 実行日時を更新できる', async () => {
      // Arrange
      const newExecutedAt = new Date('2024-01-01T12:00:00Z');
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000',
        executedAt: newExecutedAt
      };
      
      // 新しい実行日時で ExecutionRecord を作成し直す必要があるので、
      // 実際の実装では ExecutionRecord を再作成することになる
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(mockExecutionRecord);
      mockExecutionRecordRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.getExecutedAt()).toEqual(newExecutedAt);
      expect(mockExecutionRecordRepository.save).toHaveBeenCalledWith(result);
    });
  });

  describe('異常系テストケース', () => {
    it('TC051: 他ユーザーの実行記録を更新を拒否する', async () => {
      // Arrange
      const otherUserRecord = new ExecutionRecord(
        new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440000'),
        new UserId('550e8400-e29b-41d4-a716-446655440999'), // Different user
        new RoutineId('550e8400-e29b-41d4-a716-446655440002'),
        new Date('2024-01-01T10:00:00Z'),
        1800,
        'Original memo'
      );
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000',
        duration: 3600
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(otherUserRecord);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ExecutionRecordAccessForbiddenError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC052: 存在しない実行記録の更新を拒否する', async () => {
      // Arrange
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440777',
        duration: 3600
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ExecutionRecordNotFoundError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC053: 無効な実行時間での更新を拒否する', async () => {
      // Arrange
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000',
        duration: -30
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(mockExecutionRecord);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(InvalidDurationError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC054: 長すぎるメモでの更新を拒否する', async () => {
      // Arrange
      const longMemo = 'a'.repeat(501); // 501文字
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000',
        memo: longMemo
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(mockExecutionRecord);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(MemoTooLongError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC055: 未来日時での更新を拒否する', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dto: UpdateExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000',
        executedAt: futureDate
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(mockExecutionRecord);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(InvalidExecutionDateError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });
  });
});