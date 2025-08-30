# Claude Code通知設定

このプロジェクトにClaude Codeの通知hooks機能が設定されています。

## 設定内容

### 通知ハンドラー

2つの通知ハンドラーが設定されています：

1. **基本通知ハンドラー** (`notification-handler.sh`)
   - シンプルなログ記録とmacOSシステム通知
   - 全ての通知をログファイルに記録

2. **高度通知ハンドラー** (`advanced-notification-handler.sh`)
   - JSON解析機能（jq使用時）
   - メッセージタイプ別の処理
   - 複数のプラットフォーム対応
   - 外部サービス連携（Slack、Discord）

### 通知タイミング

Claude Codeは以下の場合に通知を送信します：

- ツール使用許可が必要な時
- プロンプト入力が60秒以上アイドル状態の時

### ログファイル

通知はこちらに記録されます：
- 基本ログ: `~/.claude/notifications.log`
- エラーログ: `~/.claude/notification-errors.log`

## カスタマイズ

### 外部サービス連携

環境変数を設定することで外部サービスに通知を送信できます：

```bash
# Slack通知
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Discord通知
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK"
```

### 通知音のカスタマイズ

`advanced-notification-handler.sh`内で、メッセージタイプ別の通知音を設定できます：

- 許可要求: "Basso"
- アイドル状態: "Purr" 
- エラー: "Sosumi"
- その他: "Glass"

### jqインストール（推奨）

高度な通知ハンドラーでJSON解析を行うには、jqのインストールを推奨します：

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## トラブルシューティング

### スクリプトの実行権限

スクリプトが実行されない場合、実行権限を確認してください：

```bash
chmod +x /Users/doi-ryoto/Desktop/Programming/routine_record/.claude/notification-handler.sh
chmod +x /Users/doi-ryoto/Desktop/Programming/routine_record/.claude/advanced-notification-handler.sh
```

### 通知が表示されない場合

1. macOSのシステム設定で通知が許可されているか確認
2. ログファイルでスクリプトが実行されているか確認
3. エラーログでエラーメッセージを確認

### ログファイルのローテーション

ログファイルが10MBを超えると自動的にローテーションされます。
古いログは`.old`拡張子付きでバックアップされます。

## 設定の無効化

通知を無効化する場合は、`.claude/settings.local.json`から`hooks`セクションを削除してください。