CREATE TYPE "public"."goal_type" AS ENUM('frequency_based', 'schedule_based');--> statement-breakpoint
CREATE TABLE "catchup_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"routine_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"target_period_start" timestamp with time zone NOT NULL,
	"target_period_end" timestamp with time zone NOT NULL,
	"original_target" integer NOT NULL,
	"current_progress" integer NOT NULL,
	"remaining_target" integer NOT NULL,
	"suggested_daily_target" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "goal_type" "goal_type" DEFAULT 'schedule_based' NOT NULL;--> statement-breakpoint
ALTER TABLE "routines" ADD COLUMN "target_period" text;--> statement-breakpoint
ALTER TABLE "catchup_plans" ADD CONSTRAINT "catchup_plans_routine_id_routines_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catchup_plans" ADD CONSTRAINT "catchup_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;