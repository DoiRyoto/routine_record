#!/bin/bash

# Advanced Claude Code Notification Handler
# より高度な通知処理とフィルタリング機能を提供

# 設定
LOG_FILE="$HOME/.claude/notifications.log"
ERROR_LOG="$HOME/.claude/notification-errors.log"
MAX_LOG_SIZE=10485760  # 10MB

# ログローテーション機能
rotate_log_if_needed() {
    local log_file="$1"
    if [[ -f "$log_file" ]] && [[ $(stat -c%s "$log_file" 2>/dev/null || stat -f%z "$log_file") -gt $MAX_LOG_SIZE ]]; then
        mv "$log_file" "${log_file}.old"
        touch "$log_file"
    fi
}

# 通知データを受け取る
notification_data=$(cat)

# ログローテーション
rotate_log_if_needed "$LOG_FILE"

# JSON解析用のjq使用可能チェック
has_jq=$(command -v jq >/dev/null 2>&1 && echo "yes" || echo "no")

# 通知データの解析
if [[ "$has_jq" == "yes" ]]; then
    # jqを使用した高度な解析
    session_id=$(echo "$notification_data" | jq -r '.session_id // "unknown"')
    message=$(echo "$notification_data" | jq -r '.message // "No message"')
    timestamp=$(echo "$notification_data" | jq -r '.timestamp // ""')
    
    # 構造化ログ
    {
        echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"session_id\":\"$session_id\",\"type\":\"notification\",\"data\":$notification_data}"
    } >> "$LOG_FILE"
else
    # 基本的な解析（jqなし）
    message=$(echo "$notification_data" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    session_id=$(echo "$notification_data" | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)
    
    # 基本ログ
    {
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Session: $session_id"
        echo "Message: $message"
        echo "Raw Data: $notification_data"
        echo "---"
    } >> "$LOG_FILE"
fi

# メッセージタイプ別処理
case "$message" in
    *"permission"*|*"Permission"*)
        notification_title="Claude Code - Permission Required"
        notification_sound="Basso"
        ;;
    *"idle"*|*"Idle"*)
        notification_title="Claude Code - Session Idle"
        notification_sound="Purr"
        ;;
    *"error"*|*"Error"*)
        notification_title="Claude Code - Error"
        notification_sound="Sosumi"
        ;;
    *)
        notification_title="Claude Code"
        notification_sound="Glass"
        ;;
esac

# macOSシステム通知
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -n "$message" ]; then
        osascript -e "display notification \"$message\" with title \"$notification_title\" sound name \"$notification_sound\"" 2>>"$ERROR_LOG"
    else
        osascript -e "display notification \"New notification from Claude Code\" with title \"$notification_title\" sound name \"$notification_sound\"" 2>>"$ERROR_LOG"
    fi
fi

# Growl通知（インストールされている場合）
if command -v growlnotify >/dev/null 2>&1; then
    echo "$message" | growlnotify -t "$notification_title" 2>>"$ERROR_LOG"
fi

# Desktop notification for Linux
if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v notify-send >/dev/null 2>&1; then
    notify-send "$notification_title" "$message" 2>>"$ERROR_LOG"
fi

# Slackへの通知（SLACK_WEBHOOK_URLが設定されている場合）
if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
    curl -X POST -H 'Content-type: application/json' \
         --data "{\"text\":\"$notification_title: $message\"}" \
         "$SLACK_WEBHOOK_URL" 2>>"$ERROR_LOG"
fi

# Discordへの通知（DISCORD_WEBHOOK_URLが設定されている場合）
if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then
    curl -X POST -H 'Content-type: application/json' \
         --data "{\"content\":\"$notification_title: $message\"}" \
         "$DISCORD_WEBHOOK_URL" 2>>"$ERROR_LOG"
fi

exit 0