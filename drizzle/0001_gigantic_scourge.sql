CREATE TYPE "public"."monthly_type" AS ENUM('day_of_month', 'day_of_week');--> statement-breakpoint
CREATE TYPE "public"."recurrence_type" AS ENUM('daily', 'weekly', 'monthly', 'custom');--> statement-breakpoint
ALTER TYPE "public"."target_frequency" ADD VALUE 'custom';--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "recurrence_type" "recurrence_type" DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "recurrence_interval" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "monthly_type" "monthly_type";--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "day_of_month" integer;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "week_of_month" integer;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "day_of_week" integer;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "days_of_week" text;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "start_date" timestamp with time zone;