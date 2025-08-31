# TASK-301: カスタムフック移行・分散 - 要件定義

## 概要
`src/hooks/` のカスタムフックを用途に応じて適切な層に配置し、App-Common-Model アーキテクチャに準拠した構造に再編成する。

## 詳細要件

### 1. カスタムフック移行要件

#### 1.1 ドメイン固有フック → Model層への移行
- **useCompleteRoutine**: `src/hooks/useCompleteRoutine.ts` → `src/model/routine/hooks/useCompleteRoutine.ts`
  - ルーティン完了処理の専用フック
  - routineドメインに特化した機能
  
- **useExecutionRecords**: `src/hooks/useExecutionRecords.ts` → `src/model/routine/hooks/useExecutionRecords.ts`
  - 実行記録のCRUD操作フック
  - routineドメインの実行記録管理に特化

#### 1.2 アプリ固有フック → App層への移行
- **useDashboardData**: `src/hooks/useDashboardData.ts` → `src/app/(authenticated)/dashboard/_hooks/useDashboardData.ts`
  - ダッシュボード専用のデータ統合フック
  - 複数ドメインのデータを統合する特殊性

#### 1.3 汎用フック → Common層への移行
- **useTheme**: `src/hooks/useTheme.ts` → `src/common/hooks/useTheme.ts`
  - アプリケーション全体で使用される汎用テーマ管理
  - ドメイン非依存の UI 状態管理

#### 1.4 テストファイルの同期移行
- 各フックのテストファイルも同構造で移行
- import パスの更新とモック設定の整合性確保

### 2. 機能要件

#### 2.1 フック機能の維持
- **useCompleteRoutine**: ルーティン完了処理、XP計算、通知機能
- **useExecutionRecords**: 実行記録の取得、作成、更新、削除
- **useDashboardData**: ダッシュボードデータの統合取得
- **useTheme**: テーマ切り替え、システム設定同期

#### 2.2 依存関係の整理
- 各フックの外部依存関係確認
- API クライアント、型定義、ユーティリティとの関係整理
- 循環依存の回避確認

### 3. アーキテクチャ要件

#### 3.1 層間の依存関係ルール
- **Common層フック**: どの層からも import 可能
- **Model層フック**: 同一ドメインとApp層からのみ import 可能
- **App層フック**: 同一アプリケーション内からのみ import 可能

#### 3.2 import グループ化
```typescript
// Group 1: 外部ライブラリ
import React, { useState, useEffect } from 'react'

// Group 2: Common層
import { useTheme } from '@/common/hooks/useTheme'

// Group 3: Model層
import { useCompleteRoutine } from '@/model/routine/hooks/useCompleteRoutine'

// Group 4: App層（同一app内のみ）
import { useDashboardData } from './_hooks/useDashboardData'
```

### 4. 技術要件

#### 4.1 型安全性
- `@/lib/db/schema` からの型定義使用
- API レスポンス型との整合性確保
- `@ts-ignore` 系コメント禁止

#### 4.2 パフォーマンス
- 不要な再レンダリングの回避
- 適切なメモ化戦略の実装
- 依存配列の最適化

#### 4.3 テスタビリティ
- Mock 可能な設計の維持
- テスト用のオプション引数追加
- 副作用の分離と制御

### 5. テスト要件

#### 5.1 単体テスト
- 各フックの基本機能テスト
- エラーハンドリングテスト
- パフォーマンステスト
- Mock との連携テスト

#### 5.2 統合テスト
- フック間の依存関係テスト
- コンポーネントとの統合テスト
- API との連携テスト

#### 5.3 E2Eテスト影響確認
- フック移行後のページ動作確認
- ユーザーフロー継続性の検証

### 6. 移行手順

#### 6.1 フェーズ1: 汎用フック移行
1. `useTheme` → `src/common/hooks/`
2. テストファイル移行とimport更新
3. 動作確認

#### 6.2 フェーズ2: ドメインフック移行
1. `useCompleteRoutine` → `src/model/routine/hooks/`
2. `useExecutionRecords` → `src/model/routine/hooks/`
3. テストファイル移行とimport更新
4. 動作確認

#### 6.3 フェーズ3: アプリフック移行
1. `useDashboardData` → `src/app/(authenticated)/dashboard/_hooks/`
2. テストファイル移行とimport更新
3. ダッシュボード動作確認

### 7. 品質要件

#### 7.1 静的解析
- TypeScript エラー 0個
- ESLint エラー・警告 0個
- アーキテクチャルール違反 0個

#### 7.2 動的テスト
- 全フックテストの pass
- フック使用箇所での正常動作
- メモリリークの確認

#### 7.3 パフォーマンス
- Hook 実行時間の維持
- レンダリング回数の最適化
- バンドルサイズへの影響最小化

## 受け入れ基準

### ✅ 完了条件
1. **移行完了**: 全カスタムフックが適切な場所に配置されている
2. **動作確認**: フック使用箇所での正常動作が確認されている
3. **型安全性**: TypeScript エラーが存在しない
4. **品質基準**: 全テストが pass している
5. **アーキテクチャ**: 依存関係ルールに準拠している
6. **パフォーマンス**: 実行性能が維持されている

### 🚫 失敗条件
- フック機能に不具合が発生している
- パフォーマンスが劣化している
- アーキテクチャルール違反が存在する
- テストが失敗している
- 循環依存が発生している