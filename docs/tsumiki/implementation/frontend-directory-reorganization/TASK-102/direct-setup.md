# TASK-102: Layout系コンポーネント移行 - 直接実装

## 実装概要

`src/components/Layout/*` から `src/common/components/layout/` への Layout系コンポーネントの移行と、関連するContext の `src/common/context/` への移行を完了しました。

## 実装内容

### 1. Layout コンポーネント構造分析

**既存構造**: `src/components/Layout/`
```
src/components/Layout/
├── Header.tsx        # ヘッダーコンポーネント（ナビゲーション含む）
├── Layout.tsx        # メインレイアウトコンポーネント
└── Layout.test.tsx   # レイアウトテストファイル
```

**コンポーネント責任**:
- **Header.tsx**: ナビゲーション、ユーザーメニュー、モバイル対応
- **Layout.tsx**: 全体レイアウト構造、Header統合

### 2. Layout コンポーネント移行実行

**移行コマンド**:
```bash
cp src/components/Layout/* src/common/components/layout/
```

**移行結果**:
- ✅ 3ファイルが `src/common/components/layout/` に移行
- ✅ テストファイルも含めた完全移行
- ✅ 既存の機能・構造の完全保持

### 3. 関連Context移行実行

**移行の必要性**: Header.tsx が `@/context/AuthContext` を使用しているため

**移行コマンド**:
```bash
cp src/context/* src/common/context/
```

**移行されたContext**:
```
src/common/context/
├── AuthContext.tsx      # 認証状態管理
├── SnackbarContext.tsx  # 通知表示管理  
├── ThemeContext.tsx     # テーマ切り替え管理
```

### 4. Import パス更新

#### 4.1 Layout コンポーネント参照の更新

**更新対象ファイル**:
```
src/app/(authenticated)/layout.tsx  # メインレイアウト利用
src/components/StorybookWrapper.tsx # Storybook用ラッパー
```

**更新内容**:
```typescript
// Before
import Layout from '@/components/Layout/Layout';

// After
import Layout from '@/common/components/layout/Layout';
```

#### 4.2 Context 参照の一括更新

**実行コマンド**:
```bash
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/context/|@/common/context/|g'
```

**影響範囲**: プロジェクト全体のContext参照を新パスに更新

#### 4.3 Layout 内部の依存関係更新

**Header.tsx 内の更新**:
```typescript
// Before
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';

// After  
import { useAuth } from '@/common/context/AuthContext';
import { Button } from '@/common/components/ui/Button';
```

## 移行されたコンポーネント詳細

### Layout.tsx
- **責任**: アプリケーション全体のレイアウト構造
- **特徴**: Header統合、コンテナ設定
- **依存**: Header.tsx（相対import）

```typescript
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray dark:bg-dark-gray">
      <Header />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
```

### Header.tsx
- **責任**: ナビゲーション、ユーザーメニュー、認証UI
- **特徴**: レスポンシブ対応、モバイルメニュー
- **依存**: AuthContext、Button（UI）

**主要機能**:
- ✅ 認証ユーザー情報表示
- ✅ 9つのナビゲーションメニュー
- ✅ モバイル対応（ハンバーガーメニュー）
- ✅ サインアウト機能
- ✅ data-testid 属性による E2E テスト対応

**ナビゲーション項目**:
```typescript
const navigationItems = [
  { href: '/', label: 'ダッシュボード', icon: '🏠' },
  { href: '/routines', label: 'ルーティン', icon: '📋' },
  { href: '/badges', label: 'バッジ', icon: '🏅' },
  { href: '/missions', label: 'ミッション', icon: '🎯' },
  { href: '/challenges', label: 'チャレンジ', icon: '🏆' },
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/statistics', label: '統計', icon: '📊' },
  { href: '/profile', label: 'プロフィール', icon: '👤' },
  { href: '/settings', label: '設定', icon: '⚙️' },
];
```

### Layout.test.tsx
- **責任**: Layout コンポーネントのテスト
- **内容**: レンダリング、構造、アクセシビリティテスト

### Context ファイル詳細

#### AuthContext.tsx
- **責任**: 認証状態管理、ユーザー情報管理
- **機能**: ログイン、ログアウト、ユーザー状態

#### SnackbarContext.tsx  
- **責任**: アプリケーション全体の通知表示管理
- **機能**: 成功・エラー・警告メッセージ表示

#### ThemeContext.tsx
- **責任**: ダークモード・ライトモードの切り替え管理
- **機能**: テーマ状態管理、永続化

## アーキテクチャ準拠確認

### ✅ Common層への適切な配置

**Layout コンポーネント**: アプリケーション全体で使用される汎用レイアウト
- ✅ 特定のページに依存しない汎用性
- ✅ 全ページで共通利用される構造
- ✅ Common層の責任範囲に適合

**Context**: アプリケーション全体で使用される状態管理
- ✅ 特定のドメインに依存しない汎用状態  
- ✅ 複数ページ・コンポーネントで共有
- ✅ Common層の責任範囲に適合

### ✅ 依存関係の健全性確認

**Layout → 他層の依存**:
```typescript
// ✅ 適切な依存関係
Header.tsx:
  - 外部ライブラリ: Next.js (Link, usePathname)
  - Common/Context: @/common/context/AuthContext  
  - Common/UI: @/common/components/ui/Button
  - ❌ Model・App層への依存なし
```

## UI/UX 機能確認

### ✅ レスポンシブ対応

**Header.tsx の対応状況**:
- ✅ **デスクトップ**: 水平ナビゲーションメニュー
- ✅ **モバイル**: ハンバーガーメニュー（md:hidden）
- ✅ **タブレット**: 中間サイズでの適切な表示

### ✅ アクセシビリティ対応

**実装されている属性**:
```typescript
// ARIA対応
aria-label="メニューを開く"

// テスト対応
data-testid="header-logo-link"
data-testid="main-navigation"  
data-testid="nav-link-dashboard"
data-testid="signout-button"
data-testid="mobile-menu-toggle"
data-testid="mobile-menu"
data-testid="mobile-nav-link-*"
data-testid="mobile-signout-button"
```

### ⚠️ スタイリングルール準拠状況

**検出されたスタイリングルール違反**:
```typescript
// Header.tsx内の違反例
'bg-gray dark:bg-dark-gray'     // → 'bg-bg-primary dark:bg-bg-dark-primary'
'text-gray dark:text-gray'      // → 'text-text-primary dark:text-text-dark-primary'  
'border-gray'                   // → 'border-border-primary'
'hover:bg-gray'                 // → 'hover:bg-bg-hover'
```

**対応方針**: TASK-404（最終検証）でスタイリングルール統一修正

## 成果物

### 移行統計
- **Layout コンポーネント**: 3ファイル移行
- **Context ファイル**: 3ファイル移行  
- **Import 更新**: プロジェクト全体のcontext参照更新
- **テストファイル**: Layout.test.tsx も移行済み

### ディレクトリ構造変更
```bash
# Before
src/components/Layout/Layout.tsx
src/components/Layout/Header.tsx
src/context/AuthContext.tsx

# After
src/common/components/layout/Layout.tsx
src/common/components/layout/Header.tsx  
src/common/context/AuthContext.tsx
```

### アーキテクチャ効果
- ✅ **App層**: Layout への適切な依存関係確立
- ✅ **Common層**: Layout・Context の一元管理
- ✅ **依存方向**: App → Common の一方向依存維持

## 次のステップ

### TASK-103 準備状況
**フィルター・チャート系コンポーネント移行** の準備完了：
- ✅ Common層の layout サブディレクトリ活用確認
- ✅ 複雑なコンポーネント移行プロセス確立
- ✅ Context 移行プロセス確立

### 確認済み機能
- ✅ ナビゲーション機能の保持
- ✅ 認証状態表示の保持
- ✅ モバイルメニューの保持
- ✅ レスポンシブレイアウトの保持