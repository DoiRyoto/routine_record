import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetExecutionRecordsUseCase } from '../GetExecutionRecordsUseCase';
import { IExecutionRecordRepository } from '../../../domain/repositories/IExecutionRecordRepository';
import { ExecutionRecord } from '../../../domain/entities/ExecutionRecord';
import { ExecutionRecordId, UserId, RoutineId } from '../../../domain/valueObjects';
import { GetExecutionRecordsDto } from '../../dtos/GetExecutionRecordsDto';

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

describe('GetExecutionRecordsUseCase', () => {
  let useCase: GetExecutionRecordsUseCase;
  let mockExecutionRecords: ExecutionRecord[];

  beforeEach(() => {
    useCase = new GetExecutionRecordsUseCase(mockExecutionRecordRepository);

    // Create mock execution records
    mockExecutionRecords = [
      new ExecutionRecord(
        new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440000'),
        new UserId('550e8400-e29b-41d4-a716-446655440001'),
        new RoutineId('550e8400-e29b-41d4-a716-446655440002'),
        new Date('2024-01-01T10:00:00Z'),
        1800,
        'Test memo 1'
      ),
      new ExecutionRecord(
        new ExecutionRecordId('550e8400-e29b-41d4-a716-446655440010'),
        new UserId('550e8400-e29b-41d4-a716-446655440001'),
        new RoutineId('550e8400-e29b-41d4-a716-446655440003'),
        new Date('2024-01-02T11:00:00Z'),
        3600,
        'Test memo 2'
      ),
    ];

    jest.clearAllMocks();
  });

  describe('正常系テストケース', () => {
    it('TC021: ユーザーの全実行記録を取得できる', async () => {
      // Arrange
      const dto: GetExecutionRecordsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        page: 1,
        limit: 20
      };
      mockExecutionRecordRepository.findByUserId = jest.fn().mockResolvedValue(mockExecutionRecords);
      mockExecutionRecordRepository.countByUserId = jest.fn().mockResolvedValue(2);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.executionRecords).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.totalPages).toBe(1);
      expect(mockExecutionRecordRepository.findByUserId).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440001')
      );
    });

    it('TC022: ルーチンIDでフィルターできる', async () => {
      // Arrange
      const dto: GetExecutionRecordsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        routineId: '550e8400-e29b-41d4-a716-446655440002',
        page: 1,
        limit: 20
      };
      const filteredRecords = [mockExecutionRecords[0]];
      mockExecutionRecordRepository.findByUserIdAndRoutineId = jest.fn().mockResolvedValue(filteredRecords);
      mockExecutionRecordRepository.countByUserId = jest.fn().mockResolvedValue(1);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.executionRecords).toHaveLength(1);
      expect(result.executionRecords[0].getRoutineId().getValue()).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(mockExecutionRecordRepository.findByUserIdAndRoutineId).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440001'),
        new RoutineId('550e8400-e29b-41d4-a716-446655440002')
      );
    });

    it('TC023: 日付範囲でフィルターできる', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');
      const dto: GetExecutionRecordsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        startDate,
        endDate,
        page: 1,
        limit: 20
      };
      mockExecutionRecordRepository.findByUserIdAndDateRange = jest.fn().mockResolvedValue(mockExecutionRecords);
      mockExecutionRecordRepository.countByUserIdAndDateRange = jest.fn().mockResolvedValue(2);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.executionRecords).toHaveLength(2);
      expect(mockExecutionRecordRepository.findByUserIdAndDateRange).toHaveBeenCalledWith(
        new UserId('550e8400-e29b-41d4-a716-446655440001'),
        startDate,
        endDate
      );
    });

    it('TC024: ページネーションが正しく動作する', async () => {
      // Arrange
      const dto: GetExecutionRecordsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        page: 2,
        limit: 5
      };
      mockExecutionRecordRepository.findByUserId = jest.fn().mockResolvedValue([]);
      mockExecutionRecordRepository.countByUserId = jest.fn().mockResolvedValue(10);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('境界値テストケース', () => {
    it('TC031: 該当する実行記録が存在しない場合', async () => {
      // Arrange
      const dto: GetExecutionRecordsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        page: 1,
        limit: 20
      };
      mockExecutionRecordRepository.findByUserId = jest.fn().mockResolvedValue([]);
      mockExecutionRecordRepository.countByUserId = jest.fn().mockResolvedValue(0);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.executionRecords).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it('TC032: 大量データでのページネーション', async () => {
      // Arrange
      const dto: GetExecutionRecordsDto = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        page: 1,
        limit: 10
      };
      mockExecutionRecordRepository.findByUserId = jest.fn().mockResolvedValue(
        Array(10).fill(null).map((_, i) => mockExecutionRecords[0])
      );
      mockExecutionRecordRepository.countByUserId = jest.fn().mockResolvedValue(100);

      const startTime = Date.now();

      // Act
      const result = await useCase.execute(dto);

      // Assert
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(500); // 500ms以内でレスポンス
      expect(result.executionRecords).toHaveLength(10);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.totalPages).toBe(10);
    });
  });
});