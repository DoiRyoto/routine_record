/**
 * TASK-110: Catch-up Plan API Implementation - E2E Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import { testClient } from '../utils/test-client';
import { seedTestData, cleanupTestData } from '../utils/test-data';

describe('Catchup Plans E2E Tests', () => {
  let testUser: any;
  let testRoutine: any;
  let authToken: string;

  beforeEach(async () => {
    // Setup test data
    const testData = await seedTestData();
    testUser = testData.user;
    testRoutine = testData.routine;
    authToken = testData.authToken;
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  describe('Complete Plan Generation Workflow', () => {
    it('should generate and manage catchup plan through complete lifecycle', async () => {
      // Given: User with routine and partial completion
      const routineData = {
        name: 'Daily Exercise',
        goalType: 'frequency_based',
        targetCount: 30,
        targetPeriod: 'monthly',
        userId: testUser.id
      };

      // Create routine
      const routineResponse = await testClient.post('/api/routines', {
        body: routineData,
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const routine = routineResponse.data;

      // Create some execution records (simulating partial completion)
      const executionRecords = [];
      for (let i = 0; i < 12; i++) {
        const recordResponse = await testClient.post('/api/routines/execution-records', {
          body: {
            routineId: routine.id,
            userId: testUser.id,
            executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`).toISOString(),
            value: 30,
            isCompleted: true
          },
          headers: { Authorization: `Bearer ${authToken}` }
        });
        executionRecords.push(recordResponse.data);
      }

      // When: Generate catch-up plan
      const planResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'create',
          userId: testUser.id,
          routineId: routine.id,
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 30,
          currentProgress: 12
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Then: Plan created with correct calculations
      expect(planResponse.status).toBe(200);
      expect(planResponse.data.success).toBe(true);
      
      const plan = planResponse.data.data;
      expect(plan.remainingTarget).toBe(18);
      expect(plan.suggestedDailyTarget).toBeGreaterThan(0);
      expect(plan.isActive).toBe(true);

      // When: Add more execution records (simulating user progress)
      for (let i = 12; i < 17; i++) {
        await testClient.post('/api/routines/execution-records', {
          body: {
            routineId: routine.id,
            userId: testUser.id,
            executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`).toISOString(),
            value: 30,
            isCompleted: true
          },
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }

      // When: Update plan progress
      const updateResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'updateProgress',
          userId: testUser.id,
          planId: plan.id,
          currentProgress: 17
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Then: Progress updated and targets recalculated
      expect(updateResponse.status).toBe(200);
      const updatedPlan = updateResponse.data.data;
      expect(updatedPlan.currentProgress).toBe(17);
      expect(updatedPlan.remainingTarget).toBe(13);
      expect(updatedPlan.suggestedDailyTarget).toBeLessThanOrEqual(plan.suggestedDailyTarget);

      // When: Complete the plan (reach target)
      for (let i = 17; i < 30; i++) {
        await testClient.post('/api/routines/execution-records', {
          body: {
            routineId: routine.id,
            userId: testUser.id,
            executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`).toISOString(),
            value: 30,
            isCompleted: true
          },
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }

      // When: Final progress update
      const finalUpdateResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'updateProgress',
          userId: testUser.id,
          planId: plan.id,
          currentProgress: 30
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Then: Plan should show completion
      expect(finalUpdateResponse.status).toBe(200);
      const completedPlan = finalUpdateResponse.data.data;
      expect(completedPlan.currentProgress).toBe(30);
      expect(completedPlan.remainingTarget).toBe(0);
      expect(completedPlan.suggestedDailyTarget).toBe(0);

      // Verify plan retrieval works
      const getPlansResponse = await testClient.get(
        `/api/catchup-plans?userId=${testUser.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(getPlansResponse.status).toBe(200);
      expect(getPlansResponse.data.data).toContainEqual(
        expect.objectContaining({ id: plan.id })
      );
    });

    it('should handle multiple active plans for different routines', async () => {
      // Given: Multiple routines with different progress states
      const routines = [];
      
      // Create 3 different routines
      for (let i = 0; i < 3; i++) {
        const routineResponse = await testClient.post('/api/routines', {
          body: {
            name: `Routine ${i + 1}`,
            goalType: 'frequency_based',
            targetCount: 20,
            targetPeriod: 'monthly',
            userId: testUser.id
          },
          headers: { Authorization: `Bearer ${authToken}` }
        });
        routines.push(routineResponse.data);
      }

      // Create execution records with different progress levels
      const progressLevels = [5, 10, 15]; // Different completion levels
      
      for (let routineIndex = 0; routineIndex < routines.length; routineIndex++) {
        for (let execIndex = 0; execIndex < progressLevels[routineIndex]; execIndex++) {
          await testClient.post('/api/routines/execution-records', {
            body: {
              routineId: routines[routineIndex].id,
              userId: testUser.id,
              executedAt: new Date(`2024-01-${execIndex + 1}T0${9 + routineIndex}:00:00Z`).toISOString(),
              value: 25 + routineIndex * 5,
              isCompleted: true
            },
            headers: { Authorization: `Bearer ${authToken}` }
          });
        }
      }

      // When: Create catchup plans for all routines
      const plans = [];
      for (let routineIndex = 0; routineIndex < routines.length; routineIndex++) {
        const planResponse = await testClient.post('/api/catchup-plans', {
          body: {
            action: 'create',
            userId: testUser.id,
            routineId: routines[routineIndex].id,
            targetPeriodStart: '2024-01-01T00:00:00Z',
            targetPeriodEnd: '2024-01-31T23:59:59Z',
            originalTarget: 20,
            currentProgress: progressLevels[routineIndex]
          },
          headers: { Authorization: `Bearer ${authToken}` }
        });

        expect(planResponse.status).toBe(200);
        plans.push(planResponse.data.data);
      }

      // Then: All plans created with different calculations
      expect(plans).toHaveLength(3);
      
      plans.forEach((plan, index) => {
        expect(plan.currentProgress).toBe(progressLevels[index]);
        expect(plan.remainingTarget).toBe(20 - progressLevels[index]);
        expect(plan.isActive).toBe(true);
      });

      // When: Get all active plans
      const activeResponse = await testClient.get(
        `/api/catchup-plans?userId=${testUser.id}&activeOnly=true`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Then: All active plans returned
      expect(activeResponse.status).toBe(200);
      expect(activeResponse.data.data).toHaveLength(3);

      // When: Deactivate one plan
      const deactivateResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'deactivate',
          userId: testUser.id,
          planId: plans[0].id
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(deactivateResponse.status).toBe(200);

      // Then: Only 2 active plans remain
      const updatedActiveResponse = await testClient.get(
        `/api/catchup-plans?userId=${testUser.id}&activeOnly=true`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(updatedActiveResponse.status).toBe(200);
      expect(updatedActiveResponse.data.data).toHaveLength(2);
    });

    it('should handle plan adjustments when routine parameters change', async () => {
      // Given: Routine with initial catchup plan
      const routineResponse = await testClient.post('/api/routines', {
        body: {
          name: 'Adjustable Routine',
          goalType: 'frequency_based',
          targetCount: 20,
          targetPeriod: 'monthly',
          userId: testUser.id
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const routine = routineResponse.data;

      // Create partial execution records
      for (let i = 0; i < 8; i++) {
        await testClient.post('/api/routines/execution-records', {
          body: {
            routineId: routine.id,
            userId: testUser.id,
            executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`).toISOString(),
            value: 30,
            isCompleted: true
          },
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }

      // Create initial catchup plan
      const initialPlanResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'create',
          userId: testUser.id,
          routineId: routine.id,
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 20,
          currentProgress: 8
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const initialPlan = initialPlanResponse.data.data;
      expect(initialPlan.originalTarget).toBe(20);
      expect(initialPlan.remainingTarget).toBe(12);

      // When: Adjust the plan target due to routine changes
      const adjustmentResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'update',
          userId: testUser.id,
          planId: initialPlan.id,
          originalTarget: 25, // Increased target
          targetPeriodEnd: '2024-02-15T23:59:59Z' // Extended period
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Then: Plan adjusted with recalculated targets
      expect(adjustmentResponse.status).toBe(200);
      const adjustedPlan = adjustmentResponse.data.data;
      expect(adjustedPlan.originalTarget).toBe(25);
      expect(adjustedPlan.remainingTarget).toBe(17); // 25 - 8
      expect(adjustedPlan.targetPeriodEnd).toBe('2024-02-15T23:59:59Z');

      // When: Continue with progress updates
      const progressResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'updateProgress',
          userId: testUser.id,
          planId: initialPlan.id,
          currentProgress: 15
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Then: Progress reflects new target structure
      expect(progressResponse.status).toBe(200);
      const progressedPlan = progressResponse.data.data;
      expect(progressedPlan.currentProgress).toBe(15);
      expect(progressedPlan.remainingTarget).toBe(10); // 25 - 15
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should handle network failures gracefully', async () => {
      // Given: Simulated network failure
      const mockNetworkFailure = () => {
        throw new Error('Network request failed');
      };

      // Mock API client to fail on first attempt, succeed on retry
      let attemptCount = 0;
      const originalPost = testClient.post;
      jest.spyOn(testClient, 'post').mockImplementation((url, options) => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('Network request failed');
        }
        return originalPost(url, options);
      });

      const planData = {
        action: 'create',
        userId: testUser.id,
        routineId: testRoutine.id,
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 8
      };

      // When: Attempt to create plan with retry logic
      let planResponse;
      try {
        planResponse = await testClient.post('/api/catchup-plans', {
          body: planData,
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (error) {
        // Retry on failure
        planResponse = await testClient.post('/api/catchup-plans', {
          body: planData,
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }

      // Then: Plan created successfully on retry
      expect(planResponse.status).toBe(200);
      expect(planResponse.data.success).toBe(true);
    });

    it('should handle concurrent plan modifications', async () => {
      // Given: Single catchup plan
      const planResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'create',
          userId: testUser.id,
          routineId: testRoutine.id,
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 20,
          currentProgress: 8
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const plan = planResponse.data.data;

      // When: Attempt concurrent updates
      const concurrentUpdates = [
        testClient.post('/api/catchup-plans', {
          body: {
            action: 'updateProgress',
            userId: testUser.id,
            planId: plan.id,
            currentProgress: 12
          },
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        testClient.post('/api/catchup-plans', {
          body: {
            action: 'updateProgress',
            userId: testUser.id,
            planId: plan.id,
            currentProgress: 15
          },
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        testClient.post('/api/catchup-plans', {
          body: {
            action: 'update',
            userId: testUser.id,
            planId: plan.id,
            originalTarget: 25
          },
          headers: { Authorization: `Bearer ${authToken}` }
        })
      ];

      const results = await Promise.allSettled(concurrentUpdates);

      // Then: At least one update succeeds, others may fail gracefully
      const successfulResults = results.filter(
        (result) => result.status === 'fulfilled' && result.value.status === 200
      );
      
      expect(successfulResults.length).toBeGreaterThan(0);

      // Verify final state is consistent
      const finalStateResponse = await testClient.get(
        `/api/catchup-plans?userId=${testUser.id}&routineId=${testRoutine.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(finalStateResponse.status).toBe(200);
      expect(finalStateResponse.data.data).toBeDefined();
    });

    it('should handle database rollback scenarios', async () => {
      // Given: Complex operation that may partially fail
      const routineResponse = await testClient.post('/api/routines', {
        body: {
          name: 'Rollback Test Routine',
          goalType: 'frequency_based',
          targetCount: 30,
          targetPeriod: 'monthly',
          userId: testUser.id
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const routine = routineResponse.data;

      // Create execution records in batch
      const executionPromises = [];
      for (let i = 0; i < 10; i++) {
        executionPromises.push(
          testClient.post('/api/routines/execution-records', {
            body: {
              routineId: routine.id,
              userId: testUser.id,
              executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`).toISOString(),
              value: 30,
              isCompleted: true
            },
            headers: { Authorization: `Bearer ${authToken}` }
          })
        );
      }

      await Promise.all(executionPromises);

      // When: Attempt plan creation with potential constraint violation
      const planWithPossibleConflict = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'create',
          userId: testUser.id,
          routineId: routine.id,
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 30,
          currentProgress: 10
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      // Then: Either succeeds completely or fails without partial state
      if (planWithPossibleConflict.status === 200) {
        // If successful, verify complete plan exists
        const verifyResponse = await testClient.get(
          `/api/catchup-plans?userId=${testUser.id}&routineId=${routine.id}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        expect(verifyResponse.status).toBe(200);
        expect(verifyResponse.data.data).toBeDefined();
      } else {
        // If failed, verify no partial plan created
        const verifyNoPartialResponse = await testClient.get(
          `/api/catchup-plans?userId=${testUser.id}&routineId=${routine.id}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        
        expect(verifyNoPartialResponse.status).toBe(404);
      }
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple plans efficiently', async () => {
      // Given: Large number of routines and plans
      const routineCount = 50;
      const routines = [];

      // Create many routines
      for (let i = 0; i < routineCount; i++) {
        const routineResponse = await testClient.post('/api/routines', {
          body: {
            name: `Performance Test Routine ${i}`,
            goalType: 'frequency_based',
            targetCount: 20,
            targetPeriod: 'monthly',
            userId: testUser.id
          },
          headers: { Authorization: `Bearer ${authToken}` }
        });
        routines.push(routineResponse.data);
      }

      // Create execution records for each routine
      const executionPromises = routines.map((routine, index) => 
        Array(5 + index % 10).fill(null).map((_, execIndex) => 
          testClient.post('/api/routines/execution-records', {
            body: {
              routineId: routine.id,
              userId: testUser.id,
              executedAt: new Date(`2024-01-${execIndex + 1}T${9 + (index % 12)}:00:00Z`).toISOString(),
              value: 20 + index % 30,
              isCompleted: true
            },
            headers: { Authorization: `Bearer ${authToken}` }
          })
        )
      ).flat();

      await Promise.all(executionPromises);

      // When: Create catchup plans for all routines
      const startTime = Date.now();
      
      const planPromises = routines.map((routine, index) =>
        testClient.post('/api/catchup-plans', {
          body: {
            action: 'create',
            userId: testUser.id,
            routineId: routine.id,
            targetPeriodStart: '2024-01-01T00:00:00Z',
            targetPeriodEnd: '2024-01-31T23:59:59Z',
            originalTarget: 20,
            currentProgress: 5 + index % 10
          },
          headers: { Authorization: `Bearer ${authToken}` }
        })
      );

      const planResults = await Promise.allSettled(planPromises);
      const creationTime = Date.now() - startTime;

      // Then: All plans created within reasonable time
      const successfulPlans = planResults.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );
      
      expect(successfulPlans.length).toBeGreaterThanOrEqual(routineCount * 0.9); // At least 90% success
      expect(creationTime).toBeLessThan(30000); // Within 30 seconds

      // When: Retrieve all plans
      const retrievalStartTime = Date.now();
      const allPlansResponse = await testClient.get(
        `/api/catchup-plans?userId=${testUser.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const retrievalTime = Date.now() - retrievalStartTime;

      // Then: All plans retrieved efficiently
      expect(allPlansResponse.status).toBe(200);
      expect(allPlansResponse.data.data.length).toBeGreaterThanOrEqual(successfulPlans.length * 0.9);
      expect(retrievalTime).toBeLessThan(5000); // Within 5 seconds
    });

    it('should maintain response times under load', async () => {
      // Given: Pre-existing plan
      const planResponse = await testClient.post('/api/catchup-plans', {
        body: {
          action: 'create',
          userId: testUser.id,
          routineId: testRoutine.id,
          targetPeriodStart: '2024-01-01T00:00:00Z',
          targetPeriodEnd: '2024-01-31T23:59:59Z',
          originalTarget: 100,
          currentProgress: 20
        },
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const plan = planResponse.data.data;

      // When: Perform rapid updates
      const updatePromises = [];
      const updateCount = 20;
      
      for (let i = 0; i < updateCount; i++) {
        updatePromises.push(
          testClient.post('/api/catchup-plans', {
            body: {
              action: 'updateProgress',
              userId: testUser.id,
              planId: plan.id,
              currentProgress: 20 + i
            },
            headers: { Authorization: `Bearer ${authToken}` }
          })
        );
      }

      const startTime = Date.now();
      const results = await Promise.allSettled(updatePromises);
      const totalTime = Date.now() - startTime;

      // Then: Updates processed efficiently
      const successfulUpdates = results.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );

      expect(successfulUpdates.length).toBeGreaterThan(0);
      expect(totalTime).toBeLessThan(10000); // All updates within 10 seconds
      
      const averageTime = totalTime / successfulUpdates.length;
      expect(averageTime).toBeLessThan(500); // Average update within 500ms
    });
  });
});