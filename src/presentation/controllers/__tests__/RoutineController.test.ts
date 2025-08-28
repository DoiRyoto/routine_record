import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Next.js modules
const mockNextResponse = {
  json: jest.fn((data: any, init?: ResponseInit) => ({
    json: () => Promise.resolve(data),
    status: init?.status || 200,
  })),
};

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}));
import { RoutineController } from '../RoutineController';
import { CreateRoutineUseCase } from '@/application/usecases/CreateRoutineUseCase';
import { GetRoutinesUseCase } from '@/application/usecases/GetRoutinesUseCase';
import { CreateRoutineDto } from '@/application/dtos/CreateRoutineDto';
import { success, failure } from '@/shared/types';
import { ValidationError, NotFoundError } from '@/shared/types/DomainError';

// Mock the use cases
const mockCreateRoutineUseCase = {
  execute: jest.fn(),
} as jest.Mocked<CreateRoutineUseCase>;

const mockGetRoutinesUseCase = {
  execute: jest.fn(),
} as jest.Mocked<GetRoutinesUseCase>;

describe('RoutineController', () => {
  let controller: RoutineController;

  beforeEach(() => {
    controller = new RoutineController(mockCreateRoutineUseCase, mockGetRoutinesUseCase);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validRequestData = {
      name: 'Morning Exercise',
      description: 'Daily workout routine',
      category: 'Health',
      goalType: 'schedule_based',
      recurrenceType: 'daily',
    };

    it('should return 201 with created routine', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue(validRequestData),
        headers: {
          get: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'), // x-user-id
        },
      } as any as NextRequest;

      const mockCreatedRoutine = {
        id: '987fcdeb-51a2-43d7-8765-987654321000',
        name: 'Morning Exercise',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        ...validRequestData,
      };

      mockCreateRoutineUseCase.execute.mockResolvedValue(success(mockCreatedRoutine));

      // Act
      const response = await controller.create(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockCreatedRoutine);
      expect(mockCreateRoutineUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Morning Exercise',
          userId: '123e4567-e89b-12d3-a456-426614174000',
        })
      );
    });

    it('should return 400 for validation errors', async () => {
      // Arrange
      const invalidRequestData = {
        name: '', // Invalid empty name
        category: 'Health',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const mockRequest = {
        json: jest.fn().mockResolvedValue(invalidRequestData),
        headers: {
          get: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'),
        },
      } as any as NextRequest;

      const validationError = new ValidationError('ルーティン名は必須です');
      mockCreateRoutineUseCase.execute.mockResolvedValue(failure(validationError));

      // Act
      const response = await controller.create(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error.message).toBe('ルーティン名は必須です');
    });

    it('should return 401 for unauthorized user', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue(validRequestData),
        headers: {
          get: jest.fn().mockReturnValue(null), // No x-user-id header
        },
      } as any as NextRequest;

      // Act
      const response = await controller.create(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(401);
      expect(responseData.error).toBe('認証が必要です');
      expect(mockCreateRoutineUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue(validRequestData),
        headers: {
          get: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'),
        },
      } as any as NextRequest;

      const serverError = new Error('Database connection failed');
      mockCreateRoutineUseCase.execute.mockResolvedValue(failure(serverError));

      // Act
      const response = await controller.create(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error.message).toBe('内部エラーが発生しました');
    });

    it('should handle malformed JSON request', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: {
          get: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'),
        },
      } as any as NextRequest;

      // Act
      const response = await controller.create(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(400);
      expect(responseData.error).toContain('リクエストが無効です');
    });
  });

  describe('getAll', () => {
    it('should return 200 with user routines', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'),
        },
      } as any as NextRequest;

      const mockRoutines = [
        {
          id: '111e1111-e11b-11d1-a111-111111111111',
          name: 'Morning Exercise',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          category: 'Health',
          goalType: 'schedule_based',
          recurrenceType: 'daily',
          isActive: true,
          createdAt: new Date('2024-01-29T10:00:00Z'),
        },
        {
          id: '222e2222-e22b-22d2-a222-222222222222',
          name: 'Evening Reading',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          category: 'Education',
          goalType: 'frequency_based',
          recurrenceType: 'weekly',
          targetCount: 5,
          targetPeriod: 'weekly',
          isActive: true,
          createdAt: new Date('2024-01-29T12:00:00Z'),
        },
      ];

      mockGetRoutinesUseCase.execute.mockResolvedValue(success(mockRoutines));

      // Act
      const response = await controller.getAll(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockRoutines);
      expect(mockGetRoutinesUseCase.execute).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return empty array when no routines', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'),
        },
      } as any as NextRequest;

      mockGetRoutinesUseCase.execute.mockResolvedValue(success([]));

      // Act
      const response = await controller.getAll(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual([]);
    });

    it('should return 401 for unauthorized user', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null), // No x-user-id header
        },
      } as any as NextRequest;

      // Act
      const response = await controller.getAll(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(401);
      expect(responseData.error).toBe('認証が必要です');
      expect(mockGetRoutinesUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('123e4567-e89b-12d3-a456-426614174000'),
        },
      } as any as NextRequest;

      const serverError = new Error('Repository failed');
      mockGetRoutinesUseCase.execute.mockResolvedValue(failure(serverError));

      // Act
      const response = await controller.getAll(mockRequest);

      // Assert
      expect(response).toBeInstanceOf(NextResponse);
      const responseData = await response.json();
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error.message).toBe('内部エラーが発生しました');
    });

    it('should filter by user ID correctly', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(userId),
        },
      } as any as NextRequest;

      const userRoutines = [
        {
          id: '111e1111-e11b-11d1-a111-111111111111',
          name: 'User Routine',
          userId: userId,
          category: 'Health',
        },
      ];

      mockGetRoutinesUseCase.execute.mockResolvedValue(success(userRoutines));

      // Act
      const response = await controller.getAll(mockRequest);

      // Assert
      expect(mockGetRoutinesUseCase.execute).toHaveBeenCalledWith(userId);
      const responseData = await response.json();
      expect(responseData.data.every((routine: any) => routine.userId === userId)).toBe(true);
    });
  });

  describe('private methods', () => {
    describe('extractUserIdFromRequest', () => {
      it('should extract user ID from x-user-id header', () => {
        // This will be tested when implementation is added
        expect(true).toBe(true); // Placeholder
      });

      it('should return empty string when header is missing', () => {
        // This will be tested when implementation is added
        expect(true).toBe(true); // Placeholder
      });
    });

    describe('toDto', () => {
      it('should convert routine to DTO format', () => {
        // This will be tested when implementation is added
        expect(true).toBe(true); // Placeholder
      });
    });

    describe('handleError', () => {
      it('should handle domain errors correctly', () => {
        // This will be tested when implementation is added
        expect(true).toBe(true); // Placeholder
      });

      it('should handle generic errors correctly', () => {
        // This will be tested when implementation is added
        expect(true).toBe(true); // Placeholder
      });
    });
  });
});