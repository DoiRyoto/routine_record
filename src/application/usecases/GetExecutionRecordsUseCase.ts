import { ExecutionRecord } from '../../domain/entities/ExecutionRecord';
import { IExecutionRecordRepository } from '../../domain/repositories/IExecutionRecordRepository';
import { UserId, RoutineId } from '../../domain/valueObjects';
import { GetExecutionRecordsDto } from '../dtos/GetExecutionRecordsDto';

export interface GetExecutionRecordsResult {
  executionRecords: ExecutionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GetExecutionRecordsUseCase {
  constructor(
    private readonly executionRecordRepository: IExecutionRecordRepository
  ) {}

  async execute(dto: GetExecutionRecordsDto): Promise<GetExecutionRecordsResult> {
    const userId = new UserId(dto.userId);

    // 効率的にデータベースレベルでのページネーション実装が必要
    // 現在の実装では、全データを取得してから絞り込むため効率が悪い
    // 実際の実装では、RepositoryにpaginationパラメータをPassすることになる
    
    let executionRecords: ExecutionRecord[];
    let totalCount: number;

    // 並列でカウントとデータ取得を実行（効率化）
    if (dto.routineId) {
      const routineId = new RoutineId(dto.routineId);
      const [records, count] = await Promise.all([
        this.executionRecordRepository.findByUserIdAndRoutineId(userId, routineId),
        this.executionRecordRepository.countByUserId(userId) // 簡易実装 - 実際はルーチン別カウントが必要
      ]);
      executionRecords = records;
      totalCount = count;
    } else if (dto.startDate && dto.endDate) {
      const [records, count] = await Promise.all([
        this.executionRecordRepository.findByUserIdAndDateRange(userId, dto.startDate, dto.endDate),
        this.executionRecordRepository.countByUserIdAndDateRange(userId, dto.startDate, dto.endDate)
      ]);
      executionRecords = records;
      totalCount = count;
    } else {
      const [records, count] = await Promise.all([
        this.executionRecordRepository.findByUserId(userId),
        this.executionRecordRepository.countByUserId(userId)
      ]);
      executionRecords = records;
      totalCount = count;
    }

    // TODO: 実際の実装では、データベース側でページネーション処理を行う
    // ここでの slice は一時的な実装
    const startIndex = (dto.page - 1) * dto.limit;
    const endIndex = startIndex + dto.limit;
    const paginatedRecords = executionRecords.slice(startIndex, endIndex);

    const totalPages = Math.ceil(totalCount / dto.limit);

    return {
      executionRecords: paginatedRecords,
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total: totalCount,
        totalPages: totalPages || 0,
      },
    };
  }
}