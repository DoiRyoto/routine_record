# TASK-002: バックエンド基盤リファクタリング - 要件定義

## 概要

既存のAPI RoutesとDrizzleクエリをクリーンアーキテクチャに適合させ、以下を実現する：
- 関心の分離による保守性向上
- テスト容易性の向上
- ドメインロジックの集約
- 依存関係の逆転

## 分析結果

### 現在の構造
```
/api/routines/route.ts (138 lines)
├── 認証処理 (Supabase Auth)
├── バリデーション (手動チェック)
├── ビジネスロジック (なし)
└── データ操作 (lib/db/queries/routines.ts)

/lib/db/queries/routines.ts (100+ lines)
├── SQL実行 (Drizzle ORM)
├── データ変換 (transformRoutine)
└── CRUD操作
```

### 問題点
1. **関心の混在**: 認証・バリデーション・DB操作が同一ファイル
2. **ビジネスロジック不在**: ドメインルールがコントローラーに散在
3. **テスト困難**: HTTPレイヤーに依存したロジック
4. **再利用性低**: API Routes専用の実装

## 要件詳細

### REQ-001: ドメインサービス実装
**AS A** 開発者  
**I WANT TO** ルーティンのビジネスロジックをドメインサービスに集約する  
**SO THAT** ビジネスルールの一貫性と再利用性を確保する

**受け入れ基準**:
- [ ] RoutineProgressService実装（進捗計算ロジック）
- [ ] RoutineValidationService実装（ビジネスルール検証）
- [ ] XP計算とレベルアップロジック
- [ ] ストリーク計算ロジック

### REQ-002: リポジトリパターン導入
**AS A** 開発者  
**I WANT TO** データアクセスをリポジトリパターンで抽象化する  
**SO THAT** データ永続化の実装詳細をドメイン層から隠蔽する

**受け入れ基準**:
- [ ] DrizzleRoutineRepository実装
- [ ] DrizzleExecutionRecordRepository実装
- [ ] 既存のDrizzle ORMとの統合
- [ ] エラーハンドリングの統一

### REQ-003: ユースケース実装
**AS A** 開発者  
**I WANT TO** アプリケーション固有のロジックをユースケースに実装する  
**SO THAT** 単一責任原則を守り、テスト可能な構造にする

**受け入れ基準**:
- [ ] CreateRoutineUseCase
- [ ] GetRoutinesUseCase  
- [ ] UpdateRoutineUseCase
- [ ] DeleteRoutineUseCase
- [ ] CompleteRoutineUseCase

### REQ-004: プレゼンテーション層分離
**AS A** 開発者  
**I WANT TO** HTTPレイヤーをコントローラーとして分離する  
**SO THAT** 認証・バリデーション・レスポンス処理を統一する

**受け入れ基準**:
- [ ] RoutineController実装
- [ ] AuthenticationMiddleware実装
- [ ] ValidationMiddleware実装
- [ ] 統一エラーレスポンス

### REQ-005: 既存コードとの互換性
**AS A** システム  
**I WANT TO** 既存のフロントエンドAPIとの互換性を保持する  
**SO THAT** フロントエンド側に影響を与えない移行を実現する

**受け入れ基準**:
- [ ] APIエンドポイントURLの維持
- [ ] レスポンス形式の維持
- [ ] 既存機能の完全動作
- [ ] パフォーマンス劣化なし

## 技術仕様

### アーキテクチャ構成
```
src/
├── domain/                  # 既実装
│   ├── entities/
│   ├── valueObjects/
│   └── repositories/
├── application/             # 新規実装
│   ├── usecases/
│   │   ├── CreateRoutineUseCase.ts
│   │   ├── GetRoutinesUseCase.ts
│   │   └── ...
│   └── services/
│       ├── RoutineProgressService.ts
│       └── RoutineValidationService.ts
├── infrastructure/          # 新規実装
│   ├── repositories/
│   │   ├── DrizzleRoutineRepository.ts
│   │   └── DrizzleExecutionRecordRepository.ts
│   └── database/
│       ├── index.ts         # 既存移動
│       └── schema.ts        # 既存移動
└── presentation/            # 新規実装
    ├── controllers/
    │   └── RoutineController.ts
    └── middleware/
        ├── AuthMiddleware.ts
        └── ValidationMiddleware.ts
```

### データフロー
```
HTTP Request
    ↓
AuthMiddleware (認証)
    ↓
ValidationMiddleware (DTO検証)
    ↓
RoutineController (HTTP処理)
    ↓
CreateRoutineUseCase (アプリケーションロジック)
    ↓
RoutineValidationService (ビジネスルール検証)
    ↓
DrizzleRoutineRepository (データ永続化)
    ↓
Drizzle ORM → PostgreSQL
```

## パフォーマンス要件

- **API応答時間**: 既存と同等（平均 < 500ms）
- **メモリ使用量**: 増加は10%以内
- **同時リクエスト処理**: 既存レベル維持
- **データベース接続**: プール設定維持

## セキュリティ要件

- **認証**: Supabase Auth統合継続
- **認可**: ユーザーデータ分離維持
- **入力検証**: class-validator活用
- **SQLインジェクション対策**: Drizzle ORM継続使用

## テスト要件

### 単体テスト
- [ ] ドメインサービステスト
- [ ] ユースケーステスト
- [ ] リポジトリテスト
- [ ] コントローラーテスト

### 統合テスト
- [ ] API統合テスト
- [ ] データベース統合テスト
- [ ] 認証統合テスト

### E2Eテスト
- [ ] 既存E2Eテストの動作確認
- [ ] 新機能のE2Eテスト

## 移行戦略

### フェーズ1: インフラ層実装
1. DrizzleRoutineRepository実装
2. データベース層の移動・整理
3. 統合テスト

### フェーズ2: アプリケーション層実装
1. ユースケース実装
2. ドメインサービス実装
3. 単体テスト

### フェーズ3: プレゼンテーション層実装
1. ミドルウェア実装
2. コントローラー実装  
3. API Routes統合

### フェーズ4: 統合・検証
1. 全体統合テスト
2. パフォーマンステスト
3. 既存機能動作確認

## 成功基準

### 機能要件
- [ ] 全てのCRUD操作が正常動作
- [ ] 既存APIとの完全互換性
- [ ] エラーハンドリングの適切な動作

### 品質要件
- [ ] 単体テストカバレッジ90%以上
- [ ] 統合テスト100%パス
- [ ] TypeScriptエラー0件
- [ ] ESLintエラー・警告0件

### パフォーマンス要件
- [ ] API応答時間劣化なし（±5%以内）
- [ ] メモリ使用量増加10%以内
- [ ] 同時接続数維持

## リスク対応

### 高リスク
1. **データ互換性**: 既存データとの不整合
   - **対策**: 段階的移行とバックアップ
   - **検知**: データ整合性テスト

2. **パフォーマンス劣化**: レイヤー追加による性能低下
   - **対策**: プロファイリングと最適化
   - **検知**: 継続的パフォーマンステスト

### 中リスク
1. **認証統合**: Supabase認証との整合性
   - **対策**: 認証フローの詳細テスト
   
2. **型安全性**: 複数レイヤー間の型整合性
   - **対策**: 厳密な型定義とテスト

この要件定義に基づいて、次のステップでテストケースを作成し、TDDプロセスを継続します。