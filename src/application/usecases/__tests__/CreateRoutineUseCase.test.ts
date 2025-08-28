import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateRoutineUseCase } from '../CreateRoutineUseCase';
import { CreateRoutineDto } from '../../dtos/CreateRoutineDto';
import { IRoutineRepository } from '@/domain/repositories/IRoutineRepository';
import { RoutineValidationService } from '../../services/RoutineValidationService';
import { Routine, RoutineId, UserId } from '@/domain';
import { ValidationError, BusinessRuleViolationError } from '@/shared/types/DomainError';

describe('CreateRoutineUseCase', () => {
  let useCase: CreateRoutineUseCase;
  let mockRoutineRepository: jest.Mocked<IRoutineRepository>;
  let mockValidationService: jest.Mocked<RoutineValidationService>;

  beforeEach(() => {
    // Mock repository
    mockRoutineRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByUserIdAndId: jest.fn(),
      findByUserIdAndCategory: jest.fn(),
      findScheduledForDate: jest.fn(),
      findFrequencyBasedByUserId: jest.fn(),
      countByUserId: jest.fn(),
      countActiveByUserId: jest.fn(),
    } as jest.Mocked<IRoutineRepository>;

    // Mock validation service
    mockValidationService = {
      validateBusinessRules: jest.fn(),
      validateRoutineUniqueness: jest.fn(),
      validateTargetSettings: jest.fn(),
    } as any;

    useCase = new CreateRoutineUseCase(mockRoutineRepository, mockValidationService);
  });

  describe('execute', () => {
    const validDto = new CreateRoutineDto({
      name: 'Morning Exercise',
      description: 'Daily workout routine',
      category: 'Health',
      goalType: 'schedule_based',
      recurrenceType: 'daily',
      userId: '123e4567-e89b-12d3-a456-426614174000',
    });

    it('should create routine with valid data', async () => {
      // Arrange
      mockValidationService.validateBusinessRules.mockResolvedValue();
      mockRoutineRepository.save.mockResolvedValue();

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockValidationService.validateBusinessRules).toHaveBeenCalledTimes(1);
      expect(mockRoutineRepository.save).toHaveBeenCalledTimes(1);
      
      const savedRoutine = mockRoutineRepository.save.mock.calls[0][0];
      expect(savedRoutine).toBeInstanceOf(Routine);
      expect(savedRoutine.getName()).toBe('Morning Exercise');
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidDto = new CreateRoutineDto({
        name: '', // Empty name
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        userId: '123e4567-e89b-12d3-a456-426614174000',
      });

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      expect(mockRoutineRepository.save).not.toHaveBeenCalled();
    });

    it('should validate frequency-based requirements', async () => {
      // Arrange
      const frequencyDto = new CreateRoutineDto({
        name: 'Frequency Test',
        category: 'Health',
        goalType: 'frequency_based',
        recurrenceType: 'weekly',
        // Missing targetCount and targetPeriod
        userId: '123e4567-e89b-12d3-a456-426614174000',
      });

      mockValidationService.validateBusinessRules.mockRejectedValue(
        new BusinessRuleViolationError('頻度ベースのルーティンは目標回数が必要です')
      );

      // Act & Assert
      await expect(useCase.execute(frequencyDto)).rejects.toThrow(BusinessRuleViolationError);
      expect(mockRoutineRepository.save).not.toHaveBeenCalled();
    });

    it('should generate unique routine ID', async () => {
      // Arrange
      mockValidationService.validateBusinessRules.mockResolvedValue();
      mockRoutineRepository.save.mockResolvedValue();

      // Act
      const result1 = await useCase.execute(validDto);
      const result2 = await useCase.execute(validDto);

      // Assert
      expect(result1.isSuccess).toBe(true);
      expect(result2.isSuccess).toBe(true);
      expect(mockRoutineRepository.save).toHaveBeenCalledTimes(2);
      
      const routine1 = mockRoutineRepository.save.mock.calls[0][0] as Routine;
      const routine2 = mockRoutineRepository.save.mock.calls[1][0] as Routine;
      
      expect(routine1.getId().getValue()).not.toBe(routine2.getId().getValue());
    });

    it('should set default values correctly', async () => {
      // Arrange
      const minimalDto = new CreateRoutineDto({
        name: 'Minimal Routine',
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        // description, recurrenceInterval not provided
      });

      mockValidationService.validateBusinessRules.mockResolvedValue();
      mockRoutineRepository.save.mockResolvedValue();

      // Act
      const result = await useCase.execute(minimalDto);

      // Assert
      expect(result.isSuccess).toBe(true);
      
      const savedRoutine = mockRoutineRepository.save.mock.calls[0][0] as Routine;
      expect(savedRoutine.getDescription()).toBe(null);
      expect(savedRoutine.getRecurrenceInterval()).toBe(1); // Default value
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockValidationService.validateBusinessRules.mockResolvedValue();
      mockRoutineRepository.save.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('Database connection failed');
    });

    it('should handle validation service errors', async () => {
      // Arrange
      const validationError = new BusinessRuleViolationError('カテゴリが重複しています');
      mockValidationService.validateBusinessRules.mockRejectedValue(validationError);

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(BusinessRuleViolationError);
      expect(mockRoutineRepository.save).not.toHaveBeenCalled();
    });

    it('should validate DTO before processing', async () => {
      // Arrange
      const invalidDto = new CreateRoutineDto({
        name: 'Valid Name',
        category: '', // Invalid empty category
        goalType: 'invalid_goal_type' as any, // Invalid enum
        recurrenceType: 'daily',
        userId: 'invalid-uuid', // Invalid UUID format
      });

      // Act & Assert
      await expect(useCase.execute(invalidDto)).rejects.toThrow(ValidationError);
      expect(mockValidationService.validateBusinessRules).not.toHaveBeenCalled();
      expect(mockRoutineRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('private methods', () => {
    it('should generate valid UUID for routine ID', () => {
      // This test will be implemented when we add ID generation logic
      expect(true).toBe(true); // Placeholder
    });

    it('should convert DTO to domain entity correctly', () => {
      // This test will be implemented when we add conversion logic
      expect(true).toBe(true); // Placeholder
    });
  });
});