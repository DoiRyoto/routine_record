export interface UpdateExecutionRecordDto {
  userId: string;
  executionRecordId: string;
  executedAt?: Date;
  duration?: number | null;
  memo?: string | null;
}