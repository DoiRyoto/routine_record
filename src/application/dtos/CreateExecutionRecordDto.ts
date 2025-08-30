import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsPositive, MinLength, MaxLength, IsDateString } from 'class-validator';

export class CreateExecutionRecordDto {
  @IsString()
  @MinLength(36, { message: 'ルーティンIDは必須です' })
  @MaxLength(36, { message: '無効なルーティンIDです' })
  routineId!: string;

  @IsString()
  @MinLength(36, { message: 'ユーザーIDは必須です' })
  @MaxLength(36, { message: '無効なユーザーIDです' })
  userId!: string;

  @IsOptional()
  @IsDateString({}, { message: '実行日時は有効な日時形式である必要があります' })
  @Transform(({ value }) => value ? new Date(value) : new Date())
  executedAt?: Date;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: '実行時間は正の数である必要があります' })
  duration?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'メモは500文字以内である必要があります' })
  memo?: string | null;

  constructor(data: Partial<CreateExecutionRecordDto>) {
    Object.assign(this, data);
    
    // executedAtが指定されていない場合は現在時刻を設定
    if (!this.executedAt) {
      this.executedAt = new Date();
    }
  }
}