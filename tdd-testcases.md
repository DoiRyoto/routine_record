# TASK-002: 読込み状況管理システム - テストケース

## テスト対象

読込み状況管理システムの4つの関数：
1. `record_doc_read_status()` - 読込み状況記録機能
2. `check_doc_read_status()` - 読込み状況確認機能  
3. `get_unread_docs()` - 未読ドキュメント取得機能
4. `reset_read_status()` - 状況リセット機能

## 単体テストケース

### TC-004: 読込み状況記録機能テスト

**テスト概要**: `record_doc_read_status()`関数の動作確認

#### TC-004-1: 正常系 - ドキュメント状況記録
```bash
# テスト用状況ファイル設定
STATUS_FILE="/tmp/test_read_status_$$"

# 状況記録実行
result=$(record_doc_read_status "docs/rules/frontend.md")
record_result=$?

# 検証
echo "記録結果: $record_result (期待値: 0)"
test $record_result -eq 0 && echo "✅ 状況記録成功" || echo "❌ 状況記録失敗"

# ファイル内容確認
if [ -f "$STATUS_FILE" ]; then
    echo "✅ 状況ファイル作成成功"
    grep -q "docs/rules/frontend.md" "$STATUS_FILE" && echo "✅ ファイルパス記録確認" || echo "❌ ファイルパス記録失敗"
else
    echo "❌ 状況ファイル作成失敗"
fi

# クリーンアップ
rm -f "$STATUS_FILE"
```
**期待結果**: ドキュメントの読込み状況が正しく記録される

#### TC-004-2: 異常系 - 無効なパラメータ
```bash
# 空のパラメータでテスト
result=$(record_doc_read_status "")
result_code=$?

echo "空パラメータ結果: $result_code (期待値: 2)"
test $result_code -eq 2 && echo "✅ パラメータエラー処理成功" || echo "❌ パラメータエラー処理失敗"

# パラメータなしでテスト
record_doc_read_status; result_code2=$?
echo "パラメータなし結果: $result_code2 (期待値: 2)"
test $result_code2 -eq 2 && echo "✅ パラメータなしエラー処理成功" || echo "❌ パラメータなしエラー処理失敗"
```
**期待結果**: 不正なパラメータで適切なエラーが返される

### TC-005: 読込み状況確認機能テスト

**テスト概要**: `check_doc_read_status()`関数の動作確認

#### TC-005-1: 正常系 - 読込み済みドキュメント確認
```bash
# テスト用状況ファイル準備
STATUS_FILE="/tmp/test_read_status_$$"
echo "docs/rules/frontend.md|$(date +%s)|abc123" > "$STATUS_FILE"

# 読込み状況確認
check_doc_read_status "docs/rules/frontend.md"
check_result=$?

echo "読込み済み確認結果: $check_result (期待値: 0)"
test $check_result -eq 0 && echo "✅ 読込み済み確認成功" || echo "❌ 読込み済み確認失敗"

# 未読ドキュメント確認
check_doc_read_status "docs/rules/nonexistent.md"
check_result2=$?

echo "未読確認結果: $check_result2 (期待値: 1)"
test $check_result2 -eq 1 && echo "✅ 未読確認成功" || echo "❌ 未読確認失敗"

# クリーンアップ
rm -f "$STATUS_FILE"
```
**期待結果**: 読込み状況を正確に判定できる

#### TC-005-2: 異常系 - 状況ファイル不存在
```bash
# 状況ファイルが存在しない状態でテスト
STATUS_FILE="/tmp/nonexistent_status_file"

check_doc_read_status "docs/rules/frontend.md"
result=$?

echo "ファイル不存在時の結果: $result (期待値: 1 または 2)"
if [ $result -eq 1 ] || [ $result -eq 2 ]; then
    echo "✅ ファイル不存在エラー処理成功"
else
    echo "❌ ファイル不存在エラー処理失敗"
fi
```
**期待結果**: ファイル不存在時に適切なエラーが返される

### TC-006: 未読ドキュメント取得機能テスト

**テスト概要**: `get_unread_docs()`関数の動作確認

#### TC-006-1: 正常系 - 未読ドキュメント一覧取得
```bash
# テスト環境準備（TASK-001の関数を利用）
RULES_DIR="docs/rules"

# 部分的な状況ファイル作成（一部のみ読込み済み）
STATUS_FILE="/tmp/test_read_status_$$"
echo "docs/rules/frontend.md|$(date +%s)|abc123" > "$STATUS_FILE"

# 未読ドキュメント取得
unread_docs=$(get_unread_docs)
get_result=$?

echo "未読ドキュメント取得結果: $get_result"
echo "未読ドキュメント一覧:"
echo "$unread_docs"

# 検証：未読ドキュメントがリストアップされているか
if [ $get_result -eq 0 ] && [ -n "$unread_docs" ]; then
    echo "✅ 未読ドキュメント一覧取得成功"
else
    echo "❌ 未読ドキュメント一覧取得失敗"
fi

# クリーンアップ
rm -f "$STATUS_FILE"
```
**期待結果**: 未読ドキュメントが正しく一覧化される

#### TC-006-2: 境界値 - 全ドキュメント読込み済み
```bash
# 全ドキュメント読込み済み状況作成
STATUS_FILE="/tmp/test_read_status_$$"
RULES_DIR="docs/rules"

# 全ドキュメントを読込み済みとして記録
for doc in $(get_all_rules_docs); do
    echo "$doc|$(date +%s)|abc123" >> "$STATUS_FILE"
done

# 未読ドキュメント取得
unread_docs=$(get_unread_docs)
get_result=$?

echo "全読込み済み時の結果: $get_result (期待値: 1)"
echo "未読ドキュメント: '$unread_docs'"

if [ $get_result -eq 1 ] && [ -z "$unread_docs" ]; then
    echo "✅ 全読込み済み時の処理成功"
else
    echo "❌ 全読込み済み時の処理失敗"
fi

# クリーンアップ
rm -f "$STATUS_FILE"
```
**期待結果**: 全読込み済み時に適切な戻り値が返される

### TC-007: 状況リセット機能テスト

**テスト概要**: `reset_read_status()`関数の動作確認

#### TC-007-1: 正常系 - 状況ファイル削除
```bash
# 状況ファイル作成
STATUS_FILE="/tmp/test_read_status_$$"
echo "test data" > "$STATUS_FILE"

# ファイル存在確認
test -f "$STATUS_FILE" && echo "✅ 準備：状況ファイル存在確認"

# リセット実行
reset_read_status
reset_result=$?

echo "リセット結果: $reset_result (期待値: 0)"
test $reset_result -eq 0 && echo "✅ リセット実行成功" || echo "❌ リセット実行失敗"

# ファイル削除確認
if [ ! -f "$STATUS_FILE" ]; then
    echo "✅ 状況ファイル削除確認"
else
    echo "❌ 状況ファイル削除失敗"
fi
```
**期待結果**: 状況ファイルが完全に削除される

## 統合テストケース

### TC-101: ワークフロー統合テスト

**テスト概要**: 全機能が連携して動作することを確認

#### TC-101-1: フルワークフローテスト
```bash
echo "=== 読込み状況管理システム統合テスト ==="

# 1. 初期状態（全て未読）
unread_initial=$(get_unread_docs)
echo "初期未読数: $(echo "$unread_initial" | wc -l)"

# 2. ドキュメント読込み記録
record_doc_read_status "docs/rules/frontend.md"
echo "フロントエンド文書を読込み済みとしてマーク"

# 3. 状況確認
check_doc_read_status "docs/rules/frontend.md"
check_result=$?
echo "フロントエンド文書確認: $check_result"

# 4. 未読ドキュメント再取得
unread_after=$(get_unread_docs)
echo "読込み後未読数: $(echo "$unread_after" | wc -l)"

# 5. リセットテスト
reset_read_status
echo "状況リセット実行"

# 6. リセット後確認
unread_reset=$(get_unread_docs)
echo "リセット後未読数: $(echo "$unread_reset" | wc -l)"

# 統合テスト結果評価
if [ $(echo "$unread_after" | wc -l) -lt $(echo "$unread_initial" | wc -l) ] && 
   [ $(echo "$unread_reset" | wc -l) -eq $(echo "$unread_initial" | wc -l) ]; then
    echo "✅ 統合テスト成功"
else
    echo "❌ 統合テスト失敗"
fi
```
**期待結果**: 全機能が期待通りに連携して動作する

## テスト実行順序

1. **単体テスト** (TC-004 ~ TC-007): 個別関数の検証
2. **統合テスト** (TC-101): 全体連携の検証
