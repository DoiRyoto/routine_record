import { StatisticsCalculationService, DashboardStatistics, WeeklyProgressData, MonthlyProgressData, CategoryDistribution, PerformanceMetrics, RoutineStatistics, ExecutionPatterns, TimeSeriesData, ComparisonData } from '../../domain/services/StatisticsCalculationService';
import { GetDashboardStatisticsDto, GetRoutineStatisticsDto } from '../dtos/GetStatisticsDto';

export interface DashboardStatisticsResult {
  summary: DashboardStatistics;
  progress: {
    weeklyProgress: WeeklyProgressData[];
    monthlyProgress: MonthlyProgressData[];
  };
  categories: CategoryDistribution[];
  performance: PerformanceMetrics;
}

export interface RoutineStatisticsResult {
  routines: (RoutineStatistics & {
    timeSeries?: TimeSeriesData[];
    patterns?: ExecutionPatterns;
  })[];
  comparison?: ComparisonData;
}

export class GetStatisticsUseCase {
  constructor(
    private statisticsService: StatisticsCalculationService
  ) {}

  async getDashboardStatistics(dto: GetDashboardStatisticsDto): Promise<DashboardStatisticsResult> {
    // Validate period parameter
    if (dto.period && !['day', 'week', 'month', 'year'].includes(dto.period)) {
      throw new Error('Invalid period parameter');
    }

    const options = {
      timezone: dto.timezone || 'UTC'
    };

    // Add period only if explicitly provided
    if (dto.period) {
      (options as any).period = dto.period;
    }

    try {
      // Execute all calculations in parallel for performance
      const [summary, weeklyProgress, monthlyProgress, categories, performance] = await Promise.all([
        this.statisticsService.calculateDashboardStatistics(dto.userId, options),
        this.statisticsService.calculateWeeklyProgress(dto.userId),
        this.statisticsService.calculateMonthlyProgress(dto.userId),
        this.statisticsService.calculateCategoryDistribution(dto.userId),
        this.statisticsService.calculatePerformanceMetrics(dto.userId)
      ]);

      return {
        summary,
        progress: {
          weeklyProgress,
          monthlyProgress
        },
        categories,
        performance
      };
    } catch (error) {
      console.error('Error in getDashboardStatistics:', error);
      throw error;
    }
  }

  async getRoutineStatistics(dto: GetRoutineStatisticsDto): Promise<RoutineStatisticsResult> {
    try {
      const routineStatistics = await this.statisticsService.calculateRoutineStatistics(dto.userId, dto.routineId);
      
      if (dto.routineId && !routineStatistics) {
        throw new Error(`Routine with ID '${dto.routineId}' not found`);
      }

      // Convert to array format
      const routinesArray = Array.isArray(routineStatistics) 
        ? routineStatistics 
        : routineStatistics ? [routineStatistics] : [];

      // Enrich with additional data if requested
      const enrichedRoutines = await Promise.all(
        routinesArray.map(async (routine) => {
          const enriched: RoutineStatistics & {
            timeSeries?: TimeSeriesData[];
            patterns?: ExecutionPatterns;
          } = { ...routine };

          if (dto.include?.includes('timeSeries')) {
            enriched.timeSeries = await this.statisticsService.calculateTimeSeries(dto.userId, routine.routineId);
          }

          if (dto.include?.includes('patterns')) {
            enriched.patterns = await this.statisticsService.calculateExecutionPatterns(dto.userId, routine.routineId);
          }

          return enriched;
        })
      );

      // Sort if requested
      if (dto.sort === 'executions') {
        enrichedRoutines.sort((a, b) => b.statistics.totalExecutions - a.statistics.totalExecutions);
      }

      const result: RoutineStatisticsResult = {
        routines: enrichedRoutines
      };

      // Add comparison if requested
      if (dto.include?.includes('comparison') && dto.period) {
        result.comparison = await this.statisticsService.calculateComparison(dto.userId, dto.period);
      }

      return result;
    } catch (error) {
      console.error('Error in getRoutineStatistics:', error);
      throw error;
    }
  }
}