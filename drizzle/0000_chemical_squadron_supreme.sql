-- 既存の全テーブルとenum型を削除
DROP TABLE IF EXISTS "public"."game_notifications" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."xp_transactions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."user_challenges" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."challenge_rewards" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."challenge_requirements" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."challenges" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."user_profiles" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."user_badges" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."badges" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."user_missions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."missions" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."catchup_plans" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."execution_records" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."routines" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."categories" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."user_settings" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "public"."users" CASCADE;--> statement-breakpoint

DROP TYPE IF EXISTS "public"."frequency_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."xp_source_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."notification_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."challenge_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."badge_rarity" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."mission_difficulty" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."mission_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."monthly_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."recurrence_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."goal_type" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."language" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."theme" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."time_format" CASCADE;--> statement-breakpoint
DROP TYPE IF EXISTS "public"."user_status" CASCADE;--> statement-breakpoint

-- 新しいシンプルスキーマを作成
CREATE TYPE "public"."frequency_type" AS ENUM('weekly', 'monthly');--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"done_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"target_count" integer NOT NULL,
	"frequency_type" "frequency_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;