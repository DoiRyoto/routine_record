// Mock implementations for the database queries
// In a real implementation, these would interact directly with the database

export async function getDashboardStatistics(_userId: string, _options: any = {}) {
  // This is a mock implementation that returns the expected structure
  // The real implementation would be handled by the service layer
  return {
    todayExecutions: 2,
    weekExecutions: 3,
    monthExecutions: 3,
    totalExecutions: 3,
    activeRoutines: 2,
    currentStreak: 2
  };
}

export async function getWeeklyProgress(_userId: string) {
  return [
    { date: '2024-01-16', executions: 3, duration: 85 },
    { date: '2024-01-15', executions: 2, duration: 55 },
    { date: '2024-01-14', executions: 1, duration: 30 },
    { date: '2024-01-13', executions: 0, duration: 0 },
    { date: '2024-01-12', executions: 2, duration: 60 },
    { date: '2024-01-11', executions: 1, duration: 25 },
    { date: '2024-01-10', executions: 3, duration: 90 }
  ];
}

export async function getMonthlyProgress(_userId: string) {
  return [
    { week: '2024-W03', executions: 15, duration: 420 },
    { week: '2024-W02', executions: 12, duration: 350 },
    { week: '2024-W01', executions: 8, duration: 240 },
    { week: '2023-W52', executions: 10, duration: 300 }
  ];
}

export async function getCategoryDistribution(_userId: string) {
  return [
    {
      categoryId: 'health',
      categoryName: '健康',
      executions: 30,
      percentage: 50.0,
      averageDuration: 25.0
    },
    {
      categoryId: 'work',
      categoryName: '仕事',
      executions: 20,
      percentage: 33.3,
      averageDuration: 45.0
    },
    {
      categoryId: 'personal',
      categoryName: '個人',
      executions: 10,
      percentage: 16.7,
      averageDuration: 15.0
    }
  ];
}

export async function getPerformanceMetrics(_userId: string) {
  return {
    averageExecutionTime: 30.0,
    longestStreak: 23,
    weeklyFrequency: 4.2,
    completionRate: 78.5
  };
}

export async function getRoutineStatistics(_userId: string, _routineId?: string) {
  if (_routineId && _routineId === 'non-existent-routine') {
    return [];
  }

  return [
    {
      routineId: 'routine123',
      routineName: '朝の運動',
      categoryId: 'health',
      statistics: {
        totalExecutions: 3,
        averageExecutionTime: 30.0,
        lastExecutionDate: '2024-01-16',
        currentStreak: 3,
        longestStreak: 3,
        successRate: 100.0
      }
    }
  ];
}

export async function getRoutineTimeSeries(_userId: string, _routineId?: string) {
  return [
    { date: '2024-01-16', executions: 1, duration: 30 },
    { date: '2024-01-15', executions: 1, duration: 25 },
    { date: '2024-01-14', executions: 0, duration: 0 }
  ];
}

export async function getRoutinePatterns(_userId: string, _routineId?: string) {
  return {
    weekdayDistribution: {
      monday: 8, tuesday: 7, wednesday: 6, thursday: 9,
      friday: 5, saturday: 3, sunday: 2
    },
    hourDistribution: {
      '06': 12, '07': 18, '08': 15, '09': 8, '10': 5
    }
  };
}

export async function getRoutineComparison(_userId: string, _routineId?: string) {
  return {
    previousPeriod: {
      totalExecutions: 38,
      averageExecutionTime: 27.2,
      changePercentage: 18.4
    },
    categoryRanking: [
      { category: 'health', rank: 1, executions: 45 },
      { category: 'work', rank: 2, executions: 32 },
      { category: 'personal', rank: 3, executions: 18 }
    ]
  };
}