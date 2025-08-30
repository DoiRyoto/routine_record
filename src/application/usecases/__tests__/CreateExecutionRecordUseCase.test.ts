import { describe, it, expect, beforeEach } from '@jest/globals';
import { CreateExecutionRecordUseCase } from '../CreateExecutionRecordUseCase';
import { IExecutionRecordRepository } from '../../../domain/repositories/IExecutionRecordRepository';
import { IRoutineRepository } from '../../../domain/repositories/IRoutineRepository';
import { ExecutionRecord } from '../../../domain/entities/ExecutionRecord';
import { Routine } from '../../../domain/entities/Routine';
import { ExecutionRecordId, UserId, RoutineId, CategoryId, GoalType, RecurrenceType } from '../../../domain/valueObjects';
import { CreateExecutionRecordDto } from '../../dtos/CreateExecutionRecordDto';
import { 
  InactiveRoutineError, 
  InvalidExecutionDateError,
  InvalidDurationError,
  MemoTooLongError
} from '../../../shared/types/ExecutionRecordErrors';
import { NotFoundError } from '../../../shared/types/DomainError';

// Mock repositories
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

const mockRoutineRepository: IRoutineRepository = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByUserIdAndCategoryId: jest.fn(),
  findActiveByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  restore: jest.fn(),
  softDelete: jest.fn(),
  countByUserId: jest.fn(),
  countActiveByUserId: jest.fn(),
};

describe('CreateExecutionRecordUseCase', () => {
  let useCase: CreateExecutionRecordUseCase;
  let validDto: CreateExecutionRecordDto;
  let mockActiveRoutine: Routine;
  let mockInactiveRoutine: Routine;

  beforeEach(() => {
    useCase = new CreateExecutionRecordUseCase(
      mockExecutionRecordRepository,
      mockRoutineRepository
    );

    validDto = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      routineId: '550e8400-e29b-41d4-a716-446655440001',
      executedAt: new Date('2024-01-01T10:00:00Z'),
      duration: 1800, // 30 minutes
      memo: 'Test memo'
    };

    mockActiveRoutine = new Routine(
      new RoutineId('550e8400-e29b-41d4-a716-446655440001'),
      new UserId('550e8400-e29b-41d4-a716-446655440000'),
      'Test Routine',
      'Test Description',
      'カテゴリ1',
      new GoalType('schedule_based'),
      new RecurrenceType('daily'),
      null,
      null,
      1,
      true // isActive: true
    );

    mockInactiveRoutine = new Routine(
      new RoutineId('550e8400-e29b-41d4-a716-446655440001'),
      new UserId('550e8400-e29b-41d4-a716-446655440000'),
      'Test Routine',
      'Test Description',
      'カテゴリ1',
      new GoalType('schedule_based'),
      new RecurrenceType('daily'),
      null,
      null,
      1,
      false // isActive: false
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC001: 有効なデータで実行記録を作成できる', async () => {
      // Arrange
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(mockActiveRoutine);
      mockExecutionRecordRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result).toBeInstanceOf(ExecutionRecord);
      expect(result.getRoutineId().getValue()).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.getDuration()).toBe(1800);
      expect(result.getMemo()).toBe('Test memo');
      expect(mockRoutineRepository.findById).toHaveBeenCalledWith(
        new RoutineId('550e8400-e29b-41d4-a716-446655440001')
      );
      expect(mockExecutionRecordRepository.save).toHaveBeenCalledWith(result);
    });

    it('TC002: 実行時間なしで実行記録を作成できる', async () => {
      // Arrange
      const dtoWithoutDuration = { ...validDto, duration: null };
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(mockActiveRoutine);
      mockExecutionRecordRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dtoWithoutDuration);

      // Assert
      expect(result).toBeInstanceOf(ExecutionRecord);
      expect(result.getDuration()).toBeNull();
    });

    it('TC003: メモなしで実行記録を作成できる', async () => {
      // Arrange
      const dtoWithoutMemo = { ...validDto, memo: null };
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(mockActiveRoutine);
      mockExecutionRecordRepository.save = jest.fn().mockResolvedValue(void 0);

      // Act
      const result = await useCase.execute(dtoWithoutMemo);

      // Assert
      expect(result).toBeInstanceOf(ExecutionRecord);
      expect(result.getMemo()).toBeNull();
    });
  });

  describe('異常系テストケース', () => {
    it('TC011: 非アクティブなルーチンで実行記録作成を拒否する', async () => {
      // Arrange
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(mockInactiveRoutine);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(InactiveRoutineError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC012: 存在しないルーチンで実行記録作成を拒否する', async () => {
      // Arrange
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(NotFoundError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC013: 他ユーザーのルーチンで実行記録作成を拒否する', async () => {
      // Arrange
      const routineOfOtherUser = new Routine(
        new RoutineId('550e8400-e29b-41d4-a716-446655440001'),
        new UserId('550e8400-e29b-41d4-a716-446655440999'), // Different user
        'Test Routine',
        'Test Description',
        'カテゴリ1',
        new GoalType('schedule_based'),
        new RecurrenceType('daily'),
        null,
        null,
        1,
        true
      );
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(routineOfOtherUser);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow('権限がありません');
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC014: 未来日時で実行記録作成を拒否する', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dtoWithFutureDate = { ...validDto, executedAt: futureDate };
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(mockActiveRoutine);

      // Act & Assert
      await expect(useCase.execute(dtoWithFutureDate)).rejects.toThrow(InvalidExecutionDateError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC015: 無効な実行時間で実行記録作成を拒否する', async () => {
      // Arrange
      const dtoWithInvalidDuration = { ...validDto, duration: -30 };
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(mockActiveRoutine);

      // Act & Assert
      await expect(useCase.execute(dtoWithInvalidDuration)).rejects.toThrow(InvalidDurationError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });

    it('TC016: 長すぎるメモで実行記録作成を拒否する', async () => {
      // Arrange
      const longMemo = 'a'.repeat(501); // 501文字
      const dtoWithLongMemo = { ...validDto, memo: longMemo };
      mockRoutineRepository.findById = jest.fn().mockResolvedValue(mockActiveRoutine);

      // Act & Assert
      await expect(useCase.execute(dtoWithLongMemo)).rejects.toThrow(MemoTooLongError);
      expect(mockExecutionRecordRepository.save).not.toHaveBeenCalled();
    });
  });
});