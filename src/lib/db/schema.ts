import { pgTable, text, timestamp, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const routines = pgTable('routines', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  targetFrequency: text('target_frequency', { enum: ['daily', 'weekly', 'monthly'] }).notNull(),
  targetCount: integer('target_count'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const executionRecords = pgTable('execution_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  routineId: uuid('routine_id').references(() => routines.id).notNull(),
  executedAt: timestamp('executed_at').notNull(),
  duration: integer('duration'),
  memo: text('memo'),
  isCompleted: boolean('is_completed').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  theme: text('theme', { enum: ['light', 'dark', 'auto'] }).default('auto').notNull(),
  language: text('language', { enum: ['ja', 'en'] }).default('ja').notNull(),
  timeFormat: text('time_format', { enum: ['12h', '24h'] }).default('24h').notNull(),
  dailyGoal: integer('daily_goal').default(3).notNull(),
  weeklyGoal: integer('weekly_goal').default(20).notNull(),
  monthlyGoal: integer('monthly_goal').default(80).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  routines: many(routines),
  executionRecords: many(executionRecords),
  settings: one(userSettings),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  user: one(users, {
    fields: [routines.userId],
    references: [users.id],
  }),
  executionRecords: many(executionRecords),
}));

export const executionRecordsRelations = relations(executionRecords, ({ one }) => ({
  user: one(users, {
    fields: [executionRecords.userId],
    references: [users.id],
  }),
  routine: one(routines, {
    fields: [executionRecords.routineId],
    references: [routines.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));