import { IsString, IsOptional, IsIn, IsNumber, IsPositive, MinLength, MaxLength } from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  @MinLength(1, { message: 'ルーティン名は必須です' })
  @MaxLength(100, { message: 'ルーティン名は100文字以内である必要があります' })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '説明は500文字以内である必要があります' })
  description?: string | null;

  @IsString()
  @MinLength(1, { message: 'カテゴリは必須です' })
  @MaxLength(50, { message: 'カテゴリは50文字以内である必要があります' })
  category!: string;

  @IsString()
  @IsIn(['frequency_based', 'schedule_based'], { 
    message: 'goalTypeは frequency_based または schedule_based である必要があります' 
  })
  goalType!: string;

  @IsString()
  @IsIn(['daily', 'weekly', 'monthly', 'custom'], { 
    message: 'recurrenceTypeは daily, weekly, monthly, custom のいずれかである必要があります' 
  })
  recurrenceType!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: '目標回数は正の数である必要があります' })
  targetCount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '目標期間は20文字以内である必要があります' })
  targetPeriod?: string | null;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: '繰り返し間隔は正の数である必要があります' })
  recurrenceInterval?: number;

  @IsString()
  @MinLength(36, { message: 'ユーザーIDは必須です' })
  @MaxLength(36, { message: '無効なユーザーIDです' })
  userId!: string;

  constructor(data: Partial<CreateRoutineDto>) {
    Object.assign(this, data);
  }
}