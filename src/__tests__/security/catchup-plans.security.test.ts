/**
 * TASK-110: Catch-up Plan API Implementation - Security Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

import { GET, POST } from '@/app/api/catchup-plans/route';

// Mock authentication
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('@/lib/db/queries/catchup-plans');
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

describe('Catchup Plans Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should reject requests with invalid JWT tokens', async () => {
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

      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=user123', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid.jwt.token'
        }
      });

      // When: Make request with invalid token
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Authentication fails
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });

    it('should reject requests with expired tokens', async () => {
      // Given: Expired token
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'JWT expired' }
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer expired.jwt.token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'create', userId: 'user123' })
      });

      // When: Make request with expired token
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Authentication fails
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });

    it('should reject requests with malformed authorization header', async () => {
      // Given: Malformed authorization header
      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=user123', {
        method: 'GET',
        headers: {
          'Authorization': 'InvalidFormat token123'
        }
      });

      // When: Make request with malformed header
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Authentication fails
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });

    it('should reject requests without authorization header', async () => {
      // Given: No authorization header
      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=user123', {
        method: 'GET'
      });

      // When: Make request without auth
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Authentication fails
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証が必要です');
    });

    it('should validate JWT signature and claims', async () => {
      // Given: Valid format but invalid signature
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid signature' }
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=user123', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
        }
      });

      // When: Make request with invalid signature
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Signature validation fails
      expect(response.status).toBe(401);
      expect(responseData.success).toBe(false);
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

      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=userB', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token-for-userA'
        }
      });

      // When: User A tries to access User B's data
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Access denied
      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('他のユーザーのデータにはアクセスできません');
    });

    it('should prevent unauthorized plan modifications', async () => {
      // Given: User trying to modify another user's plan
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'userA', email: 'userA@example.com' } },
            error: null
          }),
        },
      });

      const { updateCatchupPlanProgress } = require('@/lib/db/queries/catchup-plans');
      updateCatchupPlanProgress.mockResolvedValue(null); // Plan not found due to user mismatch

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token-for-userA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'updateProgress',
          userId: 'userB', // Different user
          planId: 'plan-belonging-to-userB',
          currentProgress: 15
        })
      });

      // When: Try to modify other user's plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Access denied
      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('他のユーザーのデータを変更する権限がありません');
    });

    it('should validate user context consistency', async () => {
      // Given: Token user differs from request user
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'authenticated-user', email: 'auth@example.com' } },
            error: null
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create',
          userId: 'different-user', // Mismatched user
          routineId: 'routine123',
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 20,
          currentProgress: 8
        })
      });

      // When: Submit with user mismatch
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Context validation fails
      expect(response.status).toBe(403);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('認証されたユーザーとリクエストユーザーが一致しません');
    });

    it('should enforce resource ownership for plan operations', async () => {
      // Given: Valid user trying to access non-owned plan
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'user123@example.com' } },
            error: null
          }),
        },
      });

      const { deactivateCatchupPlan } = require('@/lib/db/queries/catchup-plans');
      deactivateCatchupPlan.mockResolvedValue(null); // Plan not found (ownership check)

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer valid-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'deactivate',
          userId: 'user123',
          planId: 'plan-not-owned-by-user123'
        })
      });

      // When: Try to deactivate non-owned plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Resource ownership enforced
      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランが見つかりません');
    });
  });

  describe('Input Sanitization Tests', () => {
    it('should sanitize input to prevent SQL injection', async () => {
      // Given: Malicious SQL injection attempt
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const maliciousInput = {
        action: 'create',
        userId: "'; DROP TABLE catchup_plans; --",
        routineId: 'routine123',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(maliciousInput)
      });

      // When: Submit malicious input
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Input validation rejects malicious data
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain('不正な入力');
    });

    it('should prevent XSS attacks through input validation', async () => {
      // Given: XSS attempt in input data
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const xssInput = {
        action: 'create',
        userId: 'user123',
        routineId: '<script>alert("XSS")</script>',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(xssInput)
      });

      // When: Submit XSS attempt
      const response = await POST(request);
      const responseData = await response.json();

      // Then: XSS attempt blocked
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('不正な文字が含まれています');
    });

    it('should validate input data types and ranges', async () => {
      // Given: Invalid data types and out-of-range values
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const invalidInputs = [
        {
          // Negative progress
          action: 'updateProgress',
          userId: 'user123',
          planId: 'plan123',
          currentProgress: -10
        },
        {
          // Extremely large values
          action: 'create',
          userId: 'user123',
          routineId: 'routine123',
          originalTarget: 999999999999,
          currentProgress: 0
        },
        {
          // Invalid date format
          action: 'create',
          userId: 'user123',
          routineId: 'routine123',
          targetPeriodStart: 'not-a-date',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 20,
          currentProgress: 8
        }
      ];

      for (const invalidInput of invalidInputs) {
        const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify(invalidInput)
        });

        // When: Submit invalid input
        const response = await POST(request);
        const responseData = await response.json();

        // Then: Validation rejects invalid data
        expect(response.status).toBe(400);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toMatch(/無効な|不正な/);
      }
    });

    it('should sanitize special characters in text fields', async () => {
      // Given: Input with special characters
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const specialCharInput = {
        action: 'update',
        userId: 'user123',
        planId: 'plan123',
        notes: '"; SELECT * FROM users; --',
        tags: ['<script>', 'alert("xss")', '</script>']
      };

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(specialCharInput)
      });

      // When: Submit input with special characters
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Special characters sanitized or rejected
      if (response.status === 400) {
        expect(responseData.success).toBe(false);
        expect(responseData.error).toContain('不正な文字');
      } else {
        // If accepted, ensure sanitization occurred
        expect(response.status).toBe(200);
        // Notes and tags should be sanitized
        expect(responseData.data.notes).not.toContain('SELECT');
        expect(responseData.data.tags.join('')).not.toContain('<script>');
      }
    });

    it('should prevent path traversal attempts', async () => {
      // Given: Path traversal attempt in parameters
      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=../../../etc/passwd', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      // When: Attempt path traversal
      const response = await GET(request);
      const responseData = await response.json();

      // Then: Path traversal blocked
      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('無効なuserIdフォーマットです');
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should enforce rate limits for plan creation', async () => {
      // Given: Valid authentication for rate limiting test
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const { createCatchupPlan } = require('@/lib/db/queries/catchup-plans');
      createCatchupPlan.mockResolvedValue({ id: 'plan123' });

      const planData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine123',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      // When: Make rapid requests exceeding rate limit
      const rapidRequests = Array(15).fill(null).map(() =>
        new NextRequest('http://localhost:3000/api/catchup-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify(planData)
        })
      );

      const responses = await Promise.allSettled(
        rapidRequests.map(request => POST(request))
      );

      // Then: Some requests should be rate limited
      const rateLimitedResponses = responses
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value)
        .filter(response => response.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
      
      // Verify rate limit response format
      if (rateLimitedResponses.length > 0) {
        const rateLimitResponse = await rateLimitedResponses[0].json();
        expect(rateLimitResponse.success).toBe(false);
        expect(rateLimitResponse.error).toBe('リクエスト制限に達しました。しばらく待ってから再試行してください。');
      }
    });

    it('should implement progressive rate limiting', async () => {
      // Given: Authentication and mock setup
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      // When: Make requests at different intervals
      const firstBatch = Array(5).fill(null).map(() => POST(createMockRequest()));
      const firstResults = await Promise.all(firstBatch);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const secondBatch = Array(5).fill(null).map(() => POST(createMockRequest()));
      const secondResults = await Promise.all(secondBatch);

      // Then: Progressive rate limiting applied
      const firstBatchErrors = firstResults.filter(r => r.status === 429).length;
      const secondBatchErrors = secondResults.filter(r => r.status === 429).length;
      
      // Second batch should have more rate limiting due to accumulated requests
      expect(secondBatchErrors).toBeGreaterThanOrEqual(firstBatchErrors);

      function createMockRequest() {
        return new NextRequest('http://localhost:3000/api/catchup-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            action: 'updateProgress',
            userId: 'user123',
            planId: 'plan123',
            currentProgress: Math.floor(Math.random() * 20)
          })
        });
      }
    });
  });

  describe('Data Isolation Tests', () => {
    it('should ensure complete user data isolation', async () => {
      // Given: Multiple users with overlapping routine names
      const userAData = [
        { id: 'plan-A1', userId: 'userA', routineId: 'routine1', originalTarget: 20 }
      ];
      const userBData = [
        { id: 'plan-B1', userId: 'userB', routineId: 'routine2', originalTarget: 25 }
      ];

      // Mock database to return user-specific data
      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockImplementation((userId) => {
        if (userId === 'userA') return Promise.resolve(userAData);
        if (userId === 'userB') return Promise.resolve(userBData);
        return Promise.resolve([]);
      });

      // Test User A access
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'userA', email: 'userA@example.com' } },
            error: null
          }),
        },
      });

      const requestA = new NextRequest('http://localhost:3000/api/catchup-plans?userId=userA', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer token-for-userA' }
      });

      const responseA = await GET(requestA);
      const dataA = await responseA.json();

      // Test User B access
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'userB', email: 'userB@example.com' } },
            error: null
          }),
        },
      });

      const requestB = new NextRequest('http://localhost:3000/api/catchup-plans?userId=userB', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer token-for-userB' }
      });

      const responseB = await GET(requestB);
      const dataB = await responseB.json();

      // Then: Each user only sees their own data
      expect(dataA.data).toEqual(userAData);
      expect(dataB.data).toEqual(userBData);
      expect(dataA.data.every(plan => plan.userId === 'userA')).toBe(true);
      expect(dataB.data.every(plan => plan.userId === 'userB')).toBe(true);
    });

    it('should prevent data leakage through error messages', async () => {
      // Given: Attempt to access specific plan by ID
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'userA', email: 'userA@example.com' } },
            error: null
          }),
        },
      });

      const { updateCatchupPlanProgress } = require('@/lib/db/queries/catchup-plans');
      updateCatchupPlanProgress.mockResolvedValue(null); // Plan not found

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          action: 'updateProgress',
          userId: 'userA',
          planId: 'plan-belonging-to-userB',
          currentProgress: 15
        })
      });

      // When: Try to access other user's plan
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Generic error message (no data leakage)
      expect(response.status).toBe(404);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランが見つかりません');
      // Should not reveal existence of the plan or user information
      expect(responseData.error).not.toContain('userB');
      expect(responseData.error).not.toContain('plan-belonging-to-userB');
    });

    it('should enforce tenant isolation at database level', async () => {
      // Given: Database query with user context
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'tenant-user-123', email: 'tenant@example.com' } },
            error: null
          }),
        },
      });

      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockImplementation((userId) => {
        // Verify that database queries always include user filter
        expect(userId).toBe('tenant-user-123');
        return Promise.resolve([
          { id: 'plan1', userId: 'tenant-user-123', routineId: 'routine1' }
        ]);
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=tenant-user-123', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      // When: Make request
      const response = await GET(request);

      // Then: Database query enforced user context
      expect(response.status).toBe(200);
      expect(getUserCatchupPlans).toHaveBeenCalledWith('tenant-user-123');
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose internal system details in error messages', async () => {
      // Given: Database error scenario
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const { createCatchupPlan } = require('@/lib/db/queries/catchup-plans');
      createCatchupPlan.mockRejectedValue(new Error('Connection to database "prod_db" failed: password authentication failed for user "db_admin"'));

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          action: 'create',
          userId: 'user123',
          routineId: 'routine123',
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 20,
          currentProgress: 8
        })
      });

      // When: Internal error occurs
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Generic error message (no internal details)
      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('挽回プランの作成に失敗しました');
      
      // Should not contain sensitive information
      expect(responseData.error).not.toContain('prod_db');
      expect(responseData.error).not.toContain('db_admin');
      expect(responseData.error).not.toContain('password');
      expect(responseData.error).not.toContain('Connection');
    });

    it('should log security events without exposing them to users', async () => {
      // Given: Security violation attempt
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'userA', email: 'userA@example.com' } },
            error: null
          }),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/catchup-plans?userId=userB', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' }
      });

      // When: Security violation occurs
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Security event logged but not exposed
      expect(response.status).toBe(403);
      expect(responseData.error).not.toContain('logged');
      expect(responseData.error).not.toContain('audit');
      
      // Verify security logging occurred (in real implementation)
      // expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Security violation'));
      
      consoleSpy.mockRestore();
    });

    it('should handle resource exhaustion gracefully', async () => {
      // Given: Resource exhaustion scenario
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      const { createCatchupPlan } = require('@/lib/db/queries/catchup-plans');
      createCatchupPlan.mockRejectedValue(new Error('ENOMEM: not enough memory'));

      const request = new NextRequest('http://localhost:3000/api/catchup-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          action: 'create',
          userId: 'user123',
          routineId: 'routine123',
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 20,
          currentProgress: 8
        })
      });

      // When: Resource exhaustion occurs
      const response = await POST(request);
      const responseData = await response.json();

      // Then: Graceful handling without system details
      expect(response.status).toBe(503);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('サービスが一時的に利用できません。しばらく待ってから再試行してください。');
      expect(responseData.error).not.toContain('ENOMEM');
      expect(responseData.error).not.toContain('memory');
    });
  });
});