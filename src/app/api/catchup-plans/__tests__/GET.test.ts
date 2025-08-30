/**
 * TASK-110: Catch-up Plan API Implementation - GET Endpoint Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

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
jest.mock('@/lib/db/queries/catchup-plans', () => ({
  getUserCatchupPlans: jest.fn(),
  getActiveCatchupPlans: jest.fn(),
  getCatchupPlanByRoutine: jest.fn(),
}));

// Next.js cookies mock
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

function createMockRequest(path: string, searchParams?: URLSearchParams): NextRequest {
  let url = `http://localhost:3000${path}`;
  if (searchParams) {
    url += `?${searchParams.toString()}`;
  }
  
  return new NextRequest(url, { 
    method: 'GET',
    headers: {
      'Authorization': 'Bearer mock-jwt-token'
    }
  });
}

describe('GET /api/catchup-plans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should return 401 without authentication', async () => {
      // Given: No authentication token
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
        method: 'GET'
      });

      // When: Call API without auth
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Unauthorized error returned
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });

    it('should return 401 with invalid JWT token', async () => {
      // Given: Invalid JWT token
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid JWT token' }
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid.jwt.token'
        }
      });

      // When: Call API with invalid token
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Unauthorized error returned
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });

    it('should return 401 with expired JWT token', async () => {
      // Given: Expired JWT token
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'JWT token expired' }
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer expired.jwt.token'
        }
      });

      // When: Call API with expired token
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Unauthorized error returned
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });
  });

  describe('Successful Retrieval Tests', () => {
    it('should return user plans with valid authentication', async () => {
      // Given: Valid authentication and mock plans
      const mockPlans = [
        {
          id: 'plan123',
          routineId: 'routine456',
          userId: 'user123',
          originalTarget: 20,
          currentProgress: 8,
          remainingTarget: 12,
          suggestedDailyTarget: 1,
          isActive: true,
          createdAt: new Date('2024-01-16T12:00:00Z'),
          updatedAt: new Date('2024-01-16T12:00:00Z'),
          routine: {
            id: 'routine456',
            name: 'Morning Exercise',
            category: 'Health'
          }
        }
      ];

      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue(mockPlans);

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API with valid auth
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Plans returned successfully
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockPlans);
      expect(getUserCatchupPlans).toHaveBeenCalledWith('user123');
    });

    it('should return empty array for user with no plans', async () => {
      // Given: User with no catchup plans
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue([]);

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Empty array returned
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual([]);
      expect(responseData.message).toBe('挽回プランが見つかりませんでした');
    });

    it('should include routine information in response', async () => {
      // Given: Plans with detailed routine info
      const mockPlansWithRoutines = [
        {
          id: 'plan123',
          routineId: 'routine456',
          userId: 'user123',
          originalTarget: 20,
          currentProgress: 8,
          routine: {
            id: 'routine456',
            name: 'Morning Exercise',
            description: 'Daily morning workout routine',
            category: 'Health',
            goalType: 'frequency_based',
            targetCount: 20,
            targetPeriod: 'monthly'
          }
        }
      ];

      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue(mockPlansWithRoutines);

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Routine information included
      expect(response.status).toBe(200);
      expect(responseData.data[0].routine).toBeDefined();
      expect(responseData.data[0].routine.name).toBe('Morning Exercise');
      expect(responseData.data[0].routine.goalType).toBe('frequency_based');
    });
  });

  describe('Filter Tests', () => {
    it('should filter plans by routine when routineId provided', async () => {
      // Given: Filter parameters
      const mockFilteredPlan = {
        id: 'plan789',
        routineId: 'routine456',
        userId: 'user123',
        originalTarget: 15,
        currentProgress: 5,
        remainingTarget: 10,
        routine: {
          id: 'routine456',
          name: 'Reading'
        }
      };

      const { getCatchupPlanByRoutine } = require('@/lib/db/queries/catchup-plans');
      getCatchupPlanByRoutine.mockResolvedValue(mockFilteredPlan);

      const searchParams = new URLSearchParams({ 
        userId: 'user123',
        routineId: 'routine456' 
      });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API with routine filter
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Filtered result returned
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.routineId).toBe('routine456');
      expect(getCatchupPlanByRoutine).toHaveBeenCalledWith('user123', 'routine456');
    });

    it('should return only active plans when activeOnly=true', async () => {
      // Given: Active plans filter
      const mockActivePlans = [
        {
          id: 'plan123',
          routineId: 'routine456',
          userId: 'user123',
          isActive: true,
          targetPeriodEnd: new Date('2024-02-01T00:00:00Z') // Future date
        }
      ];

      const { getActiveCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getActiveCatchupPlans.mockResolvedValue(mockActivePlans);

      const searchParams = new URLSearchParams({ 
        userId: 'user123',
        activeOnly: 'true' 
      });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API with active only filter
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Only active plans returned
      expect(response.status).toBe(200);
      expect(responseData.data.every((plan: any) => plan.isActive)).toBe(true);
      expect(getActiveCatchupPlans).toHaveBeenCalledWith('user123');
    });

    it('should handle activeOnly=false to return all plans', async () => {
      // Given: Mix of active and inactive plans
      const mockAllPlans = [
        { id: 'plan1', isActive: true, userId: 'user123' },
        { id: 'plan2', isActive: false, userId: 'user123' }
      ];

      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue(mockAllPlans);

      const searchParams = new URLSearchParams({ 
        userId: 'user123',
        activeOnly: 'false' 
      });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: All plans returned
      expect(response.status).toBe(200);
      expect(responseData.data).toHaveLength(2);
      expect(getUserCatchupPlans).toHaveBeenCalledWith('user123');
    });

    it('should handle invalid activeOnly parameter', async () => {
      // Given: Invalid activeOnly value
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue([]);

      const searchParams = new URLSearchParams({ 
        userId: 'user123',
        activeOnly: 'invalid_value' 
      });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Defaults to all plans (false behavior)
      expect(response.status).toBe(200);
      expect(getUserCatchupPlans).toHaveBeenCalledWith('user123');
    });

    it('should return 404 when specific routine plan not found', async () => {
      // Given: Non-existent routine plan
      const { getCatchupPlanByRoutine } = require('@/lib/db/queries/catchup-plans');
      getCatchupPlanByRoutine.mockResolvedValue(null);

      const searchParams = new URLSearchParams({ 
        userId: 'user123',
        routineId: 'non_existent_routine' 
      });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 404 returned
      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('指定されたルーチンの挽回プランが見つかりません');
    });
  });

  describe('Parameter Validation Tests', () => {
    it('should return 400 when userId is missing', async () => {
      // Given: Request without userId
      const request = createMockRequest('/api/catchup-plans');

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Bad request error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('userIdが必要です');
    });

    it('should return 400 with invalid userId format', async () => {
      // Given: Invalid userId format
      const searchParams = new URLSearchParams({ userId: 'invalid-uuid-format' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Bad request error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('無効なuserIdフォーマットです');
    });

    it('should validate routineId format when provided', async () => {
      // Given: Invalid routineId format
      const searchParams = new URLSearchParams({ 
        userId: 'user123',
        routineId: 'invalid-routine-id' 
      });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Bad request error
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('無効なroutineIdフォーマットです');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database errors gracefully', async () => {
      // Given: Database error
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockRejectedValue(new Error('Database connection failed'));

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Error handled gracefully
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランの取得に失敗しました');
    });

    it('should handle query timeout errors', async () => {
      // Given: Database timeout
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockRejectedValue(new Error('Query timeout'));

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Timeout handled gracefully
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランの取得に失敗しました');
    });

    it('should handle malformed request data', async () => {
      // Given: Request with malformed query params
      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=%E2%9C%93invalid', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer mock-jwt-token'
        }
      });

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Bad request handled
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
    });

    it('should handle unexpected errors with fallback', async () => {
      // Given: Unexpected error type
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockRejectedValue(new TypeError('Unexpected error'));

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Generic error response
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランの取得に失敗しました');
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent cross-user data access', async () => {
      // Given: User A trying to access User B's plans
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'userA', email: 'userA@example.com' } },
            error: null
          }),
        },
      });

      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue([]); // No plans returned for wrong user

      const searchParams = new URLSearchParams({ userId: 'userB' }); // Different user
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Access denied or filtered by actual auth user
      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('他のユーザーのデータにはアクセスできません');
    });

    it('should validate user ownership for routine-specific requests', async () => {
      // Given: User trying to access routine they don't own
      const { getCatchupPlanByRoutine } = require('@/lib/db/queries/catchup-plans');
      getCatchupPlanByRoutine.mockResolvedValue(null); // No plan found for unauthorized access

      const searchParams = new URLSearchParams({ 
        userId: 'user123',
        routineId: 'unauthorized_routine' 
      });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Not found (implying no unauthorized access)
      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
    });
  });

  describe('Response Format Tests', () => {
    it('should return consistent response format for success', async () => {
      // Given: Successful query
      const mockPlans = [{ id: 'plan123', userId: 'user123' }];
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue(mockPlans);

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Consistent format
      expect(responseData).toEqual({
        success: true,
        data: mockPlans,
        message: expect.any(String)
      });
    });

    it('should return consistent response format for errors', async () => {
      // Given: Error condition
      const request = createMockRequest('/api/catchup-plans'); // Missing userId

      // When: Call API
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Consistent error format
      expect(responseData).toEqual({
        success: false,
        error: expect.any(String)
      });
    });

    it('should include proper Content-Type headers', async () => {
      // Given: Any valid request
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue([]);

      const searchParams = new URLSearchParams({ userId: 'user123' });
      const request = createMockRequest('/api/catchup-plans', searchParams);

      // When: Call API
      const response = await GET(request);

      // Then: Proper headers set
      expect(response.headers.get('Content-Type')).toMatch(/application\/json/);
    });
  });
});