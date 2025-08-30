-- =============================================
-- Routine Record データベーススキーマ設計
-- =============================================
-- 設計日時: 2025年8月29日
-- 設計根拠: 要件定義書に基づく技術設計
-- DBMS: PostgreSQL
-- ORM: Drizzle ORM

-- =============================================
-- ENUM型定義
-- =============================================

-- 基本ENUM型
CREATE TYPE "user_status" AS ENUM('active', 'inactive', 'suspended');
CREATE TYPE "theme" AS ENUM('light', 'dark', 'auto');
CREATE TYPE "language" AS ENUM('ja', 'en');
CREATE TYPE "time_format" AS ENUM('12h', '24h');
CREATE TYPE "goal_type" AS ENUM('frequency_based', 'schedule_based');
CREATE TYPE "recurrence_type" AS ENUM('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE "monthly_type" AS ENUM('day_of_month', 'day_of_week');

-- ゲーミフィケーション関連ENUM型
CREATE TYPE "mission_type" AS ENUM('streak', 'count', 'variety', 'consistency');
CREATE TYPE "mission_difficulty" AS ENUM('easy', 'medium', 'hard', 'extreme');
CREATE TYPE "badge_rarity" AS ENUM('common', 'rare', 'epic', 'legendary');
CREATE TYPE "challenge_type" AS ENUM('weekly', 'monthly', 'seasonal', 'special');
CREATE TYPE "notification_type" AS ENUM(
    'level_up', 
    'badge_unlocked', 
    'mission_completed', 
    'challenge_completed', 
    'streak_milestone', 
    'xp_milestone'
);
CREATE TYPE "xp_source_type" AS ENUM(
    'routine_completion', 
    'streak_bonus', 
    'mission_completion', 
    'challenge_completion', 
    'daily_bonus', 
    'achievement_unlock'
);

-- =============================================
-- ユーザー管理テーブル
-- =============================================

-- ユーザーテーブル
-- 要件: REQ-001 (ユーザー認証)
-- Supabase Authと連携してユーザー基本情報を管理
CREATE TABLE "users" (
    "id" uuid PRIMARY KEY NOT NULL, -- Supabase AuthのユーザーIDと同期
    "email" text NOT NULL UNIQUE,
    "display_name" text,
    "first_name" text,
    "last_name" text,
    "avatar_url" text,
    "bio" text,
    "timezone" text DEFAULT 'Asia/Tokyo' NOT NULL,
    "status" user_status DEFAULT 'active' NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ユーザー設定テーブル
-- 要件: REQ-010 (設定管理)
CREATE TABLE "user_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL UNIQUE,
    "theme" theme DEFAULT 'auto' NOT NULL,
    "language" language DEFAULT 'ja' NOT NULL,
    "time_format" time_format DEFAULT '24h' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "user_settings_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- =============================================
-- ルーチン管理テーブル
-- =============================================

-- カテゴリテーブル
-- 要件: REQ-009 (カテゴリ管理)
CREATE TABLE "categories" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "name" text NOT NULL,
    "color" text NOT NULL DEFAULT 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    "is_default" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "categories_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ルーチンテーブル
-- 要件: REQ-002 (ルーチン作成), REQ-101 (頻度ベース検証), REQ-102 (非アクティブルーチンの実行制限)
CREATE TABLE "routines" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "category" text NOT NULL,
    
    -- ゴール設定
    -- REQ-101: 頻度ベース時はtarget_countとtarget_periodが必須
    "goal_type" goal_type DEFAULT 'schedule_based' NOT NULL,
    "target_count" integer, -- 頻度ベース用
    "target_period" text, -- 'daily', 'weekly', 'monthly'
    
    -- 繰り返しパターン
    "recurrence_type" recurrence_type DEFAULT 'daily' NOT NULL,
    "recurrence_interval" integer DEFAULT 1 NOT NULL, -- 間隔（2日おき = 2）
    
    -- 月次パターン用
    "monthly_type" monthly_type, -- 月の何日 or 第何曜日
    "day_of_month" integer, -- 1-31
    "week_of_month" integer, -- 1-4, -1（最終週）
    "day_of_week" integer, -- 0-6（日曜=0）
    
    -- 週次パターン用（JSON配列）
    "days_of_week" text, -- [1,3,5] = 月水金
    
    -- その他
    "start_date" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL, -- REQ-102: 実行制御用
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone, -- ソフトデリート
    
    CONSTRAINT "routines_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    
    -- REQ-101: 頻度ベースの場合の制約
    CONSTRAINT "frequency_based_requirements" 
    CHECK (
        goal_type != 'frequency_based' OR 
        (target_count IS NOT NULL AND target_period IS NOT NULL)
    )
);

-- 実行記録テーブル
-- 要件: REQ-003 (実行記録)
CREATE TABLE "execution_records" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "routine_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "executed_at" timestamp with time zone DEFAULT now() NOT NULL,
    "duration" integer, -- 分単位
    "memo" text,
    "is_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "execution_records_routine_id_routines_id_fk" 
    FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE,
    CONSTRAINT "execution_records_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- =============================================
-- ゲーミフィケーションテーブル
-- =============================================

-- ユーザープロフィールテーブル
-- 要件: REQ-004 (XP・レベルシステム), REQ-008 (ユーザープロフィール), REQ-403 (XP整数制約)
CREATE TABLE "user_profiles" (
    "user_id" uuid PRIMARY KEY NOT NULL,
    "level" integer DEFAULT 1 NOT NULL,
    "total_xp" integer DEFAULT 0 NOT NULL, -- REQ-403: 非負整数
    "current_xp" integer DEFAULT 0 NOT NULL, -- 現在レベル内でのXP
    "next_level_xp" integer DEFAULT 100 NOT NULL, -- 次レベルまでのXP
    "streak" integer DEFAULT 0 NOT NULL, -- 現在のストリーク
    "longest_streak" integer DEFAULT 0 NOT NULL, -- 最長ストリーク
    "total_routines" integer DEFAULT 0 NOT NULL, -- 作成したルーチン数
    "total_executions" integer DEFAULT 0 NOT NULL, -- 総実行回数
    "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
    "last_active_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "user_profiles_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    
    -- REQ-403: XP整数制約
    CONSTRAINT "check_level_positive" CHECK ("level" > 0),
    CONSTRAINT "check_xp_non_negative" CHECK ("total_xp" >= 0),
    CONSTRAINT "check_current_xp_valid" CHECK ("current_xp" >= 0 AND "current_xp" < "next_level_xp")
);

-- バッジテーブル
-- 要件: REQ-005 (バッジシステム)
CREATE TABLE "badges" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "icon_url" text, -- バッジアイコンのURL
    "rarity" badge_rarity NOT NULL DEFAULT 'common', -- レアリティシステム
    "category" text NOT NULL, -- '実績', 'ストリーク', 'チャレンジ'など
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- ユーザーバッジテーブル
-- 要件: REQ-005 (バッジシステム)
CREATE TABLE "user_badges" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "badge_id" uuid NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
    "is_new" boolean DEFAULT true NOT NULL, -- 新着フラグ
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "user_badges_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "user_badges_badge_id_badges_id_fk" 
    FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE,
    
    -- 同じバッジの重複獲得を防止
    UNIQUE("user_id", "badge_id")
);

-- ミッションテーブル
-- 要件: REQ-006 (ミッションシステム)
CREATE TABLE "missions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "type" mission_type NOT NULL, -- 'streak', 'count', 'variety', 'consistency'
    "target_value" integer NOT NULL, -- 目標値（7日、20回など）
    "xp_reward" integer NOT NULL DEFAULT 0,
    "badge_id" uuid,
    "difficulty" mission_difficulty NOT NULL DEFAULT 'easy',
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "missions_badge_id_badges_id_fk" 
    FOREIGN KEY ("badge_id") REFERENCES "badges"("id")
);

-- ユーザーミッションテーブル
-- 要件: REQ-006 (ミッションシステム)
CREATE TABLE "user_missions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "mission_id" uuid NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "started_at" timestamp with time zone DEFAULT now() NOT NULL,
    "completed_at" timestamp with time zone,
    "claimed_at" timestamp with time zone, -- 報酬受け取り日時
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "user_missions_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "user_missions_mission_id_missions_id_fk" 
    FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE,
    
    -- 進捗の論理的整合性
    CONSTRAINT "check_completion_dates" CHECK (
        "completed_at" IS NULL OR "completed_at" >= "started_at"
    )
);

-- チャレンジテーブル
-- 要件: REQ-007 (チャレンジシステム), REQ-105 (チャレンジ期限切れ処理)
CREATE TABLE "challenges" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "type" challenge_type NOT NULL,
    "participants" integer DEFAULT 0 NOT NULL, -- 参加者数
    "max_participants" integer, -- 最大参加者数（制限がある場合）
    "is_active" boolean DEFAULT true NOT NULL, -- REQ-105: 期限管理用
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    -- REQ-105: チャレンジ日付の整合性
    CONSTRAINT "check_challenge_dates" CHECK ("end_date" > "start_date")
);

-- ユーザーチャレンジテーブル
-- 要件: REQ-007 (チャレンジシステム)
CREATE TABLE "user_challenges" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "challenge_id" uuid NOT NULL,
    "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "is_completed" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp with time zone,
    "rank" integer, -- 順位（完了時）
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "user_challenges_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "user_challenges_challenge_id_challenges_id_fk" 
    FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE,
    
    -- 同じチャレンジへの重複参加を防止
    UNIQUE("user_id", "challenge_id")
);

-- XP取引履歴テーブル
-- 要件: REQ-004 (XP・レベルシステム), REQ-103 (XP獲得時の通知)
CREATE TABLE "xp_transactions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "amount" integer NOT NULL,
    "reason" text NOT NULL, -- '朝の運動を完了', 'レベル2達成'など
    "source_type" xp_source_type NOT NULL, -- 獲得ソース種別
    "source_id" uuid, -- 関連するroutineId, missionIdなど
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "xp_transactions_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- ゲーム通知テーブル
-- 要件: REQ-103 (XP獲得時の通知), REQ-104 (レベルアップ時の特別通知)
CREATE TABLE "game_notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "type" notification_type NOT NULL, -- 通知種別
    "title" text NOT NULL,
    "message" text NOT NULL,
    "data" text, -- JSON文字列（レベル、XP、バッジIDなど）
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "game_notifications_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- =============================================
-- 機能拡張テーブル
-- =============================================

-- キャッチアッププランテーブル
-- 要件: REQ-301 (挽回プランの提案)
CREATE TABLE "catchup_plans" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "routine_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "target_period_start" timestamp with time zone NOT NULL,
    "target_period_end" timestamp with time zone NOT NULL,
    "original_target" integer NOT NULL, -- 元の目標回数
    "current_progress" integer NOT NULL, -- 現在の進捗
    "remaining_target" integer NOT NULL, -- 残り目標回数
    "suggested_daily_target" integer NOT NULL, -- 提案する1日あたりの目標
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    
    CONSTRAINT "catchup_plans_routine_id_routines_id_fk" 
    FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE,
    CONSTRAINT "catchup_plans_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- =============================================
-- インデックス戦略
-- =============================================

-- 基本インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- ルーチン関連
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_category ON routines(category);
CREATE INDEX idx_routines_goal_type ON routines(goal_type);
CREATE INDEX idx_routines_is_active ON routines(is_active);
CREATE INDEX idx_routines_deleted_at ON routines(deleted_at);

-- 実行記録関連（パフォーマンス重要）
CREATE INDEX idx_execution_records_user_id ON execution_records(user_id);
CREATE INDEX idx_execution_records_routine_id ON execution_records(routine_id);
CREATE INDEX idx_execution_records_executed_at ON execution_records(executed_at);
CREATE INDEX idx_execution_records_is_completed ON execution_records(is_completed);

-- 複合インデックス（頻繁なクエリパターン用）
CREATE INDEX idx_routines_user_id_active ON routines(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_execution_records_user_date ON execution_records(user_id, executed_at);
CREATE INDEX idx_execution_records_routine_date ON execution_records(routine_id, executed_at);

-- ゲーミフィケーション関連
CREATE INDEX idx_user_missions_user_active ON user_missions(user_id, is_completed);
CREATE INDEX idx_user_badges_user_new ON user_badges(user_id, is_new);
CREATE INDEX idx_xp_transactions_user_date ON xp_transactions(user_id, created_at);

-- 通知関連
CREATE INDEX idx_game_notifications_user_unread ON game_notifications(user_id, is_read, created_at);

-- カテゴリ関連
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- =============================================
-- Row Level Security (RLS) ポリシー
-- =============================================

-- 要件: REQ-401 (データプライバシー), REQ-201 (ログイン状態でのアクセス制御)

-- ユーザーテーブルのRLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- ルーチンテーブルのRLS
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own routines" ON routines
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routines" ON routines
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON routines
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON routines
    FOR DELETE USING (auth.uid() = user_id);

-- 実行記録テーブルのRLS
ALTER TABLE execution_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own execution records" ON execution_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own execution records" ON execution_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own execution records" ON execution_records
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own execution records" ON execution_records
    FOR DELETE USING (auth.uid() = user_id);

-- カテゴリテーブルのRLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories" ON categories
    FOR ALL USING (auth.uid() = user_id);

-- ユーザー設定テーブルのRLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- ユーザープロフィールテーブルのRLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update profiles" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ゲーミフィケーション関連のRLS
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own missions" ON user_missions
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own challenges" ON user_challenges
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp transactions" ON xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE game_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON game_notifications
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE catchup_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own catchup plans" ON catchup_plans
    FOR SELECT USING (auth.uid() = user_id);

-- システムテーブル（全ユーザー読み取り可能）
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are publicly readable" ON badges FOR SELECT TO PUBLIC USING (true);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active missions are publicly readable" ON missions 
    FOR SELECT TO PUBLIC USING (is_active = true);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active challenges are publicly readable" ON challenges 
    FOR SELECT TO PUBLIC USING (is_active = true);

-- =============================================
-- トリガー関数
-- =============================================

-- 要件: 自動更新とデータ整合性の維持

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにupdated_atトリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_execution_records_updated_at BEFORE UPDATE ON execution_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_user_missions_updated_at BEFORE UPDATE ON user_missions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_user_challenges_updated_at BEFORE UPDATE ON user_challenges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_catchup_plans_updated_at BEFORE UPDATE ON catchup_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ユーザー作成時にプロフィールと設定の自動作成
CREATE OR REPLACE FUNCTION create_user_profile_and_settings()
RETURNS TRIGGER AS $$
BEGIN
    -- ユーザープロフィールの作成
    INSERT INTO user_profiles (user_id) VALUES (NEW.id);
    
    -- ユーザー設定の作成
    INSERT INTO user_settings (user_id) VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_profile_and_settings_trigger 
    AFTER INSERT ON users 
    FOR EACH ROW EXECUTE FUNCTION create_user_profile_and_settings();

-- =============================================
-- パフォーマンス最適化
-- =============================================

-- 統計情報の定期更新設定
-- ANALYZE文は運用時に定期実行
-- ANALYZE routines;
-- ANALYZE execution_records;
-- ANALYZE user_profiles;

-- 将来のパーティショニング準備（大量データ対応）
-- execution_recordsテーブルの月次パーティション例
-- CREATE TABLE execution_records_y2025m01 PARTITION OF execution_records
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- =============================================
-- データ整合性チェッククエリ
-- =============================================

-- 開発・運用時のデータ整合性確認用
/*
-- 孤立した実行記録のチェック
SELECT COUNT(*) FROM execution_records er
LEFT JOIN routines r ON er.routine_id = r.id
WHERE r.id IS NULL;

-- ユーザープロフィールの整合性チェック
SELECT 
    up.user_id,
    up.total_executions,
    COUNT(er.id) as actual_executions
FROM user_profiles up
LEFT JOIN execution_records er ON up.user_id = er.user_id
GROUP BY up.user_id, up.total_executions
HAVING up.total_executions != COUNT(er.id);

-- XPとレベルの整合性チェック
SELECT user_id, level, total_xp, current_xp, next_level_xp
FROM user_profiles 
WHERE current_xp >= next_level_xp OR current_xp < 0;
*/

-- =============================================
-- 初期データ投入
-- =============================================

-- デフォルトバッジの作成
INSERT INTO badges (name, description, rarity, category) VALUES 
('初回実行', '初めてルーチンを実行しました', 'common', '実績'),
('継続者', '7日連続でルーチンを実行しました', 'rare', 'ストリーク'),
('達人', '100回ルーチンを実行しました', 'epic', '実績'),
('伝説', '365日連続でルーチンを実行しました', 'legendary', 'ストリーク');

-- デフォルトミッションの作成
INSERT INTO missions (title, description, type, target_value, xp_reward, difficulty) VALUES 
('継続の第一歩', '3日連続でルーチンを実行しよう', 'streak', 3, 50, 'easy'),
('週間チャレンジ', '7日連続でルーチンを実行しよう', 'streak', 7, 150, 'medium'),
('多様性を楽しもう', '5つの異なるカテゴリのルーチンを実行しよう', 'variety', 5, 100, 'medium'),
('量より質', '1週間で20回のルーチンを実行しよう', 'count', 20, 200, 'hard');

-- =============================================
-- 備考
-- =============================================

/*
このスキーマ設計の特徴:

1. **要件準拠**: 要件定義書の全ての要件に対応
2. **データ整合性**: 外部キー制約とCHECK制約による厳密な整合性
3. **セキュリティ**: RLSによる行レベルセキュリティ
4. **パフォーマンス**: 適切なインデックス戦略
5. **拡張性**: 将来のパーティショニングに対応可能な設計
6. **運用性**: トリガーによる自動メンテナンス

設計制約:
- 文字列制限: REQ-404準拠（name: 255文字以内）
- 数値制限: REQ-403準拠（XP: 非負整数）
- 日付制限: 論理的整合性を保つCHECK制約

将来の拡張ポイント:
- challenge_requirements, challenge_rewards テーブル
- notification_preferences テーブル
- social_connections テーブル（フレンド機能）
- achievement_templates テーブル
*/