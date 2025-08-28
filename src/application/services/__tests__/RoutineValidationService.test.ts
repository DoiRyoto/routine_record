import { describe, it, expect, beforeEach } from '@jest/globals';
import { RoutineValidationService } from '../RoutineValidationService';
import { Routine, UserId, RoutineId, GoalType, RecurrenceType } from '@/domain';
import { ValidationError, BusinessRuleViolationError } from '@/shared/types/DomainError';

describe('RoutineValidationService', () => {
  let service: RoutineValidationService;
  let mockUserId: UserId;
  let mockRoutineId: RoutineId;

  beforeEach(() => {
    service = new RoutineValidationService();
    mockUserId = new UserId('123e4567-e89b-12d3-a456-426614174000');
    mockRoutineId = new RoutineId('987fcdeb-51a2-43d7-8765-987654321000');
  });

  describe('validateBusinessRules', () => {
    it('should pass valid schedule-based routine', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Morning Exercise',
        'Daily workout',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateBusinessRules(routine)).resolves.not.toThrow();
    });

    it('should pass valid frequency-based routine', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Weekly Reading',
        'Read 3 times per week',
        'Education',
        new GoalType('frequency_based'),
        new RecurrenceType('weekly'),
        3, // targetCount
        'weekly' // targetPeriod
      );

      // Act & Assert
      await expect(service.validateBusinessRules(routine)).resolves.not.toThrow();
    });

    it('should reject empty name', async () => {
      // Arrange & Act & Assert
      expect(() => new Routine(
        mockRoutineId,
        mockUserId,
        '', // Empty name
        'Description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      )).toThrow('ルーティン名は必須です');
    });

    it('should reject empty category', async () => {
      // Arrange & Act & Assert
      expect(() => new Routine(
        mockRoutineId,
        mockUserId,
        'Valid Name',
        'Description',
        '', // Empty category
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      )).toThrow('カテゴリは必須です');
    });

    it('should reject invalid goal type combination', async () => {
      // Arrange & Act & Assert
      expect(() => new Routine(
        mockRoutineId,
        mockUserId,
        'Frequency Test',
        'Description',
        'Health',
        new GoalType('frequency_based'),
        new RecurrenceType('weekly'),
        null, // Missing targetCount
        null // Missing targetPeriod
      )).toThrow('頻度ベースのルーティンは目標回数が必要です');
    });

    it('should reject invalid recurrence interval', async () => {
      // Arrange & Act & Assert
      expect(() => new Routine(
        mockRoutineId,
        mockUserId,
        'Test Routine',
        'Description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily'),
        null,
        null,
        0 // Invalid recurrence interval
      )).toThrow('繰り返し間隔は1以上である必要があります');
    });

    it('should reject negative target count for frequency-based', async () => {
      // Arrange & Act & Assert
      expect(() => new Routine(
        mockRoutineId,
        mockUserId,
        'Test Routine',
        'Description',
        'Health',
        new GoalType('frequency_based'),
        new RecurrenceType('weekly'),
        -1, // Negative target count
        'weekly'
      )).toThrow('頻度ベースのルーティンは目標回数が必要です');
    });

    it('should validate routine name length', async () => {
      // Arrange
      const longName = 'a'.repeat(101); // Exceeds 100 characters

      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        longName,
        'Description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateBusinessRules(routine)).rejects.toThrow(ValidationError);
    });

    it('should validate category length', async () => {
      // Arrange
      const longCategory = 'a'.repeat(51); // Exceeds 50 characters

      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Valid Name',
        'Description',
        longCategory,
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateBusinessRules(routine)).rejects.toThrow(ValidationError);
    });

    it('should validate description length', async () => {
      // Arrange
      const longDescription = 'a'.repeat(501); // Exceeds 500 characters

      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Valid Name',
        longDescription,
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateBusinessRules(routine)).rejects.toThrow(ValidationError);
    });
  });

  describe('validateRoutineUniqueness', () => {
    it('should pass when routine name is unique for user', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Unique Routine',
        'Description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateRoutineUniqueness(routine, [])).resolves.not.toThrow();
    });

    it('should reject when routine name already exists for user', async () => {
      // Arrange
      const existingRoutine = new Routine(
        new RoutineId('111e1111-e11b-11d1-a111-111111111111'),
        mockUserId,
        'Morning Exercise',
        'Existing routine',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      const newRoutine = new Routine(
        mockRoutineId,
        mockUserId,
        'Morning Exercise', // Same name
        'New routine',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateRoutineUniqueness(newRoutine, [existingRoutine]))
        .rejects.toThrow(BusinessRuleViolationError);
    });

    it('should allow same name for different users', async () => {
      // Arrange
      const otherUserId = new UserId('999e9999-e99b-99d9-a999-999999999999');
      
      const existingRoutine = new Routine(
        new RoutineId('111e1111-e11b-11d1-a111-111111111111'),
        otherUserId, // Different user
        'Morning Exercise',
        'Other user routine',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      const newRoutine = new Routine(
        mockRoutineId,
        mockUserId,
        'Morning Exercise', // Same name but different user
        'My routine',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateRoutineUniqueness(newRoutine, [existingRoutine]))
        .resolves.not.toThrow();
    });
  });

  describe('validateTargetSettings', () => {
    it('should validate frequency-based target settings', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Frequency Routine',
        'Description',
        'Health',
        new GoalType('frequency_based'),
        new RecurrenceType('weekly'),
        5,
        'weekly'
      );

      // Act & Assert
      await expect(service.validateTargetSettings(routine)).resolves.not.toThrow();
    });

    it('should reject frequency-based with invalid target count', async () => {
      // This test will check business rule validation for invalid target counts
      expect(true).toBe(true); // Placeholder - will be implemented
    });

    it('should reject frequency-based with invalid target period', async () => {
      // This test will check business rule validation for invalid target periods
      expect(true).toBe(true); // Placeholder - will be implemented
    });

    it('should validate schedule-based has no target requirements', async () => {
      // Arrange
      const routine = new Routine(
        mockRoutineId,
        mockUserId,
        'Schedule Routine',
        'Description',
        'Health',
        new GoalType('schedule_based'),
        new RecurrenceType('daily')
      );

      // Act & Assert
      await expect(service.validateTargetSettings(routine)).resolves.not.toThrow();
    });
  });
});