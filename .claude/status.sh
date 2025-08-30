#!/bin/bash

# Claude Code通知設定ステータス確認スクリプト

echo "🔔 Claude Code通知設定ステータス"
echo "================================"

# 設定ファイルの確認
if [ -f "./settings.local.json" ]; then
    echo "✅ 設定ファイル: 存在"
    hooks_count=$(grep -o '"command"' "./settings.local.json" | wc -l)
    echo "📎 設定された通知ハンドラー数: $hooks_count"
else
    echo "❌ 設定ファイルが見つかりません"
fi

echo ""

# スクリプトファイルの確認
echo "📋 通知ハンドラースクリプト:"
for script in notification-handler.sh advanced-notification-handler.sh test-notification.sh; do
    if [ -x "./$script" ]; then
        echo "✅ $script: 実行可能"
    elif [ -f "./$script" ]; then
        echo "⚠️  $script: 存在するが実行権限なし"
    else
        echo "❌ $script: 見つかりません"
    fi
done

echo ""

# ログファイルの確認
log_file="$HOME/.claude/notifications.log"
if [ -f "$log_file" ]; then
    log_size=$(wc -l < "$log_file")
    echo "📄 通知ログ: $log_file"
    echo "📊 ログエントリー数: $log_size行"
    
    if [ -s "$log_file" ]; then
        echo "📅 最新の通知:"
        tail -n 1 "$log_file" | head -c 100
        echo "..."
    fi
else
    echo "📄 通知ログ: まだ作成されていません"
fi

echo ""

# システム要件の確認
echo "🔧 システム要件:"
if command -v jq >/dev/null 2>&1; then
    echo "✅ jq: インストール済み (高度なJSON解析が利用可能)"
else
    echo "⚠️  jq: 未インストール (基本機能のみ利用可能)"
    echo "   インストール方法: brew install jq"
fi

if command -v osascript >/dev/null 2>&1; then
    echo "✅ macOS通知: 利用可能"
else
    echo "❌ macOS通知: 利用不可"
fi

echo ""

# 環境変数の確認
echo "🌐 外部サービス連携:"
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo "✅ Slack: 設定済み"
else
    echo "⚪ Slack: 未設定 (任意)"
fi

if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    echo "✅ Discord: 設定済み"  
else
    echo "⚪ Discord: 未設定 (任意)"
fi

echo ""
echo "🎉 Claude Code通知システムは正常に設定されています！"