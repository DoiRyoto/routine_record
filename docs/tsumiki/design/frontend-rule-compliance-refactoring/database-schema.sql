-- ========================================
-- フロントエンド実装ルール遵守リファクタリング
-- データベーススキーマ設計
-- ========================================

-- 設計方針:
-- 1. TypeScript型定義の唯一の情報源
-- 2. Drizzle ORMによる型安全な操作
-- 3. 正規化レベル3NFを基本とし、パフォーマンス要件に応じて非正規化
-- 4. PostgreSQL固有機能を活用

-- ========================================
-- 基本設定
-- ========================================

-- UUID拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- タイムゾーン設定
SET TIMEZONE = 'Asia/Tokyo';

-- ========================================
-- Enum型定義（PostgreSQL）
-- ========================================

-- ルーチン関連Enum
CREATE TYPE goal_type AS ENUM ('frequency_based', 'schedule_based');
CREATE TYPE recurrence_type AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE monthly_type AS ENUM ('day_of_month', 'day_of_week');

-- ユーザー設定関連Enum
CREATE TYPE theme AS ENUM ('light', 'dark', 'auto');
CREATE TYPE language AS ENUM ('ja', 'en');
CREATE TYPE time_format AS ENUM ('12h', '24h');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- ゲーミフィケーション関連Enum
CREATE TYPE mission_type AS ENUM ('streak', 'count', 'variety', 'consistency');
CREATE TYPE mission_difficulty AS ENUM ('easy', 'medium', 'hard', 'extreme');
CREATE TYPE badge_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE challenge_type AS ENUM ('weekly', 'monthly', 'seasonal', 'special');
CREATE TYPE notification_type AS ENUM (
  'level_up',
  'badge_unlocked', 
  'mission_completed',
  'challenge_completed',
  'streak_milestone',
  'xp_milestone'
);
CREATE TYPE xp_source_type AS ENUM (
  'routine_completion',
  'streak_bonus',
  'mission_completion',
  'challenge_completion',
  'daily_bonus',
  'achievement_unlock'
);

-- ========================================
-- コアテーブル定義
-- ========================================

-- Users テーブル（Supabase Authと連携）
CREATE TABLE users (
    -- 基本情報
    id UUID PRIMARY KEY, -- Supabase AuthのユーザーIDと同期
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    
    -- 設定
    timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
    status user_status DEFAULT 'active' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- タイムスタンプ
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT users_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_display_name_check CHECK (LENGTH(display_name) >= 1)
);

-- Users テーブルインデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Routines テーブル
CREATE TABLE routines (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    
    -- 目標設定
    goal_type goal_type DEFAULT 'schedule_based' NOT NULL,
    target_count INTEGER,
    
    -- スケジュール設定
    recurrence_type recurrence_type DEFAULT 'daily' NOT NULL,
    recurrence_pattern JSONB,
    specific_days INTEGER[], -- 曜日指定 (0=日曜, 1=月曜, ..., 6=土曜)
    
    -- 月次設定
    monthly_type monthly_type,
    day_of_month INTEGER,
    week_of_month INTEGER,
    day_of_week INTEGER,
    
    -- 時間設定
    reminder_time TIME,
    estimated_duration INTEGER, -- 分単位
    
    -- 状態
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- ゲーミフィケーション
    xp_reward INTEGER DEFAULT 10 NOT NULL,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT routines_name_check CHECK (LENGTH(name) >= 1),
    CONSTRAINT routines_target_count_check CHECK (target_count IS NULL OR target_count > 0),
    CONSTRAINT routines_day_of_month_check CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
    CONSTRAINT routines_week_of_month_check CHECK (week_of_month IS NULL OR (week_of_month >= 1 AND week_of_month <= 4)),
    CONSTRAINT routines_day_of_week_check CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
    CONSTRAINT routines_xp_reward_check CHECK (xp_reward >= 0)
);

-- Routines テーブルインデックス
CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_category ON routines(category);
CREATE INDEX idx_routines_is_active ON routines(is_active);
CREATE INDEX idx_routines_recurrence_type ON routines(recurrence_type);
CREATE INDEX idx_routines_created_at ON routines(created_at);

-- Execution Records テーブル
CREATE TABLE execution_records (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    
    -- 実行情報
    executed_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    notes TEXT,
    
    -- メタデータ
    metadata JSONB,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT execution_records_duration_check CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    CONSTRAINT execution_records_executed_at_check CHECK (executed_at <= CURRENT_TIMESTAMP)
);

-- Execution Records テーブルインデックス
CREATE INDEX idx_execution_records_user_id ON execution_records(user_id);
CREATE INDEX idx_execution_records_routine_id ON execution_records(routine_id);
CREATE INDEX idx_execution_records_executed_at ON execution_records(executed_at);
CREATE INDEX idx_execution_records_user_executed_at ON execution_records(user_id, executed_at);

-- ========================================
-- ゲーミフィケーションテーブル
-- ========================================

-- User Profiles テーブル（ゲーミフィケーション情報）
CREATE TABLE user_profiles (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- レベル・XP情報
    level INTEGER DEFAULT 1 NOT NULL,
    current_xp INTEGER DEFAULT 0 NOT NULL,
    total_xp INTEGER DEFAULT 0 NOT NULL,
    next_level_xp INTEGER DEFAULT 100 NOT NULL,
    
    -- ストリーク情報
    streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_active_at TIMESTAMPTZ,
    
    -- 統計情報
    routines_completed INTEGER DEFAULT 0 NOT NULL,
    total_minutes_logged INTEGER DEFAULT 0 NOT NULL,
    badges_earned INTEGER DEFAULT 0 NOT NULL,
    challenges_completed INTEGER DEFAULT 0 NOT NULL,
    
    -- タイトル
    current_title VARCHAR(100),
    available_titles VARCHAR(100)[],
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT user_profiles_level_check CHECK (level >= 1),
    CONSTRAINT user_profiles_xp_check CHECK (current_xp >= 0 AND total_xp >= 0 AND next_level_xp > 0),
    CONSTRAINT user_profiles_streak_check CHECK (streak >= 0 AND longest_streak >= 0),
    CONSTRAINT user_profiles_stats_check CHECK (
        routines_completed >= 0 AND 
        total_minutes_logged >= 0 AND 
        badges_earned >= 0 AND 
        challenges_completed >= 0
    )
);

-- User Profiles テーブルインデックス
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_total_xp ON user_profiles(total_xp);

-- XP Transactions テーブル
CREATE TABLE xp_transactions (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- XP情報
    amount INTEGER NOT NULL,
    source_type xp_source_type NOT NULL,
    source_id UUID, -- 関連エンティティのID（routine_id, challenge_id等）
    description VARCHAR(500),
    
    -- メタデータ
    metadata JSONB,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT xp_transactions_amount_check CHECK (amount != 0)
);

-- XP Transactions テーブルインデックス
CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_source_type ON xp_transactions(source_type);
CREATE INDEX idx_xp_transactions_created_at ON xp_transactions(created_at);
CREATE INDEX idx_xp_transactions_user_created_at ON xp_transactions(user_id, created_at);

-- Badges テーブル
CREATE TABLE badges (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    
    -- 属性
    rarity badge_rarity DEFAULT 'common' NOT NULL,
    category VARCHAR(50),
    
    -- 取得条件
    requirements JSONB NOT NULL,
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    
    -- 状態
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT badges_name_check CHECK (LENGTH(name) >= 1),
    CONSTRAINT badges_xp_reward_check CHECK (xp_reward >= 0)
);

-- Badges テーブルインデックス
CREATE INDEX idx_badges_name ON badges(name);
CREATE INDEX idx_badges_rarity ON badges(rarity);
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_is_active ON badges(is_active);

-- User Badges テーブル（多対多関係）
CREATE TABLE user_badges (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    
    -- 取得情報
    unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    progress_data JSONB,
    
    -- 制約
    UNIQUE(user_id, badge_id)
);

-- User Badges テーブルインデックス
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_unlocked_at ON user_badges(unlocked_at);

-- ========================================
-- 設定・カテゴリテーブル
-- ========================================

-- User Settings テーブル
CREATE TABLE user_settings (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- 表示設定
    theme theme DEFAULT 'auto' NOT NULL,
    language language DEFAULT 'ja' NOT NULL,
    time_format time_format DEFAULT '24h' NOT NULL,
    
    -- 通知設定
    email_notifications BOOLEAN DEFAULT TRUE NOT NULL,
    push_notifications BOOLEAN DEFAULT TRUE NOT NULL,
    reminder_notifications BOOLEAN DEFAULT TRUE NOT NULL,
    achievement_notifications BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- プライバシー設定
    profile_visibility VARCHAR(20) DEFAULT 'public' NOT NULL,
    show_streak BOOLEAN DEFAULT TRUE NOT NULL,
    show_level BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- タイムゾーン
    timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
    
    -- その他設定
    weekly_start_day INTEGER DEFAULT 1 NOT NULL, -- 1=月曜日
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT user_settings_weekly_start_day_check CHECK (weekly_start_day >= 0 AND weekly_start_day <= 6),
    CONSTRAINT user_settings_profile_visibility_check CHECK (profile_visibility IN ('public', 'friends', 'private'))
);

-- User Settings テーブルインデックス
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- Categories テーブル
CREATE TABLE categories (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULLの場合はシステム標準カテゴリ
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- 表示設定
    color VARCHAR(200) DEFAULT 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    
    -- 状態
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT categories_name_check CHECK (LENGTH(name) >= 1),
    UNIQUE(user_id, name)
);

-- Categories テーブルインデックス
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- ========================================
-- 高度なゲーミフィケーションテーブル
-- ========================================

-- Challenges テーブル
CREATE TABLE challenges (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- 種別・難易度
    type challenge_type NOT NULL,
    difficulty mission_difficulty DEFAULT 'medium' NOT NULL,
    
    -- 期間設定
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- 目標設定
    target_value INTEGER NOT NULL,
    target_unit VARCHAR(50) NOT NULL,
    requirements JSONB NOT NULL,
    
    -- 報酬
    xp_reward INTEGER DEFAULT 0 NOT NULL,
    badge_reward UUID REFERENCES badges(id),
    
    -- 状態
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT challenges_name_check CHECK (LENGTH(name) >= 1),
    CONSTRAINT challenges_date_check CHECK (start_date <= end_date),
    CONSTRAINT challenges_target_value_check CHECK (target_value > 0),
    CONSTRAINT challenges_xp_reward_check CHECK (xp_reward >= 0)
);

-- Challenges テーブルインデックス
CREATE INDEX idx_challenges_type ON challenges(type);
CREATE INDEX idx_challenges_difficulty ON challenges(difficulty);
CREATE INDEX idx_challenges_start_date ON challenges(start_date);
CREATE INDEX idx_challenges_end_date ON challenges(end_date);
CREATE INDEX idx_challenges_is_active ON challenges(is_active);

-- User Challenges テーブル（参加・進捗管理）
CREATE TABLE user_challenges (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    
    -- 進捗情報
    current_progress INTEGER DEFAULT 0 NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- 参加情報
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT user_challenges_progress_check CHECK (current_progress >= 0),
    UNIQUE(user_id, challenge_id)
);

-- User Challenges テーブルインデックス
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX idx_user_challenges_is_completed ON user_challenges(is_completed);

-- Notifications テーブル
CREATE TABLE notifications (
    -- 基本情報
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 通知内容
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- メタデータ
    metadata JSONB,
    related_id UUID, -- 関連エンティティのID
    
    -- 状態
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ,
    
    -- タイムスタンプ
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- 制約
    CONSTRAINT notifications_title_check CHECK (LENGTH(title) >= 1)
);

-- Notifications テーブルインデックス
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ========================================
-- トリガー関数（updated_at自動更新）
-- ========================================

-- updated_at自動更新用トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにupdated_atトリガーを設定
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_execution_records_updated_at BEFORE UPDATE ON execution_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badges_updated_at BEFORE UPDATE ON badges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- セキュリティ設定（Row Level Security）
-- ========================================

-- RLSの有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 基本ポリシー（ユーザーは自分のデータのみアクセス可能）
CREATE POLICY users_policy ON users FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY routines_policy ON routines FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY execution_records_policy ON execution_records FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY user_profiles_policy ON user_profiles FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY user_settings_policy ON user_settings FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY categories_policy ON categories FOR ALL USING (auth.uid()::text = user_id::text OR user_id IS NULL);
CREATE POLICY xp_transactions_policy ON xp_transactions FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY user_badges_policy ON user_badges FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY user_challenges_policy ON user_challenges FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY notifications_policy ON notifications FOR ALL USING (auth.uid()::text = user_id::text);

-- 公開データポリシー（badges、challengesは全ユーザー読み取り可能）
CREATE POLICY badges_read_policy ON badges FOR SELECT USING (TRUE);
CREATE POLICY challenges_read_policy ON challenges FOR SELECT USING (TRUE);

-- ========================================
-- 初期データ投入
-- ========================================

-- システム標準カテゴリの作成
INSERT INTO categories (user_id, name, description, color, icon, sort_order) VALUES
(NULL, 'Health', 'Health and fitness related routines', 'bg-green-100 dark:bg-green-900', '🏃', 1),
(NULL, 'Work', 'Work and productivity routines', 'bg-blue-100 dark:bg-blue-900', '💼', 2),
(NULL, 'Personal', 'Personal development routines', 'bg-purple-100 dark:bg-purple-900', '🌱', 3),
(NULL, 'Learning', 'Learning and skill development', 'bg-yellow-100 dark:bg-yellow-900', '📚', 4),
(NULL, 'Social', 'Social and relationship routines', 'bg-pink-100 dark:bg-pink-900', '👥', 5),
(NULL, 'Other', 'Other miscellaneous routines', 'bg-gray-100 dark:bg-gray-900', '📋', 6);

-- 基本バッジの作成
INSERT INTO badges (name, description, icon, rarity, category, requirements, xp_reward) VALUES
('First Step', 'Complete your first routine', '🥇', 'common', 'beginner', '{"type": "routine_count", "value": 1}', 50),
('Consistency Master', 'Complete routines for 7 consecutive days', '🔥', 'rare', 'streak', '{"type": "daily_streak", "value": 7}', 200),
('Century Club', 'Complete 100 routines', '💯', 'epic', 'milestone', '{"type": "routine_count", "value": 100}', 500),
('Early Bird', 'Complete 30 morning routines', '🌅', 'rare', 'time', '{"type": "morning_routines", "value": 30}', 300),
('Night Owl', 'Complete 30 evening routines', '🦉', 'rare', 'time', '{"type": "evening_routines", "value": 30}', 300);

-- サンプルチャレンジの作成
INSERT INTO challenges (name, description, type, difficulty, start_date, end_date, target_value, target_unit, requirements, xp_reward) VALUES
('New Year Resolution', 'Complete 20 routines in January', 'monthly', 'medium', '2025-01-01', '2025-01-31', 20, 'routines', '{"type": "routine_count", "period": "month"}', 500),
('Summer Fitness', 'Complete 50 health routines in 3 months', 'seasonal', 'hard', '2025-06-01', '2025-08-31', 50, 'health_routines', '{"type": "category_routine_count", "category": "Health"}', 1000);

-- ========================================
-- パフォーマンス最適化
-- ========================================

-- 統計情報の自動収集設定
ALTER TABLE users SET (autovacuum_analyze_scale_factor = 0.1);
ALTER TABLE routines SET (autovacuum_analyze_scale_factor = 0.1);
ALTER TABLE execution_records SET (autovacuum_analyze_scale_factor = 0.1);

-- 部分インデックス（よく使用される条件でフィルタ）
CREATE INDEX idx_routines_active_user ON routines(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_execution_records_recent ON execution_records(user_id, executed_at) WHERE executed_at >= CURRENT_TIMESTAMP - INTERVAL '30 days';

-- ========================================
-- 運用・メンテナンス用ビュー
-- ========================================

-- ユーザー統計ビュー
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.display_name,
    up.level,
    up.total_xp,
    up.streak,
    up.routines_completed,
    COUNT(r.id) as total_routines,
    COUNT(CASE WHEN r.is_active THEN 1 END) as active_routines,
    u.created_at as user_since
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN routines r ON u.id = r.user_id
GROUP BY u.id, u.email, u.display_name, up.level, up.total_xp, up.streak, up.routines_completed, u.created_at;

-- 日次実行統計ビュー
CREATE VIEW daily_execution_stats AS
SELECT 
    DATE(er.executed_at) as execution_date,
    er.user_id,
    COUNT(*) as routines_completed,
    SUM(er.duration_minutes) as total_minutes,
    AVG(er.duration_minutes) as avg_duration_minutes
FROM execution_records er
WHERE er.executed_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE(er.executed_at), er.user_id
ORDER BY execution_date DESC, user_id;

-- ========================================
-- セキュリティ・監査設定
-- ========================================

-- 監査ログテーブル（オプション）
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- データベースレベルでの制約確認
-- 例：ユーザーが削除された時に関連データも適切にカスケード削除されることを確認

-- コメント追加（ドキュメント化）
COMMENT ON DATABASE "routine_record" IS 'Routine Record - Personal Habit Tracking Application Database';
COMMENT ON TABLE users IS 'Core user information synchronized with Supabase Auth';
COMMENT ON TABLE routines IS 'User-defined routines and habits';
COMMENT ON TABLE execution_records IS 'Log of routine completions';
COMMENT ON TABLE user_profiles IS 'Gamification and statistics for users';
COMMENT ON TABLE categories IS 'Routine categorization system';

-- ========================================
-- 完了
-- ========================================

-- データベーススキーマ作成完了
-- 作成日: 2025-01-30
-- 対象: RoutineRecord Application (PostgreSQL + Drizzle ORM)
-- 設計者: Claude Code Assistant