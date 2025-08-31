# フロントエンドディレクトリ構造

## 概要

本プロジェクトは **App-Common-Model 3層アーキテクチャ** に基づいてフロントエンドコードを構成しています。
各層は明確な責任分離と依存関係ルールに従って設計されており、保守性とスケーラビリティを向上させます。

## 3層アーキテクチャ構成

```
src/
├── app/           # App層 (高コンテキスト)
├── common/        # Common層 (低コンテキスト)  
├── model/         # Model層 (中コンテキスト)
└── server/        # Server層 (サーバーサイド)
```

### App層 (`src/app/`)
**責任範囲**: ページ固有のロジック・コンポーネント
**コンテキスト**: 高コンテキスト（特定のページ・機能に依存）

```
src/app/
├── (authenticated)/     # 認証済みユーザー向けページ
│   ├── dashboard/      # ダッシュボード機能
│   │   ├── page.tsx           # Next.js Page (SSR)
│   │   ├── DashboardPage.tsx  # UIコンポーネント
│   │   ├── _components/       # ページ固有コンポーネント
│   │   └── _hooks/           # ページ固有カスタムフック
│   ├── routines/       # ルーティン管理
│   ├── challenges/     # チャレンジ機能
│   ├── missions/       # ミッション機能
│   ├── badges/         # バッジ機能
│   ├── calendar/       # カレンダー表示
│   ├── statistics/     # 統計・分析
│   └── settings/       # アプリ設定
├── (public)/           # 未認証ユーザー向けページ
│   └── auth/          # 認証関連ページ
└── api/               # API Routes (Next.js)
```

### Common層 (`src/common/`)
**責任範囲**: 汎用的なコンポーネント・ユーティリティ
**コンテキスト**: 低コンテキスト（プロジェクト全体で再利用可能）

```
src/common/
├── components/         # 汎用UIコンポーネント
│   ├── ui/            # shadcn/ui系コンポーネント
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Dialog/
│   │   └── ...
│   ├── layout/        # レイアウト関連
│   │   ├── Layout.tsx
│   │   └── Header.tsx
│   ├── filters/       # フィルター系コンポーネント
│   ├── charts/        # チャート・グラフ系
│   └── mobile/        # モバイル対応コンポーネント
├── hooks/             # 汎用カスタムフック
├── lib/               # ユーティリティ・API クライアント
├── types/             # 共通型定義
└── context/           # React Context (テーマ、認証等)
```

### Model層 (`src/model/`)
**責任範囲**: ドメイン固有のコンポーネント・ロジック
**コンテキスト**: 中コンテキスト（特定のドメインに特化、複数ページで利用）

```
src/model/
├── user/              # ユーザー関連
│   ├── components/
│   │   ├── avatar/    # プロフィールアバター
│   │   ├── profile/   # プロフィール設定
│   │   └── settings/  # ユーザー設定
│   ├── hooks/         # ユーザー関連フック
│   └── lib/          # ユーザー関連ユーティリティ
├── routine/           # ルーティン関連
│   ├── components/
│   │   ├── form/      # ルーティンフォーム
│   │   ├── list/      # ルーティン一覧
│   │   ├── item/      # ルーティンアイテム
│   │   └── execution/ # 実行記録
│   ├── hooks/         # ルーティン関連フック
│   └── lib/          # ルーティンロジック
├── challenge/         # チャレンジ関連
├── mission/          # ミッション関連
├── badge/            # バッジ関連
├── gamification/     # ゲーミフィケーション要素
└── category/         # カテゴリ関連
```

## 依存関係ルール

### 許可されている依存関係
```
App層 → Model層 → Common層
```

### 禁止されている依存関係
```
❌ Common層 → Model層・App層
❌ Model層 → App層
❌ App層間での相互参照
❌ Model層間での相互参照
```

## Import パターン

### 正しいImport順序
```typescript
// Group 1: 外部ライブラリ
import React from 'react';
import { z } from 'zod';

// Group 2: Common層
import { Button } from '@/common/components/ui/Button';
import { useTheme } from '@/common/hooks/useTheme';

// Group 3: Model層
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';
import { useCompleteRoutine } from '@/model/routine/hooks/useCompleteRoutine';

// Group 4: App層（同一app内のみ）
import { DashboardStats } from '../_components/DashboardStats';

// Group 5: 相対パス
import './styles.css';
```

### TypeScript Path Mapping
```json
{
  "paths": {
    "@/common/*": ["./src/common/*"],
    "@/model/*": ["./src/model/*"],
    "@/app/*": ["./src/app/*"],
    "@/server/*": ["./src/server/*"]
  }
}
```

## ファイル配置の判断基準

### Common層に配置すべきもの
- shadcn/ui系の基本UIコンポーネント
- レイアウト・ナビゲーション系コンポーネント
- 汎用的なユーティリティ関数
- プロジェクト全体で使用される型定義
- テーマ・認証等のグローバルContext

### Model層に配置すべきもの
- 特定のドメインに特化したコンポーネント
- ドメイン固有のビジネスロジック
- ドメイン内でのみ使用されるカスタムフック
- ドメイン固有の型定義・計算ロジック

### App層に配置すべきもの
- Next.jsのPage コンポーネント
- ページ固有のUI コンポーネント
- ページレベルでのみ使用されるフック
- API Routes (Next.js)

## 移行の効果

### 開発効率向上
- 🎯 **関心の分離**: ドメイン別の開発が可能
- 🔍 **影響範囲の明確化**: 変更時の影響範囲が把握しやすい
- 📝 **新規メンバーのオンボーディング**: 明確な構造により理解しやすい

### 保守性向上  
- 🧩 **高凝集・低結合**: ドメイン内で関連機能が集約
- 🔒 **依存関係の制御**: アーキテクチャルールにより循環参照を防止
- 🛠️ **テスタビリティ**: モデル単位でのテストが容易

### パフォーマンス向上
- 🌳 **Tree Shaking最適化**: 未使用コードの除去効率化
- 📦 **Code Splitting**: ドメイン別の分割ロード
- ⚡ **Hot Reload**: 変更時の再ビルド範囲最小化