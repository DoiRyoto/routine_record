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

// チャレンジスキーマ
export const ChallengeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  startDate: z.string().datetime().transform(val => new Date(val)),
  endDate: z.string().datetime().transform(val => new Date(val)),
  type: z.enum(['weekly', 'monthly', 'seasonal', 'special']),
  participants: z.number(),
  maxParticipants: z.number().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// ユーザーチャレンジスキーマ
export const UserChallengeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  challengeId: z.string().uuid(),
  joinedAt: z.string().datetime().transform(val => new Date(val)),
  completedAt: z.string().datetime().nullable().transform(val => val ? new Date(val) : null),
  isCompleted: z.boolean(),
  progress: z.number(),
  rank: z.number().nullable(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// バッジスキーマ
export const BadgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().nullable(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  category: z.string(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// ミッションスキーマ
export const MissionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['streak', 'count', 'variety', 'consistency']),
  targetValue: z.number(),
  xpReward: z.number(),
  badgeId: z.string().uuid().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'extreme']),
  isActive: z.boolean(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// ユーザーミッションスキーマ
export const UserMissionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  missionId: z.string().uuid(),
  progress: z.number(),
  isCompleted: z.boolean(),
  startedAt: z.string().datetime().transform(val => new Date(val)),
  completedAt: z.string().datetime().nullable().transform(val => val ? new Date(val) : null),
  claimedAt: z.string().datetime().nullable().transform(val => val ? new Date(val) : null),
  createdAt: z.string().datetime().transform(val => new Date(val)),
  updatedAt: z.string().datetime().transform(val => new Date(val)),
});

// XPトランザクションスキーマ
export const XPTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number(),
  reason: z.string(),
  sourceType: z.enum(['routine_completion', 'streak_bonus', 'mission_completion', 'challenge_completion', 'daily_bonus', 'achievement_unlock']),
  sourceId: z.string().uuid().nullable(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
});

// ゲーム通知スキーマ
export const GameNotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['level_up', 'badge_unlocked', 'mission_completed', 'challenge_completed', 'streak_milestone', 'xp_milestone']),
  title: z.string(),
  message: z.string(),
  data: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.string().datetime().transform(val => new Date(val)),
});

// 挽回プランスキーマ
export const CatchupPlanSchema = z.object({
  id: z.string().uuid(),
  routineId: z.string().uuid(),
  userId: z.string().uuid(),
  targetPeriodStart: z.string().datetime().transform(val => new Date(val)),
  targetPeriodEnd: z.string().datetime().transform(val => new Date(val)),
  originalTarget: z.number(),
  currentProgress: z.number(),
  remainingTarget: z.number(),
  suggestedDailyTarget: z.number(),
  isActive: z.boolean(),
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

// Challenges API
export const ChallengesGetResponseSchema = APIResponseSchema(z.array(ChallengeSchema));
export const ChallengePostResponseSchema = APIResponseSchema(UserChallengeSchema);
export const UserChallengesGetResponseSchema = APIResponseSchema(z.array(UserChallengeSchema));

// Badges API
export const BadgesGetResponseSchema = APIResponseSchema(z.array(BadgeSchema));
export const BadgePostResponseSchema = APIResponseSchema(BadgeSchema);

// Missions API
export const MissionsGetResponseSchema = APIResponseSchema(z.array(MissionSchema));
export const MissionPostResponseSchema = APIResponseSchema(MissionSchema);
export const UserMissionsGetResponseSchema = APIResponseSchema(z.array(UserMissionSchema));
export const UserMissionPostResponseSchema = APIResponseSchema(UserMissionSchema);

// XP Transactions API
export const XPTransactionsGetResponseSchema = APIResponseSchema(z.array(XPTransactionSchema));
export const XPDailyStatsResponseSchema = APIResponseSchema(z.array(z.object({
  date: z.string().datetime().transform(val => new Date(val)),
  totalXP: z.number()
})));
export const XPTotalResponseSchema = APIResponseSchema(z.object({
  totalXP: z.number()
}));

// Game Notifications API
export const GameNotificationsGetResponseSchema = APIResponseSchema(z.array(GameNotificationSchema));
export const GameNotificationPostResponseSchema = APIResponseSchema(GameNotificationSchema);

// Catchup Plans API
export const CatchupPlansGetResponseSchema = APIResponseSchema(z.array(CatchupPlanSchema));
export const CatchupPlanPostResponseSchema = APIResponseSchema(CatchupPlanSchema);

// 型推論用のエクスポート
export type ValidatedRoutine = z.infer<typeof RoutineSchema>;
export type ValidatedExecutionRecord = z.infer<typeof ExecutionRecordSchema>;
export type ValidatedUserSetting = z.infer<typeof UserSettingSchema>;
export type ValidatedCategory = z.infer<typeof CategorySchema>;
export type ValidatedUserProfile = z.infer<typeof UserProfileSchema>;
export type ValidatedChallenge = z.infer<typeof ChallengeSchema>;
export type ValidatedUserChallenge = z.infer<typeof UserChallengeSchema>;
export type ValidatedBadge = z.infer<typeof BadgeSchema>;
export type ValidatedMission = z.infer<typeof MissionSchema>;
export type ValidatedUserMission = z.infer<typeof UserMissionSchema>;
export type ValidatedXPTransaction = z.infer<typeof XPTransactionSchema>;
export type ValidatedGameNotification = z.infer<typeof GameNotificationSchema>;
export type ValidatedCatchupPlan = z.infer<typeof CatchupPlanSchema>;