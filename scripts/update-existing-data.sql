-- 既存のroutinesテーブルのデータを新しい構造に対応させる

-- 1. goal_typeがNULLの既存レコードをschedule_basedに設定
UPDATE routines 
SET goal_type = 'schedule_based' 
WHERE goal_type IS NULL;

-- 2. target_periodをNULLに設定（schedule_basedの場合は使用しないため）
UPDATE routines 
SET target_period = NULL 
WHERE goal_type = 'schedule_based';

-- 3. recurrence_typeがNULLの場合はdailyに設定
UPDATE routines 
SET recurrence_type = 'daily' 
WHERE recurrence_type IS NULL;

-- 4. target_countがNULLで古いtarget_frequencyが存在する場合のフォールバック
UPDATE routines 
SET target_count = 1 
WHERE target_count IS NULL AND goal_type = 'frequency_based';

-- データ確認用クエリ
SELECT id, name, goal_type, target_count, target_period, recurrence_type 
FROM routines 
LIMIT 10;