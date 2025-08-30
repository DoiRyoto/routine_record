import { ExecutionRecord } from '../../domain/entities/ExecutionRecord';
import { IExecutionRecordRepository } from '../../domain/repositories/IExecutionRecordRepository';
import { ExecutionRecordId, UserId, RoutineId } from '../../domain/valueObjects';
import { 
  ExecutionRecordNotFoundError,
  ExecutionRecordAccessForbiddenError
} from '../../shared/types/ExecutionRecordErrors';
import { UpdateExecutionRecordDto } from '../dtos/UpdateExecutionRecordDto';

export class UpdateExecutionRecordUseCase {
  constructor(
    private readonly executionRecordRepository: IExecutionRecordRepository
  ) {}

  async execute(dto: UpdateExecutionRecordDto): Promise<ExecutionRecord> {
    // 実行記録の存在確認
    const executionRecord = await this.executionRecordRepository.findById(
      new ExecutionRecordId(dto.executionRecordId)
    );

    if (!executionRecord) {
      throw new ExecutionRecordNotFoundError(dto.executionRecordId);
    }

    // アクセス権限チェック
    if (!executionRecord.belongsToUser(new UserId(dto.userId))) {
      throw new ExecutionRecordAccessForbiddenError(dto.executionRecordId);
    }

    // バリデーション
    if (dto.executedAt || dto.duration !== undefined || dto.memo !== undefined) {
      ExecutionRecord.validateExecutionData(
        dto.executedAt || executionRecord.getExecutedAt(),
        dto.duration !== undefined ? dto.duration : executionRecord.getDuration(),
        dto.memo !== undefined ? dto.memo : executionRecord.getMemo()
      );
    }

    // 新しい実行記録を作成（元のentityが不変なため）
    let updatedExecutionRecord = executionRecord;

    // 実行日時の更新があれば新しいExecutionRecordを作成
    if (dto.executedAt) {
      updatedExecutionRecord = new ExecutionRecord(
        executionRecord.getId(),
        executionRecord.getUserId(),
        executionRecord.getRoutineId(),
        dto.executedAt,
        dto.duration !== undefined ? dto.duration : executionRecord.getDuration(),
        dto.memo !== undefined ? dto.memo : executionRecord.getMemo(),
        executionRecord.getCreatedAt()
      );
    } else {
      // 実行時間やメモのみの更新
      if (dto.duration !== undefined) {
        updatedExecutionRecord.updateDuration(dto.duration);
      }
      if (dto.memo !== undefined) {
        updatedExecutionRecord.updateMemo(dto.memo);
      }
    }

    // 保存
    await this.executionRecordRepository.save(updatedExecutionRecord);

    return updatedExecutionRecord;
  }

}