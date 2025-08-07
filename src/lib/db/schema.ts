import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Enums
export const targetFrequencyEnum = pgEnum('target_frequency', ['daily', 'weekly', 'monthly']);
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
  targetFrequency: targetFrequencyEnum('target_frequency').notNull(),
  targetCount: integer('target_count'),
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

// 型のエクスポート
export type User = typeof users.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type ExecutionRecord = typeof executionRecords.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type UserSetting = typeof userSettings.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertRoutine = typeof routines.$inferInsert;
export type InsertExecutionRecord = typeof executionRecords.$inferInsert;
export type InsertCategory = typeof categories.$inferInsert;
export type InsertUserSetting = typeof userSettings.$inferInsert;
