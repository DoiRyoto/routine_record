-- フロントエンドディレクトリ再編成 データベーススキーマ
-- 注: フロントエンド再編成は既存のDBスキーマに影響しないが、
-- 移行管理とメトリクス収集のためのテーブルを追加定義

-- ============================================================================
-- 移行管理用テーブル
-- ============================================================================

-- 移行進捗管理
CREATE TABLE IF NOT EXISTS frontend_migration_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase VARCHAR(50) NOT NULL, -- 'structure-creation', 'ui-component-migration'等
    task_id VARCHAR(50) NOT NULL, -- 'MIGRATION-001'等
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 移行されたファイル追跡
CREATE TABLE IF NOT EXISTS frontend_file_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_path VARCHAR(500) NOT NULL,
    new_path VARCHAR(500) NOT NULL,
    context_level VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    domain_model VARCHAR(50), -- 'user', 'routine', 'gamification'等
    file_type VARCHAR(50) NOT NULL, -- 'component', 'hook', 'utility', 'type'
    migration_phase VARCHAR(50) NOT NULL,
    git_commit_hash VARCHAR(40), -- 移行時のコミットハッシュ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 依存関係違反ログ
CREATE TABLE IF NOT EXISTS frontend_dependency_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    violation_type VARCHAR(50) NOT NULL, -- 'prohibited-import', 'circular-dependency'等
    file_path VARCHAR(500) NOT NULL,
    violating_import VARCHAR(500) NOT NULL,
    rule_violated VARCHAR(255) NOT NULL,
    severity VARCHAR(20) DEFAULT 'error', -- 'error', 'warning'
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- インデックス定義（移行管理用）
-- ============================================================================

-- 移行進捗効率的検索用
CREATE INDEX IF NOT EXISTS idx_migration_progress_phase ON frontend_migration_progress(phase);
CREATE INDEX IF NOT EXISTS idx_migration_progress_status ON frontend_migration_progress(status);
CREATE INDEX IF NOT EXISTS idx_migration_progress_created_at ON frontend_migration_progress(created_at);

-- ファイル移行履歴検索用  
CREATE INDEX IF NOT EXISTS idx_file_migrations_original_path ON frontend_file_migrations(original_path);
CREATE INDEX IF NOT EXISTS idx_file_migrations_new_path ON frontend_file_migrations(new_path);
CREATE INDEX IF NOT EXISTS idx_file_migrations_context_level ON frontend_file_migrations(context_level);
CREATE INDEX IF NOT EXISTS idx_file_migrations_domain_model ON frontend_file_migrations(domain_model);
CREATE INDEX IF NOT EXISTS idx_file_migrations_phase ON frontend_file_migrations(migration_phase);

-- 依存関係違反検索用
CREATE INDEX IF NOT EXISTS idx_dependency_violations_type ON frontend_dependency_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_dependency_violations_file_path ON frontend_dependency_violations(file_path);
CREATE INDEX IF NOT EXISTS idx_dependency_violations_resolved ON frontend_dependency_violations(resolved);

-- ============================================================================
-- 移行メトリクス集計用ビュー
-- ============================================================================

-- 移行進捗サマリービュー
CREATE OR REPLACE VIEW frontend_migration_summary AS
SELECT 
    phase,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_tasks,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
    ROUND(
        COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as completion_percentage
FROM frontend_migration_progress
GROUP BY phase
ORDER BY phase;

-- ドメインモデル別ファイル分散ビュー  
CREATE OR REPLACE VIEW frontend_domain_distribution AS
SELECT 
    domain_model,
    context_level,
    COUNT(*) as file_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM frontend_file_migrations
WHERE domain_model IS NOT NULL
GROUP BY domain_model, context_level
ORDER BY domain_model, context_level;

-- 依存関係問題サマリービュー
CREATE OR REPLACE VIEW frontend_dependency_health AS
SELECT 
    violation_type,
    severity,
    COUNT(*) as total_violations,
    COUNT(CASE WHEN resolved THEN 1 END) as resolved_violations,
    COUNT(CASE WHEN NOT resolved THEN 1 END) as unresolved_violations,
    ROUND(
        COUNT(CASE WHEN resolved THEN 1 END) * 100.0 / COUNT(*), 2
    ) as resolution_rate
FROM frontend_dependency_violations
GROUP BY violation_type, severity
ORDER BY violation_type, severity;

-- ============================================================================
-- 既存システムとの整合性確認用クエリ
-- ============================================================================

-- 既存テーブルとの関連確認（参考用）
/*
主要な既存テーブル構造（参考）:
- users: ユーザー情報
- routines: ルーティン情報  
- execution_records: 実行記録
- user_profiles: プロフィール情報
- challenges: チャレンジ情報
- user_challenges: ユーザーチャレンジ
- missions: ミッション情報
- user_missions: ユーザーミッション
- badges: バッジ情報
- user_badges: ユーザーバッジ
- categories: カテゴリ情報
- user_settings: ユーザー設定
- xp_transactions: XP取引履歴

これらのテーブル構造は再編成によって影響を受けない
*/

-- ============================================================================
-- 移行完了後のクリーンアップ用
-- ============================================================================

-- 移行完了後の一時テーブル削除用スクリプト（実行時期を慎重に判断）
/*
-- 移行が完全に完了し、安定稼働が確認された後に実行
DROP TABLE IF EXISTS frontend_migration_progress;
DROP TABLE IF EXISTS frontend_file_migrations;  
DROP TABLE IF EXISTS frontend_dependency_violations;
DROP VIEW IF EXISTS frontend_migration_summary;
DROP VIEW IF EXISTS frontend_domain_distribution;
DROP VIEW IF EXISTS frontend_dependency_health;
*/

-- ============================================================================
-- 移行支援用ストアドプロシージャ・関数
-- ============================================================================

-- 移行タスク開始記録
CREATE OR REPLACE FUNCTION start_migration_task(
    p_task_id VARCHAR(50),
    p_phase VARCHAR(50), 
    p_title VARCHAR(255)
) RETURNS UUID AS $$
DECLARE
    task_uuid UUID;
BEGIN
    INSERT INTO frontend_migration_progress (
        task_id, phase, title, status, started_at
    ) VALUES (
        p_task_id, p_phase, p_title, 'in_progress', NOW()
    ) RETURNING id INTO task_uuid;
    
    RETURN task_uuid;
END;
$$ LANGUAGE plpgsql;

-- 移行タスク完了記録
CREATE OR REPLACE FUNCTION complete_migration_task(
    p_task_id VARCHAR(50),
    p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE frontend_migration_progress 
    SET 
        status = CASE WHEN p_error_message IS NULL THEN 'completed' ELSE 'failed' END,
        completed_at = NOW(),
        error_message = p_error_message,
        updated_at = NOW()
    WHERE task_id = p_task_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ファイル移行記録
CREATE OR REPLACE FUNCTION record_file_migration(
    p_original_path VARCHAR(500),
    p_new_path VARCHAR(500),
    p_context_level VARCHAR(20),
    p_domain_model VARCHAR(50),
    p_file_type VARCHAR(50),
    p_migration_phase VARCHAR(50),
    p_git_commit_hash VARCHAR(40) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    migration_uuid UUID;
BEGIN
    INSERT INTO frontend_file_migrations (
        original_path, new_path, context_level, domain_model, 
        file_type, migration_phase, git_commit_hash
    ) VALUES (
        p_original_path, p_new_path, p_context_level, p_domain_model,
        p_file_type, p_migration_phase, p_git_commit_hash
    ) RETURNING id INTO migration_uuid;
    
    RETURN migration_uuid;
END;
$$ LANGUAGE plpgsql;

-- 依存関係違反記録
CREATE OR REPLACE FUNCTION record_dependency_violation(
    p_violation_type VARCHAR(50),
    p_file_path VARCHAR(500),
    p_violating_import VARCHAR(500),
    p_rule_violated VARCHAR(255),
    p_severity VARCHAR(20) DEFAULT 'error'
) RETURNS UUID AS $$
DECLARE
    violation_uuid UUID;
BEGIN
    INSERT INTO frontend_dependency_violations (
        violation_type, file_path, violating_import, rule_violated, severity
    ) VALUES (
        p_violation_type, p_file_path, p_violating_import, p_rule_violated, p_severity
    ) RETURNING id INTO violation_uuid;
    
    RETURN violation_uuid;
END;
$$ LANGUAGE plpgsql;

-- 移行統計取得
CREATE OR REPLACE FUNCTION get_migration_statistics()
RETURNS TABLE (
    phase VARCHAR(50),
    total_tasks BIGINT,
    completed_tasks BIGINT,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fms.phase,
        fms.total_tasks,
        fms.completed_tasks,
        fms.completion_percentage
    FROM frontend_migration_summary fms
    ORDER BY fms.phase;
END;
$$ LANGUAGE plpgsql;