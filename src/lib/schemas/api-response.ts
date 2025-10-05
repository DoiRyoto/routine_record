import { z } from 'zod';

// 基本APIレスポンススキーマ
export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

// エラーレスポンススキーマ
export const APIErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

// 成功レスポンススキーマ
export const APISuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

// 習慣スキーマ（超シンプル）
export const HabitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  targetCount: z.number(),
  frequencyType: z.enum(['weekly', 'monthly']),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// 実行記録スキーマ（超シンプル）
export const HabitLogSchema = z.object({
  id: z.string().uuid(),
  habitId: z.string().uuid(),
  doneAt: z.string().datetime().transform(val => new Date(val)),
});

// エンドポイント別レスポンススキーマ
export const HabitsGetResponseSchema = APIResponseSchema(z.array(HabitSchema));
export const HabitPostResponseSchema = APIResponseSchema(HabitSchema);

export const HabitLogsGetResponseSchema = APIResponseSchema(z.array(HabitLogSchema));
export const HabitLogPostResponseSchema = APIResponseSchema(z.object({ message: z.string() }));

// 型推論用のエクスポート
export type ValidatedHabit = z.infer<typeof HabitSchema>;
export type ValidatedHabitLog = z.infer<typeof HabitLogSchema>;