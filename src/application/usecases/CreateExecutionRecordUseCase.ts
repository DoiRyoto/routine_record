import { ExecutionRecord } from '../../domain/entities/ExecutionRecord';
import { IExecutionRecordRepository } from '../../domain/repositories/IExecutionRecordRepository';
import { IRoutineRepository } from '../../domain/repositories/IRoutineRepository';
import { ExecutionRecordId, UserId, RoutineId } from '../../domain/valueObjects';
import { NotFoundError, UnauthorizedError } from '../../shared/types/DomainError';
import { InactiveRoutineError } from '../../shared/types/ExecutionRecordErrors';
import { CreateExecutionRecordDto } from '../dtos/CreateExecutionRecordDto';

export class CreateExecutionRecordUseCase {
  constructor(
    private readonly executionRecordRepository: IExecutionRecordRepository,
    private readonly routineRepository: IRoutineRepository
  ) {}

  async execute(dto: CreateExecutionRecordDto): Promise<ExecutionRecord> {
    // バリデーション
    ExecutionRecord.validateExecutionData(dto.executedAt, dto.duration, dto.memo);

    // ルーチンの存在確認と権限チェック
    const routine = await this.routineRepository.findById(new RoutineId(dto.routineId));
    if (!routine) {
      throw new NotFoundError('Routine', dto.routineId);
    }

    // ユーザー権限チェック
    if (!routine.getUserId().equals(new UserId(dto.userId))) {
      throw new UnauthorizedError('権限がありません');
    }

    // ルーチンアクティブ状態チェック（REQ-102）
    if (!routine.isCurrentlyActive()) {
      throw new InactiveRoutineError(dto.routineId);
    }

    // 実行記録を作成
    const executionRecord = new ExecutionRecord(
      ExecutionRecordId.generate(),
      new UserId(dto.userId),
      new RoutineId(dto.routineId),
      dto.executedAt,
      dto.duration || null,
      dto.memo || null
    );

    // 保存
    await this.executionRecordRepository.save(executionRecord);

    return executionRecord;
  }

}