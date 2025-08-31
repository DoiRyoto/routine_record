# TASK-001: 基本ディレクトリ構造作成 - 直接実装

## 実装概要

App-Common-Model 3層アーキテクチャに基づく基本ディレクトリ構造を作成しました。

## 実装内容

### 1. Common層（低コンテキスト依存度）

```bash
src/common/
├── components/
│   ├── ui/           # shadcn/ui系基本コンポーネント
│   ├── layout/       # Header, Navigation, Layout
│   ├── filters/      # 汎用フィルタリング
│   ├── charts/       # 汎用チャート・可視化
│   └── mobile/       # モバイル対応共通
├── hooks/           # 汎用カスタムフック
├── lib/             # 汎用ライブラリ・ユーティリティ
├── types/           # 汎用型定義
└── context/         # 汎用React Context
```

### 2. Model層（中コンテキスト依存度）

各ドメインモデルに対して統一された構造を作成：

```bash
src/model/
├── user/            # ユーザードメイン
│   ├── components/  # ユーザー関連コンポーネント
│   ├── hooks/      # ユーザー関連カスタムフック
│   └── lib/        # ユーザー固有ロジック
├── routine/         # ルーティンドメイン
├── challenge/       # チャレンジドメイン
├── mission/         # ミッションドメイン
├── badge/           # バッジドメイン
├── gamification/    # ゲーミフィケーションドメイン
└── category/        # カテゴリドメイン
```

### 3. 既存Server構造の維持

既存の `src/server/` 構造は変更なしで維持：

```bash
src/server/
├── application/     # アプリケーション層
├── domain/         # ドメイン層
└── lib/            # ライブラリ・ユーティリティ
```

## 実行コマンド

```bash
# Common層構造作成
mkdir -p src/common/{components,hooks,lib,types,context}
mkdir -p src/common/components/{ui,layout,filters,charts,mobile}

# Model層構造作成
mkdir -p src/model/{user,routine,challenge,mission,badge,gamification,category}

# 各ドメインモデル内構造作成
for domain in user routine challenge mission badge gamification category; do
  mkdir -p "src/model/$domain/components" "src/model/$domain/hooks" "src/model/$domain/lib"
done
```

## 成果物

### 作成されたディレクトリ

- **Common層**: 5個の主要ディレクトリ + 5個のcomponentsサブディレクトリ
- **Model層**: 7個のドメインディレクトリ × 3個の内部ディレクトリ = 21個
- **合計**: 31個のディレクトリを作成

### 検証結果

- ✅ App-Common-Model 3層構造が正しく作成されている
- ✅ 全7ドメインモデルディレクトリが作成されている
- ✅ 既存のserver/構造が維持されている
- ✅ 各ドメインモデルに統一された内部構造が適用されている

## 次のステップ

TASK-002: TypeScriptパス設定・ESLintルール追加
- tsconfig.jsonのパスマッピング設定
- ESLintアーキテクチャルール設定
- import順序・グループ化ルール設定