#!/bin/bash

# Claude Code通知設定のテストスクリプト

echo "Claude Code通知設定をテストしています..."

# テスト用の通知データ
test_notification='{
  "session_id": "test-session-123",
  "message": "This is a test notification from Claude Code",
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "type": "test"
}'

echo "テスト通知データ:"
echo "$test_notification"
echo ""

# 基本通知ハンドラーのテスト
echo "基本通知ハンドラーをテスト中..."
if [ -x "./notification-handler.sh" ]; then
    echo "$test_notification" | ./notification-handler.sh
    echo "✅ 基本通知ハンドラーが実行されました"
else
    echo "❌ 基本通知ハンドラーが見つからないか実行権限がありません"
fi

echo ""

# 高度通知ハンドラーのテスト
echo "高度通知ハンドラーをテスト中..."
if [ -x "./advanced-notification-handler.sh" ]; then
    echo "$test_notification" | ./advanced-notification-handler.sh
    echo "✅ 高度通知ハンドラーが実行されました"
else
    echo "❌ 高度通知ハンドラーが見つからないか実行権限がありません"
fi

echo ""

# ログファイルの確認
echo "ログファイルを確認中..."
log_file="$HOME/.claude/notifications.log"
if [ -f "$log_file" ]; then
    echo "📄 通知ログが作成されました: $log_file"
    echo "最新のログエントリ:"
    tail -n 5 "$log_file"
else
    echo "❌ 通知ログファイルが見つかりません"
fi

echo ""
echo "テスト完了！"
echo ""
echo "システム通知が表示された場合、設定は正常に動作しています。"
echo "ログファイルの内容も確認してください: $log_file"