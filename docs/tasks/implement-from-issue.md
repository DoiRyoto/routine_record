# GitHub Issue実装タスク

## 概要
GitHub IssueのURLまたは番号を受け取り、Issue内容に基づいて機能を実装するタスク

## 実行手順

### 1. Issue情報の取得
```bash
# Issue番号の場合
gh issue view [issue-number]

# Issue URLの場合
gh issue view [issue-url]
```
- Issueタイトル、概要、受け入れ基準、方針を確認
- As-is/To-beから実装すべき内容を理解
- 影響範囲を把握

### 2. コードベース確認
- 既存実装の確認
  - 関連するコンポーネント・ページの調査
  - API Routesの実装状況確認
  - DBスキーマの確認
- 実装に必要なファイル・モジュールの特定
- 既存の実装パターンの把握

### 3. 実装計画の作成
- TodoWriteツールで実装タスクを構造化
- Issue の受け入れ基準を元にタスク分解
- 実装順序の決定（依存関係を考慮）

### 4. 実装実行
#### 4.1 基本原則
- `docs/rules/frontend.md` の全ルールに従う
- 型安全性を最優先（スキーマベースの型定義）
- アーキテクチャ分離の徹底

#### 4.2 実装パターン
##### UIコンポーネント
- 必要に応じて `src/components/ui/` 配下に新規作成
- Storybookストーリーの作成
- variants.tsでスタイルバリエーションを管理

##### ページコンポーネント
- Page Component (`page.tsx`) でSSRとデータフェッチ
- UI Component (`ComponentPage.tsx`) でレンダリングロジック
- **絶対に `lib/db/queries` を直接 import 禁止**
- 必ず API Routes 経由でデータ取得

##### API Routes
- `/api/[resource]/route.ts` でエンドポイント実装
- 認証チェックの実装
- バリデーション実装
- `lib/db/queries` を使用したDB操作

##### データベース操作
- `lib/db/queries/[resource].ts` でクエリ実装
- 型安全性の確保
- エラーハンドリングの統一

#### 4.3 E2Eテスト対応
- 全テスト対象要素に `data-testid` 属性を追加
- ケバブケースで命名
- 詳細は `docs/rules/e2e-testing.md` 参照

#### 4.4 TypeScript厳格ルール
- **@ts-ignore は絶対に使用禁止**
- **@ts-expect-error も原則禁止**
- 型エラーは根本的な型定義修正で解決

### 5. 品質チェック
```bash
# TypeScript型チェック
npm run type-check

# ESLint実行（警告含む全て解消）
npm run lint
```

### 6. 実装完了確認
- [ ] Issue の受け入れ基準を全て満たしている
- [ ] 型エラーが0件
- [ ] Lintエラー・警告が0件
- [ ] data-testid属性が適切に追加されている
- [ ] Page ComponentでDBクエリ直接呼び出しがない
- [ ] スキーマベースの型定義を使用している
- [ ] API Routes経由でデータアクセスしている

### 7. コミット
```bash
# 変更をステージング
git add .

# コミット（Issueの受け入れ基準を元にメッセージ作成）
git commit -m "feat: [実装内容の簡潔な説明]

- 受け入れ基準1の実装
- 受け入れ基準2の実装
...

Closes #[issue-number]"
```

## 成功条件
- Issue の受け入れ基準を全て満たしている
- 型チェック・Lintがパスしている
- 実装ルールに準拠している
- コミットが完了している

## 参照ドキュメント
- `docs/rules/frontend.md` - フロントエンド実装ルール
- `docs/rules/e2e-testing.md` - E2Eテスト実装ルール
- `docs/rules/msw-mock-system.md` - MSWモックシステムルール
- `docs/rules/rule-updating.md` - ルール更新手順
