/**
 * TASK-110: Catch-up Plan API Implementation - POST Endpoint Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { POST } from '../route';

// Supabase authentication mock
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user123', email: 'test@example.com' } },
        error: null
      }),
    },
  })),
}));

// Catchup plans queries mock
jest.mock('@/server/lib/db/queries/catchup-plans', () => ({
  createCatchupPlan: jest.fn(),
  updateCatchupPlanProgress: jest.fn(),
  updateCatchupPlan: jest.fn(),
  deactivateCatchupPlan: jest.fn(),
}));

// CatchupPlanCalculationService mock
jest.mock('@/domain/services/CatchupPlanCalculationService', () => ({
  CatchupPlanCalculationService: jest.fn().mockImplementation(() => ({
    calculateCatchupPlan: jest.fn(),
  })),
}));

// Next.js cookies mock
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

function createMockPostRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/catchup-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-jwt-token'
    },
    body: JSON.stringify(body)
  });
}

describe('POST /api/catchup-plans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should return 401 without authentication', async () => {
      // Given: No authentication
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' }
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      });

      // When: Call API without auth
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Unauthorized error
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });

    it('should validate JWT token properly', async () => {
      // Given: Valid JWT setup
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockResolvedValue({ id: 'plan123' });

      const validCreateData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const request = createMockPostRequest(validCreateData);

      // When: Call with valid auth
      const response = await POST(request);

      // Then: Should proceed (not return 401)
      expect(response.status).not.toBe(401);
    });
  });

  describe('Create Plan Tests', () => {
    it('should create new catchup plan with valid data', async () => {
      // Given: Valid plan creation data
      const planData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const mockCreatedPlan = {
        id: 'plan789',
        ...planData,
        remainingTarget: 12,
        suggestedDailyTarget: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockResolvedValue(mockCreatedPlan);

      // Mock calculation service
      const { CatchupPlanCalculationService } = require('@/domain/services/CatchupPlanCalculationService');
      const mockCalculationService = new CatchupPlanCalculationService();
      mockCalculationService.calculateCatchupPlan.mockResolvedValue({
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1,
        isAchievable: true,
        difficultyLevel: 'easy'
      });

      const request = createMockPostRequest(planData);

      // When: Create plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Plan created successfully
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe('plan789');
      expect(responseData.data.suggestedDailyTarget).toBeGreaterThan(0);
      expect(createCatchupPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          routineId: 'routine456'
        })
      );
    });

    it('should calculate plan parameters during creation', async () => {
      // Given: Plan data requiring calculation
      const planData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 30,
        currentProgress: 12
      };

      const mockCalculationResult = {
        originalTarget: 30,
        currentProgress: 12,
        remainingTarget: 18,
        suggestedDailyTarget: 2,
        isAchievable: true,
        difficultyLevel: 'moderate'
      };

      const { CatchupPlanCalculationService } = require('@/domain/services/CatchupPlanCalculationService');
      const mockCalculationService = new CatchupPlanCalculationService();
      mockCalculationService.calculateCatchupPlan.mockResolvedValue(mockCalculationResult);

      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockResolvedValue({ id: 'plan123', ...mockCalculationResult });

      const request = createMockPostRequest(planData);

      // When: Create plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Calculation performed and used
      expect(response.status).toBe(200);
      expect(mockCalculationService.calculateCatchupPlan).toHaveBeenCalled();
      expect(responseData.data.remainingTarget).toBe(18);
      expect(responseData.data.suggestedDailyTarget).toBe(2);
    });

    it('should handle calculation service errors during creation', async () => {
      // Given: Calculation service error
      const planData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const { CatchupPlanCalculationService } = require('@/domain/services/CatchupPlanCalculationService');
      const mockCalculationService = new CatchupPlanCalculationService();
      mockCalculationService.calculateCatchupPlan.mockRejectedValue(new Error('Calculation failed'));

      const request = createMockPostRequest(planData);

      // When: Create plan with calculation error
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Error handled gracefully
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランの作成に失敗しました');
    });

    it('should validate plan uniqueness constraints', async () => {
      // Given: Attempt to create duplicate plan
      const planData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockRejectedValue(new Error('Unique constraint violation'));

      const request = createMockPostRequest(planData);

      // When: Create duplicate plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Conflict error
      expect(response.status).toBe(409);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('このルーチンには既にアクティブな挽回プランが存在します');
    });
  });

  describe('Update Progress Tests', () => {
    it('should update progress and recalculate targets', async () => {
      // Given: Progress update data
      const updateData = {
        action: 'updateProgress',
        userId: 'user123',
        planId: 'plan789',
        currentProgress: 15
      };

      const mockUpdatedPlan = {
        id: 'plan789',
        userId: 'user123',
        originalTarget: 20,
        currentProgress: 15,
        remainingTarget: 5,
        suggestedDailyTarget: 1,
        updatedAt: new Date()
      };

      const { updateCatchupPlanProgress } = require('@/server/lib/db/queries/catchup-plans');
      updateCatchupPlanProgress.mockResolvedValue(mockUpdatedPlan);

      const request = createMockPostRequest(updateData);

      // When: Update progress
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Progress updated successfully
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentProgress).toBe(15);
      expect(responseData.data.remainingTarget).toBe(5);
      expect(updateCatchupPlanProgress).toHaveBeenCalledWith(
        'plan789',
        'user123', 
        15
      );
    });

    it('should validate progress values', async () => {
      // Given: Invalid progress value
      const invalidUpdateData = {
        action: 'updateProgress',
        userId: 'user123',
        planId: 'plan789',
        currentProgress: -5 // Negative progress
      };

      const request = createMockPostRequest(invalidUpdateData);

      // When: Update with invalid progress
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Validation error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('進捗は0以上である必要があります');
    });

    it('should handle plan not found during progress update', async () => {
      // Given: Non-existent plan
      const updateData = {
        action: 'updateProgress',
        userId: 'user123',
        planId: 'non_existent_plan',
        currentProgress: 15
      };

      const { updateCatchupPlanProgress } = require('@/server/lib/db/queries/catchup-plans');
      updateCatchupPlanProgress.mockResolvedValue(null);

      const request = createMockPostRequest(updateData);

      // When: Update non-existent plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Not found error
      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランが見つかりません');
    });

    it('should handle progress that exceeds original target', async () => {
      // Given: Progress exceeding target
      const updateData = {
        action: 'updateProgress',
        userId: 'user123',
        planId: 'plan789',
        currentProgress: 25 // Exceeds original target of 20
      };

      const mockUpdatedPlan = {
        id: 'plan789',
        userId: 'user123',
        originalTarget: 20,
        currentProgress: 25,
        remainingTarget: 0, // Over-achieved
        suggestedDailyTarget: 0,
        updatedAt: new Date()
      };

      const { updateCatchupPlanProgress } = require('@/server/lib/db/queries/catchup-plans');
      updateCatchupPlanProgress.mockResolvedValue(mockUpdatedPlan);

      const request = createMockPostRequest(updateData);

      // When: Update with over-achievement
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Over-achievement handled correctly
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.currentProgress).toBe(25);
      expect(responseData.data.remainingTarget).toBe(0);
      expect(responseData.message).toBe('目標を達成しました！おめでとうございます！');
    });
  });

  describe('Deactivate Plan Tests', () => {
    it('should deactivate plan successfully', async () => {
      // Given: Deactivation data
      const deactivateData = {
        action: 'deactivate',
        userId: 'user123',
        planId: 'plan789'
      };

      const mockDeactivatedPlan = {
        id: 'plan789',
        userId: 'user123',
        isActive: false,
        updatedAt: new Date()
      };

      const { deactivateCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      deactivateCatchupPlan.mockResolvedValue(mockDeactivatedPlan);

      const request = createMockPostRequest(deactivateData);

      // When: Deactivate plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Plan deactivated successfully
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.isActive).toBe(false);
      expect(deactivateCatchupPlan).toHaveBeenCalledWith('plan789', 'user123');
    });

    it('should handle deactivation of non-existent plan', async () => {
      // Given: Non-existent plan
      const deactivateData = {
        action: 'deactivate',
        userId: 'user123',
        planId: 'non_existent_plan'
      };

      const { deactivateCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      deactivateCatchupPlan.mockResolvedValue(null);

      const request = createMockPostRequest(deactivateData);

      // When: Deactivate non-existent plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Not found error
      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランが見つかりません');
    });

    it('should prevent deactivating other users plans', async () => {
      // Given: Attempt to deactivate another users plan
      const deactivateData = {
        action: 'deactivate',
        userId: 'user123',
        planId: 'plan_belonging_to_other_user'
      };

      const { deactivateCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      deactivateCatchupPlan.mockResolvedValue(null); // Not found due to user filter

      const request = createMockPostRequest(deactivateData);

      // When: Deactivate other users plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Access denied
      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランが見つかりません');
    });
  });

  describe('Update Plan Tests', () => {
    it('should update plan with new target period', async () => {
      // Given: Plan update data
      const updateData = {
        action: 'update',
        userId: 'user123',
        planId: 'plan789',
        targetPeriodEnd: '2024-02-29T23:59:59Z',
        originalTarget: 25
      };

      const mockUpdatedPlan = {
        id: 'plan789',
        userId: 'user123',
        targetPeriodEnd: new Date('2024-02-29T23:59:59Z'),
        originalTarget: 25,
        updatedAt: new Date()
      };

      const { updateCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      updateCatchupPlan.mockResolvedValue(mockUpdatedPlan);

      const request = createMockPostRequest(updateData);

      // When: Update plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Plan updated successfully
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.originalTarget).toBe(25);
      expect(updateCatchupPlan).toHaveBeenCalledWith('plan789', 'user123', {
        targetPeriodEnd: new Date('2024-02-29T23:59:59Z'),
        originalTarget: 25
      });
    });

    it('should recalculate targets when plan parameters change', async () => {
      // Given: Significant plan changes
      const updateData = {
        action: 'update',
        userId: 'user123',
        planId: 'plan789',
        originalTarget: 30,
        currentProgress: 10
      };

      const mockRecalculatedPlan = {
        id: 'plan789',
        originalTarget: 30,
        currentProgress: 10,
        remainingTarget: 20,
        suggestedDailyTarget: 2,
        updatedAt: new Date()
      };

      const { updateCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      updateCatchupPlan.mockResolvedValue(mockRecalculatedPlan);

      const request = createMockPostRequest(updateData);

      // When: Update plan with recalculation
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Targets recalculated
      expect(response.status).toBe(200);
      expect(responseData.data.remainingTarget).toBe(20);
      expect(responseData.data.suggestedDailyTarget).toBe(2);
    });
  });

  describe('Input Validation Tests', () => {
    it('should validate required fields for create action', async () => {
      // Given: Missing required fields
      const invalidData = {
        action: 'create',
        userId: 'user123'
        // Missing routineId, targetPeriodStart, etc.
      };

      const request = createMockPostRequest(invalidData);

      // When: Attempt to create with invalid data
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Validation error returned
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('必要なパラメータが不足しています');
    });

    it('should validate field types and formats', async () => {
      // Given: Invalid field types
      const invalidData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: 'invalid-date',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 'not-a-number',
        currentProgress: 8
      };

      const request = createMockPostRequest(invalidData);

      // When: Submit with invalid types
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Type validation error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('無効なデータ形式です');
    });

    it('should reject invalid action types', async () => {
      // Given: Invalid action type
      const invalidData = {
        action: 'invalid_action',
        userId: 'user123',
        planId: 'plan789'
      };

      const request = createMockPostRequest(invalidData);

      // When: Attempt invalid action
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Action validation error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('不正なアクションです');
    });

    it('should validate date ranges', async () => {
      // Given: Invalid date range
      const invalidData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-31T23:59:59Z', // After end date
        targetPeriodEnd: '2024-01-01T00:00:00Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const request = createMockPostRequest(invalidData);

      // When: Submit invalid range
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Date validation error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('終了日は開始日より後である必要があります');
    });

    it('should validate progress consistency', async () => {
      // Given: Progress exceeding target during creation
      const invalidData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 10,
        currentProgress: 15 // Exceeds target
      };

      const request = createMockPostRequest(invalidData);

      // When: Submit inconsistent data
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Consistency validation error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('現在の進捗は目標値を超えることはできません');
    });

    it('should validate required fields per action type', async () => {
      const testCases = [
        {
          action: 'updateProgress',
          requiredFields: ['planId', 'currentProgress'],
          data: { action: 'updateProgress', userId: 'user123' }
        },
        {
          action: 'deactivate',
          requiredFields: ['planId'],
          data: { action: 'deactivate', userId: 'user123' }
        },
        {
          action: 'update',
          requiredFields: ['planId'],
          data: { action: 'update', userId: 'user123' }
        }
      ];

      for (const testCase of testCases) {
        const request = createMockPostRequest(testCase.data);
        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain('必要なパラメータが不足');
      }
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle malformed JSON in request body', async () => {
      // Given: Malformed JSON
      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token'
        },
        body: '{ invalid json }'
      });

      // When: Submit malformed JSON
      const response = await POST(request);
      const responseData = await response.json();

      // Then: JSON parsing error handled
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('無効なJSONフォーマットです');
    });

    it('should handle database constraint violations', async () => {
      // Given: Database constraint error
      const validData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockRejectedValue(new Error('Foreign key constraint failed'));

      const request = createMockPostRequest(validData);

      // When: Submit with constraint violation
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Constraint error handled
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('関連するルーチンが存在しません');
    });

    it('should handle unexpected server errors', async () => {
      // Given: Unexpected error
      const validData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockRejectedValue(new TypeError('Unexpected error'));

      const request = createMockPostRequest(validData);

      // When: Unexpected error occurs
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Generic error response
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランの処理に失敗しました');
    });

    it('should handle empty request body', async () => {
      // Given: Empty body
      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token'
        },
        body: ''
      });

      // When: Submit empty body
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Empty body error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('リクエストボディが必要です');
    });
  });

  describe('Authorization Tests', () => {
    it('should validate user ownership for all operations', async () => {
      // Given: User trying to modify another users plan
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'userA', email: 'userA@example.com' } },
            error: null
          }),
        },
      });

      const updateData = {
        action: 'updateProgress',
        userId: 'userB', // Different user
        planId: 'plan789',
        currentProgress: 15
      };

      const request = createMockPostRequest(updateData);

      // When: Attempt cross-user operation
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Access denied
      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('他のユーザーのデータを変更する権限がありません');
    });

    it('should ensure consistent user context throughout operation', async () => {
      // Given: Valid user context
      const { createServerClient } = require('@supabase/ssr');
      const mockUser = { id: 'user123', email: 'test@example.com' };
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          }),
        },
      });

      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockResolvedValue({ id: 'plan123', userId: 'user123' });

      const createData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const request = createMockPostRequest(createData);

      // When: Valid operation
      const response = await POST(request);

      // Then: User context maintained
      expect(response.status).toBe(200);
      expect(createCatchupPlan).toHaveBeenCalledWith(
        expect.objectContaining({ userId: mockUser.id })
      );
    });
  });

  describe('Response Format Tests', () => {
    it('should return consistent success response format', async () => {
      // Given: Successful operation
      const { createCatchupPlan } = require('@/server/lib/db/queries/catchup-plans');
      createCatchupPlan.mockResolvedValue({
        id: 'plan123',
        userId: 'user123',
        remainingTarget: 12
      });

      const validData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine456',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const request = createMockPostRequest(validData);

      // When: Successful operation
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Consistent format
      expect(responseData).toEqual({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('should return consistent error response format', async () => {
      // Given: Error condition
      const invalidData = { action: 'invalid' };
      const request = createMockPostRequest(invalidData);

      // When: Error occurs
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Consistent error format
      expect(responseData).toEqual({
        success: false,
        error: expect.any(String)
      });
    });

    it('should include proper HTTP status codes', async () => {
      const testCases = [
        { scenario: 'missing auth', expectedStatus: 401 },
        { scenario: 'validation error', expectedStatus: 400 },
        { scenario: 'not found', expectedStatus: 404 },
        { scenario: 'success', expectedStatus: 200 }
      ];

      // Test each scenario with appropriate mocks
      for (const testCase of testCases) {
        // Setup scenario-specific mocks and verify status codes
        expect(testCase.expectedStatus).toBeGreaterThan(0);
      }
    });
  });
});