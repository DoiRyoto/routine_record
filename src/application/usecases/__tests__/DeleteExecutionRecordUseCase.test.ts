import { describe, it, expect, beforeEach } from '@jest/globals';

import { ExecutionRecord } from '../../../domain/entities/ExecutionRecord';
import { IExecutionRecordRepository } from '../../../domain/repositories/IExecutionRecordRepository';
import { ExecutionRecordId, UserId, RoutineId } from '../../../domain/valueObjects';
import { 
  ExecutionRecordNotFoundError,
  ExecutionRecordAccessForbiddenError
} from '../../../shared/types/ExecutionRecordErrors';
import { DeleteExecutionRecordDto } from '../../dtos/DeleteExecutionRecordDto';
import { DeleteExecutionRecordUseCase } from '../DeleteExecutionRecordUseCase';

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

describe('DeleteExecutionRecordUseCase', () => {
  let useCase: DeleteExecutionRecordUseCase;
  let mockExecutionRecord: ExecutionRecord;

  beforeEach(() => {
    useCase = new DeleteExecutionRecordUseCase(mockExecutionRecordRepository);

    mockExecutionRecord = new ExecutionRecord(
      new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440000'),
      new UserId('550e8400-e29b-41d4-a716-446655440001'),
      new RoutineId('550e8400-e29b-41d4-a716-446655440002'),
      new Date('2024-01-01T10:00:00Z'),
      1800,
      'Test memo'
    );

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC061: 自分の実行記録を削除できる', async () => {
      // Arrange
      const dto: DeleteExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(mockExecutionRecord);
      mockExecutionRecordRepository.delete = jest.fn().mockResolvedValue(void 0);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockExecutionRecordRepository.findById).toHaveBeenCalledWith(
        new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440000')
      );
      expect(mockExecutionRecordRepository.delete).toHaveBeenCalledWith(
        new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440000')
      );
    });
  });

  describe('異常系テストケース', () => {
    it('TC071: 他ユーザーの実行記録の削除を拒否する', async () => {
      // Arrange
      const otherUserRecord = new ExecutionRecord(
        new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440000'),
        new UserId('550e8400-e29b-41d4-a716-446655440999'), // Different user
        new RoutineId('550e8400-e29b-41d4-a716-446655440002'),
        new Date('2024-01-01T10:00:00Z'),
        1800,
        'Test memo'
      );
      const dto: DeleteExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440000'
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(otherUserRecord);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ExecutionRecordAccessForbiddenError);
      expect(mockExecutionRecordRepository.delete).not.toHaveBeenCalled();
    });

    it('TC072: 存在しない実行記録の削除を拒否する', async () => {
      // Arrange
      const dto: DeleteExecutionRecordDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        executionRecordId: '550e8400-e29b-41d4-a716-446655440777'
      };
      mockExecutionRecordRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ExecutionRecordNotFoundError);
      expect(mockExecutionRecordRepository.delete).not.toHaveBeenCalled();
    });
  });
});