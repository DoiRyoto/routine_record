export interface GetExecutionRecordsDto {
  userId: string;
  routineId?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}