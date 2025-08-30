import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, createErrorResponse } from '@/lib/api/auth-helper';
import {
  getDashboardStatistics,
  getWeeklyProgress,
  getMonthlyProgress,
  getCategoryDistribution,
  getPerformanceMetrics
} from '@/lib/db/queries/statistics';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';
    const timezone = searchParams.get('timezone') || 'UTC';

    // Validate period parameter
    const validPeriods = ['day', 'week', 'month', 'year'];
    if (!validPeriods.includes(period)) {
      return createErrorResponse(
        'INVALID_PARAMETER',
        'Invalid period parameter. Must be one of: day, week, month, year',
        400,
        { field: 'period' }
      );
    }

    // Get statistics data
    const summary = await getDashboardStatistics(user.id, { period, timezone });
    const weeklyProgress = await getWeeklyProgress(user.id);
    const monthlyProgress = await getMonthlyProgress(user.id);
    const categories = await getCategoryDistribution(user.id);
    const performance = await getPerformanceMetrics(user.id);

    // Build response
    const response = {
      summary,
      progress: {
        weeklyProgress,
        monthlyProgress
      },
      categories,
      performance
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Dashboard statistics API error:', error);
    
    return createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'Failed to retrieve dashboard statistics',
      500
    );
  }
}