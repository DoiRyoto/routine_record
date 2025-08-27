import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Enums
export const goalTypeEnum = pgEnum('goal_type', ['frequency_based', 'schedule_based']);
export const recurrenceTypeEnum = pgEnum('recurrence_type', ['daily', 'weekly', 'monthly', 'custom']);
export const monthlyTypeEnum = pgEnum('monthly_type', ['day_of_month', 'day_of_week']);
export const themeEnum = pgEnum('theme', ['light', 'dark', 'auto']);
export const languageEnum = pgEnum('language', ['ja', 'en']);
export const timeFormatEnum = pgEnum('time_format', ['12h', '24h']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'suspended']);

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

// 型のエクスポート
export type User = typeof users.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type ExecutionRecord = typeof executionRecords.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type UserSetting = typeof userSettings.$inferSelect;
export type CatchupPlan = typeof catchupPlans.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertRoutine = typeof routines.$inferInsert;
export type InsertExecutionRecord = typeof executionRecords.$inferInsert;
export type InsertCategory = typeof categories.$inferInsert;
export type InsertUserSetting = typeof userSettings.$inferInsert;
export type InsertCatchupPlan = typeof catchupPlans.$inferInsert;
