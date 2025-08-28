import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DrizzleRoutineRepository } from '../DrizzleRoutineRepository';
import { Routine, RoutineId, UserId, GoalType, RecurrenceType } from '@/domain';

// Mock Drizzle DB
const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock the database import
jest.mock('@/lib/db/index', () => ({
  db: mockDb,
}));

describe('DrizzleRoutineRepository', () => {
  let repository: DrizzleRoutineRepository;
  let mockUserId: UserId;
  let mockRoutineId: RoutineId;

  beforeEach(() => {
    repository = new DrizzleRoutineRepository();
    mockUserId = new UserId('123e4567-e89b-12d3-a456-426614174000');
    mockRoutineId = new RoutineId('987fcdeb-51a2-43d7-8765-987654321000');
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return routine when found', async () => {
      // Arrange
      const mockDbData = {
        id: mockRoutineId.getValue(),
        userId: mockUserId.getValue(),
        name: 'Morning Exercise',
        description: 'Daily workout',
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        targetCount: null,
        targetPeriod: null,
        recurrenceInterval: 1,
        isActive: true,
        createdAt: new Date('2024-01-29T10:00:00Z'),
        updatedAt: new Date('2024-01-29T10:00:00Z'),
        deletedAt: null,
      };

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockDbData]),
      };
      
      mockDb.select.mockReturnValue(mockQuery);

      // Act
      const result = await repository.findById(mockRoutineId);

      // Assert
      expect(result).toBeInstanceOf(Routine);
      expect(result?.getName()).toBe('Morning Exercise');
      expect(result?.getId().equals(mockRoutineId)).toBe(true);
      expect(result?.getUserId().equals(mockUserId)).toBe(true);
    });

    it('should return null when not found', async () => {
      // Arrange
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      
      mockDb.select.mockReturnValue(mockQuery);

      // Act
      const result = await repository.findById(mockRoutineId);

      // Assert
      expect(result).toBeNull();
    });

    it('should filter deleted routines', async () => {
      // Arrange
      const mockDbData = {
        id: mockRoutineId.getValue(),
        userId: mockUserId.getValue(),
        name: 'Deleted Routine',
        description: null,
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        targetCount: null,
        targetPeriod: null,
        recurrenceInterval: 1,
        isActive: true,
        createdAt: new Date('2024-01-29T10:00:00Z'),
        updatedAt: new Date('2024-01-29T10:00:00Z'),
        deletedAt: new Date('2024-01-29T12:00:00Z'), // Deleted
      };

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockDbData]),
      };
      
      mockDb.select.mockReturnValue(mockQuery);

      // Act
      const result = await repository.findById(mockRoutineId);

      // Assert
      expect(result).toBeNull(); // Should be filtered out
    });
  });

  describe('findByUserId', () => {
    it('should return user routines sorted by createdAt desc', async () => {
      // Arrange
      const mockDbData = [
        {
          id: '111e1111-e11b-11d1-a111-111111111111',
          userId: mockUserId.getValue(),
          name: 'Latest Routine',
          description: null,
          category: 'Health',
          goalType: 'schedule_based',
          recurrenceType: 'daily',
          targetCount: null,
          targetPeriod: null,
          recurrenceInterval: 1,
          isActive: true,
          createdAt: new Date('2024-01-29T12:00:00Z'),
          updatedAt: new Date('2024-01-29T12:00:00Z'),
          deletedAt: null,
        },
        {
          id: '222e2222-e22b-22d2-a222-222222222222',
          userId: mockUserId.getValue(),
          name: 'Older Routine',
          description: null,
          category: 'Health',
          goalType: 'schedule_based',
          recurrenceType: 'daily',
          targetCount: null,
          targetPeriod: null,
          recurrenceInterval: 1,
          isActive: true,
          createdAt: new Date('2024-01-29T10:00:00Z'),
          updatedAt: new Date('2024-01-29T10:00:00Z'),
          deletedAt: null,
        },
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockDbData),
      };
      
      mockDb.select.mockReturnValue(mockQuery);

      // Act
      const result = await repository.findByUserId(mockUserId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].getName()).toBe('Latest Routine');
      expect(result[1].getName()).toBe('Older Routine');
    });

    it('should return empty array when no routines', async () => {
      // Arrange
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([]),
      };
      
      mockDb.select.mockReturnValue(mockQuery);

      // Act
      const result = await repository.findByUserId(mockUserId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should insert new routine', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'New Routine',
        'Test description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      const mockDbData = routine.toPersistence();
      
      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockResolvedValue([mockDbData]),
      };
      
      mockDb.insert.mockReturnValue(mockQuery);

      // Act
      await repository.save(routine);

      // Assert
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQuery.values).toHaveBeenCalledWith(mockDbData);
    });

    it('should update existing routine', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Updated Routine',
        'Updated description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      const mockDbData = routine.toPersistence();
      
      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockResolvedValue([mockDbData]),
      };
      
      mockDb.insert.mockReturnValue(mockQuery);

      // Act
      await repository.save(routine);

      // Assert
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQuery.onConflictDoUpdate).toHaveBeenCalled();
    });

    it('should handle frequency-based routine', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Frequency Routine',
        'Test description',
        'Health',
        new GoalType('frequency_based'),
        new RecurrenceType('weekly'),
        5, // targetCount
        'weekly' // targetPeriod
      );

      const mockDbData = routine.toPersistence();
      
      const mockQuery = {
        values: jest.fn().mockReturnThis(),
        onConflictDoUpdate: jest.fn().mockResolvedValue([mockDbData]),
      };
      
      mockDb.insert.mockReturnValue(mockQuery);

      // Act
      await repository.save(routine);

      // Assert
      expect(mockDb.insert).toHaveBeenCalled();
      const savedData = mockQuery.values.mock.calls[0][0];
      expect(savedData.targetCount).toBe(5);
      expect(savedData.targetPeriod).toBe('weekly');
    });
  });

  describe('delete', () => {
    it('should soft delete routine', async () => {
      // Arrange
      const mockQuery = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ id: mockRoutineId.getValue() }]),
      };
      
      mockDb.update.mockReturnValue(mockQuery);

      // Act
      await repository.delete(mockRoutineId);

      // Assert
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockQuery.set).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date),
        })
      );
    });
  });

  describe('findActiveByUserId', () => {
    it('should return only active routines', async () => {
      // Arrange
      const mockDbData = [
        {
          id: '111e1111-e11b-11d1-a111-111111111111',
          userId: mockUserId.getValue(),
          name: 'Active Routine',
          description: null,
          category: 'Health',
          goalType: 'schedule_based',
          recurrenceType: 'daily',
          targetCount: null,
          targetPeriod: null,
          recurrenceInterval: 1,
          isActive: true,
          createdAt: new Date('2024-01-29T10:00:00Z'),
          updatedAt: new Date('2024-01-29T10:00:00Z'),
          deletedAt: null,
        },
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(mockDbData),
      };
      
      mockDb.select.mockReturnValue(mockQuery);

      // Act
      const result = await repository.findActiveByUserId(mockUserId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].getName()).toBe('Active Routine');
      expect(result[0].isCurrentlyActive()).toBe(true);
    });
  });
});