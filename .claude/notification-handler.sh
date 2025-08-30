#!/bin/bash

# Claude Code Notification Handler
# このスクリプトはClaude Codeから通知が送られた時に実行されます

# 通知データを受け取る
notification_data=$(cat)

# ログファイルのパス
log_file="$HOME/.claude/notifications.log"

# タイムスタンプを追加してログに記録
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Claude Code Notification:" >> "$log_file"
echo "$notification_data" >> "$log_file"
echo "---" >> "$log_file"

# macOSの場合、システム通知も表示
if [[ "$OSTYPE" == "darwin"* ]]; then
    #通知データからメッセージを抽出（JSONの簡単な解析）
    message=$(echo "$notification_data" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$message" ]; then
        osascript -e "display notification \"$message\" with title \"Claude Code\" sound name \"Glass\""
    else
        osascript -e "display notification \"New notification from Claude Code\" with title \"Claude Code\" sound name \"Glass\""
    fi
fi

# Slackやその他の通知システムに送信する場合は、ここに追加
# 例: curl -X POST -H 'Content-type: application/json' --data "$notification_data" YOUR_SLACK_WEBHOOK_URL