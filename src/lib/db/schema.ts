import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Enums
export const goalTypeEnum = pgEnum('goal_type', ['frequency_based', 'schedule_based']);
export const recurrenceTypeEnum = pgEnum('recurrence_type', ['daily', 'weekly', 'monthly', 'custom']);
export const monthlyTypeEnum = pgEnum('monthly_type', ['day_of_month', 'day_of_week']);
export const themeEnum = pgEnum('theme', ['light', 'dark', 'auto']);
export const languageEnum = pgEnum('language', ['ja', 'en']);
export const timeFormatEnum = pgEnum('time_format', ['12h', '24h']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);

// Gamification Enums
export const missionTypeEnum = pgEnum('mission_type', ['streak', 'count', 'variety', 'consistency']);
export const missionDifficultyEnum = pgEnum('mission_difficulty', ['easy', 'medium', 'hard', 'extreme']);
export const badgeRarityEnum = pgEnum('badge_rarity', ['common', 'rare', 'epic', 'legendary']);
export const challengeTypeEnum = pgEnum('challenge_type', ['weekly', 'monthly', 'seasonal', 'special']);
export const notificationTypeEnum = pgEnum('notification_type', ['level_up', 'badge_unlocked', 'mission_completed', 'challenge_completed', 'streak_milestone', 'xp_milestone']);
export const xpSourceTypeEnum = pgEnum('xp_source_type', ['routine_completion', 'streak_bonus', 'mission_completion', 'challenge_completion', 'daily_bonus', 'achievement_unlock']);

// Users テーブル（Supabase Authと連携）
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Supabase AuthのユーザーIDと同じ
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  timezone: text('timezone').default('Asia/Tokyo'),
  status: userStatusEnum('status').default('active').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Routines テーブル
export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  // ミッションのタイプ（頻度ベース vs スケジュールベース）
  goalType: goalTypeEnum('goal_type').default('schedule_based').notNull(),
  
  // 頻度ベース用の設定
  targetCount: integer('target_count'), // 期間内の目標実行回数
  targetPeriod: text('target_period'), // 'daily', 'weekly', 'monthly' - 目標期間
  
  // スケジュールベース用の繰り返しパターン設定
  recurrenceType: recurrenceTypeEnum('recurrence_type').default('daily').notNull(),
  recurrenceInterval: integer('recurrence_interval').default(1), // 間隔（2日おき = 2）
  
  // 月次パターン用
  monthlyType: monthlyTypeEnum('monthly_type'), // 月の何日 or 第何曜日
  dayOfMonth: integer('day_of_month'), // 1-31（月の何日）
  weekOfMonth: integer('week_of_month'), // 1-4, -1（第何週、-1は最終週）
  dayOfWeek: integer('day_of_week'), // 0-6（日曜=0）
  
  // 週次パターン用（JSON配列として保存）
  daysOfWeek: text('days_of_week'), // [1,3,5] = 月水金（JSON文字列）
  
  // カスタム間隔用
  startDate: timestamp('start_date', { withTimezone: true }), // 基準日
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // ソフトデリート用
});

// Execution Records テーブル
export const executionRecords = pgTable('execution_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  routineId: uuid('routine_id')
    .references(() => routines.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  executedAt: timestamp('executed_at', { withTimezone: true }).defaultNow().notNull(),
  duration: integer('duration'), // 分単位
  memo: text('memo'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Categories テーブル
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  color: text('color')
    .notNull()
    .default('bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'),
  isDefault: boolean('is_default').default(false).notNull(), // システムデフォルトカテゴリかどうか
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Settings テーブル
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  theme: themeEnum('theme').default('auto').notNull(),
  language: languageEnum('language').default('ja').notNull(),
  timeFormat: timeFormatEnum('time_format').default('24h').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Catchup Plans テーブル（挽回プラン）
export const catchupPlans = pgTable('catchup_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  routineId: uuid('routine_id')
    .references(() => routines.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  targetPeriodStart: timestamp('target_period_start', { withTimezone: true }).notNull(),
  targetPeriodEnd: timestamp('target_period_end', { withTimezone: true }).notNull(),
  originalTarget: integer('original_target').notNull(), // 元の目標回数
  currentProgress: integer('current_progress').notNull(), // 現在の進捗
  remainingTarget: integer('remaining_target').notNull(), // 残り目標回数
  suggestedDailyTarget: integer('suggested_daily_target').notNull(), // 提案する1日あたりの目標
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// === GAMIFICATION TABLES ===

// Missions テーブル
export const missions = pgTable('missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: missionTypeEnum('type').notNull(),
  targetValue: integer('target_value').notNull(), // 目標値（7日、20回など）
  xpReward: integer('xp_reward').notNull().default(0),
  badgeId: uuid('badge_id').references(() => badges.id), // 報酬バッジ（任意）
  difficulty: missionDifficultyEnum('difficulty').notNull().default('easy'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Missions テーブル（ユーザーのミッション進捗）
export const userMissions = pgTable('user_missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  missionId: uuid('mission_id')
    .references(() => missions.id, { onDelete: 'cascade' })
    .notNull(),
  progress: integer('progress').default(0).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  claimedAt: timestamp('claimed_at', { withTimezone: true }), // 報酬受け取り日時
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Badges テーブル
export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  iconUrl: text('icon_url'), // バッジアイコンのURL
  rarity: badgeRarityEnum('rarity').notNull().default('common'),
  category: text('category').notNull(), // '実績', 'ストリーク', 'チャレンジ'など
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Badges テーブル（ユーザーが獲得したバッジ）
export const userBadges = pgTable('user_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  badgeId: uuid('badge_id')
    .references(() => badges.id, { onDelete: 'cascade' })
    .notNull(),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow().notNull(),
  isNew: boolean('is_new').default(true).notNull(), // 新着フラグ
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Profiles テーブル（ゲーミフィケーション用プロフィール）
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),
  level: integer('level').default(1).notNull(),
  totalXP: integer('total_xp').default(0).notNull(),
  currentXP: integer('current_xp').default(0).notNull(), // 現在レベル内でのXP
  nextLevelXP: integer('next_level_xp').default(100).notNull(), // 次レベルまでのXP
  streak: integer('streak').default(0).notNull(), // 現在のストリーク
  longestStreak: integer('longest_streak').default(0).notNull(), // 最長ストリーク
  totalRoutines: integer('total_routines').default(0).notNull(), // 作成したルーティン数
  totalExecutions: integer('total_executions').default(0).notNull(), // 総実行回数
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Challenges テーブル
export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  type: challengeTypeEnum('type').notNull(),
  participants: integer('participants').default(0).notNull(), // 参加者数
  maxParticipants: integer('max_participants'), // 最大参加者数（制限がある場合）
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Challenge Requirements テーブル（チャレンジの達成条件）
export const challengeRequirements = pgTable('challenge_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id')
    .references(() => challenges.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // 'routine_count', 'streak_days', 'category_variety'など
  value: integer('value').notNull(), // 必要な値
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Challenge Rewards テーブル（チャレンジの報酬）
export const challengeRewards = pgTable('challenge_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeId: uuid('challenge_id')
    .references(() => challenges.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  badgeId: uuid('badge_id').references(() => badges.id), // 報酬バッジ
  xpAmount: integer('xp_amount').default(0), // 報酬XP
  requirement: text('requirement').notNull(), // 'completion', 'top_10'など
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Challenges テーブル（ユーザーのチャレンジ参加状況）
export const userChallenges = pgTable('user_challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  challengeId: uuid('challenge_id')
    .references(() => challenges.id, { onDelete: 'cascade' })
    .notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  progress: integer('progress').default(0).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  rank: integer('rank'), // 順位（完了時）
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// XP Transactions テーブル（XP獲得履歴）
export const xpTransactions = pgTable('xp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(), // '朝の運動を完了', 'レベル2達成'など
  sourceType: xpSourceTypeEnum('source_type').notNull(),
  sourceId: uuid('source_id'), // 関連するroutineId, missionIdなど
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Game Notifications テーブル（ゲーミフィケーション通知）
export const gameNotifications = pgTable('game_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: text('data'), // JSON文字列（レベル、XP、バッジIDなど）
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 型のエクスポート
export type User = typeof users.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type ExecutionRecord = typeof executionRecords.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type UserSetting = typeof userSettings.$inferSelect;
export type CatchupPlan = typeof catchupPlans.$inferSelect;

// Gamification Types
export type Mission = typeof missions.$inferSelect;
export type UserMission = typeof userMissions.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type ChallengeRequirement = typeof challengeRequirements.$inferSelect;
export type ChallengeReward = typeof challengeRewards.$inferSelect;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type XPTransaction = typeof xpTransactions.$inferSelect;
export type GameNotification = typeof gameNotifications.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertRoutine = typeof routines.$inferInsert;
export type InsertExecutionRecord = typeof executionRecords.$inferInsert;
export type InsertCategory = typeof categories.$inferInsert;
export type InsertUserSetting = typeof userSettings.$inferInsert;
export type InsertCatchupPlan = typeof catchupPlans.$inferInsert;

// Gamification Insert Types
export type InsertMission = typeof missions.$inferInsert;
export type InsertUserMission = typeof userMissions.$inferInsert;
export type InsertBadge = typeof badges.$inferInsert;
export type InsertUserBadge = typeof userBadges.$inferInsert;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type InsertChallenge = typeof challenges.$inferInsert;
export type InsertChallengeRequirement = typeof challengeRequirements.$inferInsert;
export type InsertChallengeReward = typeof challengeRewards.$inferInsert;
export type InsertUserChallenge = typeof userChallenges.$inferInsert;
export type InsertXPTransaction = typeof xpTransactions.$inferInsert;
export type InsertGameNotification = typeof gameNotifications.$inferInsert;
