import { IExecutionRecordRepository } from '../../domain/repositories/IExecutionRecordRepository';
import { ExecutionRecordId, UserId } from '../../domain/valueObjects';
import { DeleteExecutionRecordDto } from '../dtos/DeleteExecutionRecordDto';
import { 
  ExecutionRecordNotFoundError,
  ExecutionRecordAccessForbiddenError
} from '../../shared/types/ExecutionRecordErrors';

export class DeleteExecutionRecordUseCase {
  constructor(
    private readonly executionRecordRepository: IExecutionRecordRepository
  ) {}

  async execute(dto: DeleteExecutionRecordDto): Promise<void> {
    const executionRecordId = new ExecutionRecordId(dto.executionRecordId);

    // 実行記録の存在確認
    const executionRecord = await this.executionRecordRepository.findById(executionRecordId);

    if (!executionRecord) {
      throw new ExecutionRecordNotFoundError(dto.executionRecordId);
    }

    // アクセス権限チェック
    if (!executionRecord.belongsToUser(new UserId(dto.userId))) {
      throw new ExecutionRecordAccessForbiddenError(dto.executionRecordId);
    }

    // 削除
    await this.executionRecordRepository.delete(executionRecordId);
  }
}