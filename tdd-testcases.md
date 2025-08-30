# TASK-004: 既存コマンド互換性の確保 - テストケース

## テスト対象

変更されたkairosコマンドファイル：
1. `.claude/commands/kairo-requirements.md`
2. `.claude/commands/kairo-design.md`
3. `.claude/commands/kairo-tasks.md`

## 単体テストケース

### TC-001: コマンドファイル構造の検証

**テスト概要**: 変更後もコマンドファイルの基本構造が維持されている

#### TC-001-1: ファイル名の確認
```bash
# kairo-requirementsファイル存在確認
test -f .claude/commands/kairo-requirements.md
echo "kairo-requirements.md: $?"

# kairo-designファイル存在確認  
test -f .claude/commands/kairo-design.md
echo "kairo-design.md: $?"

# kairo-tasksファイル存在確認
test -f .claude/commands/kairo-tasks.md  
echo "kairo-tasks.md: $?"
```
**期待結果**: 全て0（存在する）

#### TC-001-2: 基本セクション構造の確認
```bash
# kairo-requirements.mdの必須セクション確認
grep -q "## 目的" .claude/commands/kairo-requirements.md && echo "✅ 目的" || echo "❌ 目的"
grep -q "## 前提条件" .claude/commands/kairo-requirements.md && echo "✅ 前提条件" || echo "❌ 前提条件"
grep -q "## 実行内容" .claude/commands/kairo-requirements.md && echo "✅ 実行内容" || echo "❌ 実行内容"
grep -q "## 出力フォーマット例" .claude/commands/kairo-requirements.md && echo "✅ 出力フォーマット例" || echo "❌ 出力フォーマット例"

# kairo-design.mdの必須セクション確認
grep -q "## 目的" .claude/commands/kairo-design.md && echo "✅ 目的" || echo "❌ 目的"
grep -q "## 前提条件" .claude/commands/kairo-design.md && echo "✅ 前提条件" || echo "❌ 前提条件" 
grep -q "## 実行内容" .claude/commands/kairo-design.md && echo "✅ 実行内容" || echo "❌ 実行内容"

# kairo-tasks.mdの必須セクション確認
grep -q "## 目的" .claude/commands/kairo-tasks.md && echo "✅ 目的" || echo "❌ 目的"
grep -q "## 前提条件" .claude/commands/kairo-tasks.md && echo "✅ 前提条件" || echo "❌ 前提条件"
grep -q "## 実行内容" .claude/commands/kairo-tasks.md && echo "✅ 実行内容" || echo "❌ 実行内容"
```
**期待結果**: 全セクションで「✅」が表示される

### TC-002: 出力フォーマットの検証

#### TC-002-1: 要件定義書フォーマット確認
```bash
# EARS記法の保持確認
grep -q "### 通常要件" .claude/commands/kairo-requirements.md && echo "✅ 通常要件" || echo "❌ 通常要件"
grep -q "### 条件付き要件" .claude/commands/kairo-requirements.md && echo "✅ 条件付き要件" || echo "❌ 条件付き要件"
grep -q "### 状態要件" .claude/commands/kairo-requirements.md && echo "✅ 状態要件" || echo "❌ 状態要件"
grep -q "### オプション要件" .claude/commands/kairo-requirements.md && echo "✅ オプション要件" || echo "❌ オプション要件"
grep -q "### 制約要件" .claude/commands/kairo-requirements.md && echo "✅ 制約要件" || echo "❌ 制約要件"

# ユーザストーリー形式の確認
grep -q "## ユーザストーリー" .claude/commands/kairo-requirements.md && echo "✅ ユーザストーリー" || echo "❌ ユーザストーリー"
```
**期待結果**: EARS記法の全セクションが保持されている

#### TC-002-2: 設計文書フォーマット確認  
```bash
# 設計文書の必須ファイル確認
grep -q "architecture.md" .claude/commands/kairo-design.md && echo "✅ architecture.md" || echo "❌ architecture.md"
grep -q "dataflow.md" .claude/commands/kairo-design.md && echo "✅ dataflow.md" || echo "❌ dataflow.md"
grep -q "interfaces.ts" .claude/commands/kairo-design.md && echo "✅ interfaces.ts" || echo "❌ interfaces.ts"
grep -q "database-schema.sql" .claude/commands/kairo-design.md && echo "✅ database-schema.sql" || echo "❌ database-schema.sql"
grep -q "api-endpoints.md" .claude/commands/kairo-design.md && echo "✅ api-endpoints.md" || echo "❌ api-endpoints.md"

# Mermaid図の確認
grep -q "mermaid" .claude/commands/kairo-design.md && echo "✅ Mermaid図" || echo "❌ Mermaid図"
```
**期待結果**: 設計文書の全構成要素が保持されている

#### TC-002-3: タスク定義書フォーマット確認
```bash
# タスク形式の確認
grep -q "タスクID" .claude/commands/kairo-tasks.md && echo "✅ タスクID" || echo "❌ タスクID"
grep -q "タスクタイプ" .claude/commands/kairo-tasks.md && echo "✅ タスクタイプ" || echo "❌ タスクタイプ"
grep -q "TDD" .claude/commands/kairo-tasks.md && echo "✅ TDD" || echo "❌ TDD"
grep -q "DIRECT" .claude/commands/kairo-tasks.md && echo "✅ DIRECT" || echo "❌ DIRECT"

# 依存関係記述の確認
grep -q "依存タスク" .claude/commands/kairo-tasks.md && echo "✅ 依存タスク" || echo "❌ 依存タスク"
```
**期待結果**: タスク定義の全要素が保持されている

### TC-003: パラメータ処理の検証

#### TC-003-1: プレースホルダー確認
```bash
# {要件名}プレースホルダーの確認
grep -c "{要件名}" .claude/commands/kairo-requirements.md
grep -c "{要件名}" .claude/commands/kairo-design.md  
grep -c "{要件名}" .claude/commands/kairo-tasks.md
```
**期待結果**: 各ファイルで適切な回数のプレースホルダーが存在する

#### TC-003-2: パス展開の確認
```bash
# 新パス設定でのプレースホルダー確認
grep -q "docs/tsumiki/spec/{要件名}" .claude/commands/kairo-requirements.md && echo "✅ requirements パス" || echo "❌ requirements パス"
grep -q "docs/tsumiki/design/{要件名}" .claude/commands/kairo-design.md && echo "✅ design パス" || echo "❌ design パス"
grep -q "docs/tsumiki/tasks/{要件名}" .claude/commands/kairo-tasks.md && echo "✅ tasks パス" || echo "❌ tasks パス"
```
**期待結果**: 全パスで適切にプレースホルダーが設定されている

## 統合テストケース

### TC-101: コマンド間連携の確認

**テスト概要**: 3つのkairosコマンドの連携が正常に機能する

#### TC-101-1: 参照関係の確認
```bash
# kairo-design → kairo-requirements参照
grep -q "docs/tsumiki/spec/" .claude/commands/kairo-design.md && echo "✅ design->requirements" || echo "❌ design->requirements"

# kairo-tasks → kairo-design参照
grep -q "docs/tsumiki/design/" .claude/commands/kairo-tasks.md && echo "✅ tasks->design" || echo "❌ tasks->design"
```
**期待結果**: コマンド間の参照が正しく設定されている

### TC-102: 出力先整合性の確認

**テスト概要**: 出力先と参照先が一致している

```bash
# 出力先と参照先の整合性チェック
echo "=== 出力先と参照先の整合性 ==="
echo "requirements出力先:" 
grep "docs/tsumiki/spec.*保存" .claude/commands/kairo-requirements.md
echo "design参照先:"
grep "docs/tsumiki/spec.*存在" .claude/commands/kairo-design.md

echo "design出力先:"
grep "docs/tsumiki/design.*作成" .claude/commands/kairo-design.md  
echo "tasks参照先:"
grep "docs/tsumiki/design.*存在" .claude/commands/kairo-tasks.md
```
**期待結果**: 各段階の出力先と次段階の参照先が一致する

## 回帰テストケース

### TC-201: 変更前後の差分確認

**テスト概要**: パス以外に意図しない変更がないことを確認

#### TC-201-1: セクション数の確認
```bash
# 各ファイルのセクション数確認（## で始まる行）
echo "kairo-requirements.md セクション数:"
grep -c "^## " .claude/commands/kairo-requirements.md
echo "kairo-design.md セクション数:"  
grep -c "^## " .claude/commands/kairo-design.md
echo "kairo-tasks.md セクション数:"
grep -c "^## " .claude/commands/kairo-tasks.md
```
**期待結果**: 各ファイルのセクション数が変更前と同じ

#### TC-201-2: 特殊記法の保持確認
```bash
# マークダウン記法の確認
grep -c "```" .claude/commands/kairo-requirements.md && echo "✅ コードブロック" || echo "❌ コードブロック"
grep -c "\`\`\`mermaid" .claude/commands/kairo-design.md && echo "✅ Mermaid" || echo "❌ Mermaid"  
grep -c "- \[ \]" .claude/commands/kairo-tasks.md && echo "✅ チェックボックス" || echo "❌ チェックボックス"
```
**期待結果**: 特殊記法が保持されている

## エラーテストケース

### TC-301: 破損検出テスト

**テスト概要**: ファイル破損や記法エラーの検出

#### TC-301-1: マークダウン記法の検証
```bash
# 対応していない記法や破損の確認
grep -n "^\s*- \[ \] \*\*" .claude/commands/kairo-tasks.md | head -3 && echo "✅ チェックボックス形式正常" || echo "❌ チェックボックス形式異常"

# 不正なヘッダーレベルの確認
grep -n "^##### " .claude/commands/ -r && echo "❌ 不正なヘッダー" || echo "✅ ヘッダー形式正常"
```
**期待結果**: 記法エラーが検出されない

## パフォーマンステストケース

### TC-401: ファイルサイズの確認

**テスト概要**: ファイルサイズが異常に増加していない

```bash
# ファイルサイズの確認
ls -la .claude/commands/kairo-*.md
```
**期待結果**: ファイルサイズが大幅に変更されていない

## 受け入れテストケース

### TC-501: エンドツーエンド互換性テスト

**テスト概要**: 変更されたコマンドが期待通りに機能する

**前提条件**: 
- `docs/tsumiki/`ディレクトリ構造が存在する
- テスト用の要件名「test-compatibility」を使用

**テストシナリオ**:
1. 各コマンドファイルの形式が正しい
2. プレースホルダーが適切に定義されている  
3. 相互参照が正しく設定されている
4. 出力フォーマット例が完全である

**成功条件**: 
- 全テストケースが合格
- エラーや警告が発生しない
- 生成されるドキュメント形式が期待通り

## テスト実行順序

1. **単体テスト** (TC-001 ~ TC-003): 個別ファイルの検証
2. **統合テスト** (TC-101 ~ TC-102): コマンド間連携の検証  
3. **回帰テスト** (TC-201): 意図しない変更の検出
4. **エラーテスト** (TC-301): 破損・異常の検出
5. **パフォーマンステスト** (TC-401): サイズ・性能の確認
6. **受け入れテスト** (TC-501): 全体動作の確認