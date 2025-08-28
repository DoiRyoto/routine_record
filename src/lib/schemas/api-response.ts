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

// Drizzleスキーマ型からZodスキーマを作成するヘルパー

// ルーチンスキーマ
export const RoutineSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  goalType: z.enum(['frequency_based', 'schedule_based']),
  targetCount: z.number().nullable(),
  targetPeriod: z.string().nullable(),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  recurrenceInterval: z.number(),
  monthlyType: z.enum(['day_of_month', 'day_of_week']).nullable(),
  dayOfMonth: z.number().nullable(),
  weekOfMonth: z.number().nullable(),
  dayOfWeek: z.number().nullable(),
  daysOfWeek: z.string().nullable(),
  startDate: z.string().datetime().nullable().transform(val => val ? new Date(val) : null),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
  isActive: z.boolean(),
  deletedAt: z.string().datetime().nullable().transform(val => val ? new Date(val) : null),
});

// 実行記録スキーマ
export const ExecutionRecordSchema = z.object({
  id: z.string().uuid(),
  routineId: z.string().uuid(),
  userId: z.string().uuid(),
  executedAt: z.string().datetime().transform(val => new Date(val)),
  duration: z.number().nullable(),
  memo: z.string().nullable(),
  isCompleted: z.boolean(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// ユーザー設定スキーマ
export const UserSettingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  theme: z.enum(['light', 'dark', 'auto']),
  language: z.enum(['ja', 'en']),
  timeFormat: z.enum(['12h', '24h']),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// タイムゾーン付きユーザー設定スキーマ
export const UserSettingWithTimezoneSchema = UserSettingSchema.extend({
  timezone: z.string().nullable(),
});

// カテゴリスキーマ
export const CategorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  color: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// ユーザープロフィールスキーマ
export const UserProfileSchema = z.object({
  userId: z.string().uuid(),
  level: z.number(),
  totalXP: z.number(),
  currentXP: z.number(),
  nextLevelXP: z.number(),
  streak: z.number(),
  longestStreak: z.number(),
  totalRoutines: z.number(),
  totalExecutions: z.number(),
  joinedAt: z.string().datetime().transform(val => new Date(val)),
  lastActiveAt: z.string().datetime().transform(val => new Date(val)),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// エンドポイント別レスポンススキーマ

// Routines API
export const RoutinesGetResponseSchema = APIResponseSchema(z.array(RoutineSchema));
export const RoutinePostResponseSchema = APIResponseSchema(RoutineSchema);
export const RoutinePutResponseSchema = APIResponseSchema(RoutineSchema);
export const RoutineDeleteResponseSchema = APIResponseSchema(z.object({ message: z.string() }));

// Execution Records API
export const ExecutionRecordsGetResponseSchema = APIResponseSchema(z.array(ExecutionRecordSchema));
export const ExecutionRecordPostResponseSchema = APIResponseSchema(ExecutionRecordSchema);

// User Settings API
export const UserSettingsGetResponseSchema = APIResponseSchema(UserSettingWithTimezoneSchema);
export const UserSettingsPutResponseSchema = APIResponseSchema(UserSettingWithTimezoneSchema);

// Categories API
export const CategoriesGetResponseSchema = APIResponseSchema(z.array(CategorySchema));
export const CategoryPostResponseSchema = APIResponseSchema(CategorySchema);

// User Profiles API
export const UserProfileGetResponseSchema = APIResponseSchema(UserProfileSchema);

// Challenges API (追加)
export const ChallengesGetResponseSchema = APIResponseSchema(z.array(z.any())); // Challenge型が定義されるまで暫定
export const ChallengePostResponseSchema = APIResponseSchema(z.object({ message: z.string() }));

// 型推論用のエクスポート
export type ValidatedRoutine = z.infer<typeof RoutineSchema>;
export type ValidatedExecutionRecord = z.infer<typeof ExecutionRecordSchema>;
export type ValidatedUserSetting = z.infer<typeof UserSettingSchema>;
export type ValidatedCategory = z.infer<typeof CategorySchema>;
export type ValidatedUserProfile = z.infer<typeof UserProfileSchema>;