import { NextRequest, NextResponse } from 'next/server';

import { authenticateRequest, createErrorResponse } from '@/lib/api/auth-helper';
import {
  getRoutineStatistics,
  getRoutineTimeSeries,
  getRoutinePatterns,
  getRoutineComparison
} from '@/lib/db/queries/statistics';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;
    if (!user) {
      return createErrorResponse(
        'AUTHENTICATION_REQUIRED',
        'Authentication required',
        401
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const routineId = searchParams.get('routineId');
    const _period = searchParams.get('period') || 'month';
    const sort = searchParams.get('sort') || 'executions';
    const limit = parseInt(searchParams.get('limit') || '50');
    const include = searchParams.get('include')?.split(',') || [];

    // Validate sort parameter
    const validSorts = ['executions', 'duration', 'streak'];
    if (!validSorts.includes(sort)) {
      return createErrorResponse(
        'INVALID_PARAMETER',
        'Invalid sort parameter. Must be one of: executions, duration, streak',
        400,
        { field: 'sort' }
      );
    }

    // Get routine statistics
    const routines = await getRoutineStatistics(user.id, routineId || undefined);

    // Handle case where specific routine is not found
    if (routineId && routines.length === 0) {
      return createErrorResponse(
        'ROUTINE_NOT_FOUND',
        `Routine with ID '${routineId}' not found`,
        404,
        { routineId }
      );
    }

    // Add additional data if requested
    for (const routine of routines) {
      if (include.includes('timeSeries')) {
        (routine as any).timeSeries = await getRoutineTimeSeries(user.id, routine.routineId);
      }
      
      if (include.includes('patterns')) {
        (routine as any).patterns = await getRoutinePatterns(user.id, routine.routineId);
      }
    }

    // Build response
    const response: any = {
      routines: routines.slice(0, limit)
    };

    // Add comparison data if requested
    if (include.includes('comparison')) {
      response.comparison = await getRoutineComparison(user.id, routineId || undefined);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Routine statistics API error:', error);
    
    return createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'Failed to retrieve routine statistics',
      500
    );
  }
}