export interface GetDashboardStatisticsDto {
  userId: string;
  timezone?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface GetRoutineStatisticsDto {
  userId: string;
  routineId?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  include?: ('timeSeries' | 'patterns' | 'comparison')[];
  sort?: 'executions' | 'duration' | 'name' | 'date';
}