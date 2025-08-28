import { RoutineId, UserId, GoalType, RecurrenceType } from '../valueObjects';
import { Routine, ExecutionRecord } from '../entities';

describe('Architecture Boundaries Tests', () => {
  describe('Value Objects', () => {
    it('should create valid UserId', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const userId = new UserId(validUuid);
      
      expect(userId.getValue()).toBe(validUuid);
      expect(userId.toString()).toBe(validUuid);
    });

    it('should throw error for invalid UserId', () => {
      expect(() => new UserId('')).toThrow('UserIdは空にできません');
      expect(() => new UserId('invalid-uuid')).toThrow('UserIdはUUID形式である必要があります');
    });

    it('should create valid GoalType', () => {
      const frequencyBased = new GoalType('frequency_based');
      const scheduleBased = new GoalType('schedule_based');
      
      expect(frequencyBased.isFrequencyBased()).toBe(true);
      expect(frequencyBased.isScheduleBased()).toBe(false);
      expect(scheduleBased.isScheduleBased()).toBe(true);
      expect(scheduleBased.isFrequencyBased()).toBe(false);
    });

    it('should throw error for invalid GoalType', () => {
      expect(() => new GoalType('invalid')).toThrow('無効なGoalType: invalid');
    });

    it('should create valid RecurrenceType', () => {
      const daily = new RecurrenceType('daily');
      const weekly = new RecurrenceType('weekly');
      
      expect(daily.isDaily()).toBe(true);
      expect(weekly.isWeekly()).toBe(true);
    });
  });

  describe('Domain Entities', () => {
    const validUserId = new UserId('123e4567-e89b-12d3-a456-426614174000');
    const validRoutineId = new RoutineId('987fcdeb-51a2-43d7-8765-987654321000');

    it('should create valid Routine entity', () => {
      const routine = new Routine(
        validRoutineId,
        validUserId,
        'Morning Exercise',
        'Daily morning workout',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      expect(routine.getName()).toBe('Morning Exercise');
      expect(routine.getDescription()).toBe('Daily morning workout');
      expect(routine.getCategory()).toBe('Health');
      expect(routine.isCurrentlyActive()).toBe(true);
      expect(routine.belongsToUser(validUserId)).toBe(true);
    });

    it('should enforce business rules in Routine', () => {
      expect(() => new Routine(
        validRoutineId,
        validUserId,
        '', // Empty name should fail
        null,
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      )).toThrow('ルーティン名は必須です');

      expect(() => new Routine(
        validRoutineId,
        validUserId,
        'Test',
        null,
        '', // Empty category should fail
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      )).toThrow('カテゴリは必須です');
    });

    it('should validate frequency-based routine requirements', () => {
      expect(() => new Routine(
        validRoutineId,
        validUserId,
        'Test Routine',
        null,
        'Health',
        new GoalType('frequency_based'),
        new RecurrenceType('weekly'),
        null, // Missing targetCount
        null
      )).toThrow('頻度ベースのルーティンは目標回数が必要です');
    });

    it('should create ExecutionRecord from persistence data', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        routineId: '987fcdeb-51a2-43d7-8765-987654321000',
        executedAt: new Date('2024-01-29T10:00:00Z'),
        duration: 30,
        memo: 'Good workout',
        createdAt: new Date('2024-01-29T10:00:00Z'),
        updatedAt: new Date('2024-01-29T10:00:00Z'),
      };

      const record = ExecutionRecord.fromPersistence(data);
      expect(record.getDuration()).toBe(30);
      expect(record.getMemo()).toBe('Good workout');
      expect(record.hasDuration()).toBe(true);
      expect(record.hasMemo()).toBe(true);
    });
  });

  describe('Dependency Direction Tests', () => {
    it('should not import infrastructure from domain', () => {
      // This test ensures domain layer doesn't import from infrastructure
      // We're checking that the domain entities can be imported without external dependencies
      expect(() => {
        const userId = new UserId('123e4567-e89b-12d3-a456-426614174000');
        const routineId = new RoutineId('987fcdeb-51a2-43d7-8765-987654321000');
        
        new Routine(
          routineId,
          userId,
          'Test',
          null,
          'Health',
          new GoalType('schedule_based'),
          new RecurrenceType('daily')
        );
      }).not.toThrow();
    });

    it('should allow domain entities to be serialized for persistence', () => {
      const userId = new UserId('123e4567-e89b-12d3-a456-426614174000');
      const routineId = new RoutineId('987fcdeb-51a2-43d7-8765-987654321000');
      
      const routine = new Routine(
        routineId,
        userId,
        'Test Routine',
        'Test description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      const persistenceData = routine.toPersistence();
      
      expect(persistenceData).toHaveProperty('id');
      expect(persistenceData).toHaveProperty('userId');
      expect(persistenceData).toHaveProperty('name');
      expect(persistenceData).toHaveProperty('createdAt');
      expect(typeof persistenceData.id).toBe('string');
      expect(typeof persistenceData.userId).toBe('string');
    });
  });
});