# 変更履歴 (CHANGELOG)

## [1.1.0] - 2024-08-31

### 追加 (Added)
- `docs/tsumiki/` ディレクトリ構造の新規作成
- kairosワークフロー（tsumiki）の統一ドキュメント出力機能

### 変更 (Changed)
- kairo-requirements: 出力先を `docs/spec/` から `docs/tsumiki/spec/` に変更
- kairo-design: 出力先を `docs/design/` から `docs/tsumiki/design/` に変更
- kairo-tasks: 出力先を `docs/tasks/` から `docs/tsumiki/tasks/` に変更

### 修正 (Fixed)
- kairo-design.md の前提条件にディレクトリ自動作成記述を追加
- 3つのkairosコマンド間での表記統一性を向上

### セキュリティ (Security)
- ディレクトリトラバーサル攻撃に対する既存保護を維持

## 技術詳細

### 影響を受けるファイル
- `.claude/commands/kairo-requirements.md` (2箇所修正)
- `.claude/commands/kairo-design.md` (3箇所修正)
- `.claude/commands/kairo-tasks.md` (7箇所修正)

### 互換性
- **後方互換性**: 完全に保持
- **既存機能**: 全て保持
- **コマンド引数**: 変更なし

### 実装方式
- TDD (Test-Driven Development) アプローチを採用
- 段階的実装とテストにより品質を確保
- リファクタリングによる追加的品質向上

## 移行ガイド

### 新規プロジェクト
新しく作成されるドキュメントは自動的に `docs/tsumiki/` 配下に出力されます。
特別な設定は不要です。

### 既存プロジェクト
既存の `docs/spec/`, `docs/design/`, `docs/tasks/` ディレクトリは影響を受けません。
新しい作業から自動的に新しいディレクトリ構造を使用します。

---

## [1.0.0] - 初期バージョン
- kairosワークフローシステムの初期実装
- kairo-requirements, kairo-design, kairo-tasks コマンドの提供