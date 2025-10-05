import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// 最小限のenum
export const frequencyTypeEnum = pgEnum('frequency_type', ['weekly', 'monthly']);

// Users テーブル（認証対応の最小限）
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Habits テーブル（やることの定義）
export const habits = pgTable('habits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  targetCount: integer('target_count').notNull(),
  frequencyType: frequencyTypeEnum('frequency_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Habit Logs テーブル（実行記録）
export const habitLogs = pgTable('habit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  habitId: uuid('habit_id').references(() => habits.id, { onDelete: 'cascade' }).notNull(),
  doneAt: timestamp('done_at', { withTimezone: true }).defaultNow().notNull(),
});

// 型のエクスポート
export type User = typeof users.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertHabit = typeof habits.$inferInsert;
export type InsertHabitLog = typeof habitLogs.$inferInsert;