# tsumiki ドキュメントディレクトリ

## 概要
kairosワークフローシステム（通称tsumiki）によって生成されるドキュメントの格納場所

## ディレクトリ構造

```
docs/tsumiki/
├── spec/           # 要件定義書 (kairo-requirements出力)
├── design/         # 設計文書 (kairo-design出力) 
├── tasks/          # タスク定義 (kairo-tasks出力)
└── README.md       # このファイル
```

## 使用方法

### kairo-requirementsの出力先
- 変更前: `docs/spec/{要件名}-requirements.md`
- 変更後: `docs/tsumiki/spec/{要件名}-requirements.md`

### kairo-designの出力先  
- 変更前: `docs/design/{要件名}/`
- 変更後: `docs/tsumiki/design/{要件名}/`

### kairo-tasksの出力先
- 変更前: `docs/tasks/{要件名}-tasks.md`
- 変更後: `docs/tsumiki/tasks/{要件名}-tasks.md`

## ファイル命名規則

- 要件定義書: `{要件名}-requirements.md`
- 設計文書: `{要件名}/` (ディレクトリ)
- タスク定義: `{要件名}-tasks.md`

## 変更履歴

### v1.1.0 (2024-08-31)
- tsumikiスラッシュコマンドのドキュメント出力先を統一
- `docs/tsumiki`配下にすべてのkairosワークフロー出力を集約
- 既存コマンドとの完全な互換性を維持
- ディレクトリ自動作成機能を全コマンドに統一

## 注意事項

- 既存の`docs/spec/`, `docs/design/`, `docs/tasks/`ディレクトリとは独立
- 後方互換性のため既存ディレクトリは維持
- 新規作成されるドキュメントは`docs/tsumiki`配下に出力
- すべてのkairosコマンドが自動的にディレクトリを作成します

## トラブルシューティング

### ディレクトリが作成されない場合
1. ファイル権限を確認: `ls -ld docs/`
2. ディスク容量を確認: `df -h .`
3. 親ディレクトリの存在を確認: `ls -la docs/`

### 出力ファイルが見つからない場合
1. コマンド実行時にエラーが出力されていないか確認
2. `docs/tsumiki/` 配下の該当サブディレクトリを確認
3. ファイル命名規則に従っているか確認