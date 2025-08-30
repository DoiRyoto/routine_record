# データフロー図

## システム全体データフロー概要

### 主要なデータフローパターン

```mermaid
flowchart TD
    subgraph "User Interaction Layer"
        U[ユーザー]
        UI[Web UI]
    end
    
    subgraph "Application Layer" 
        SC[Server Components]
        CC[Client Components]
        CTX[React Context]
    end
    
    subgraph "API Layer"
        MW[認証ミドルウェア]
        API[API Routes]
        UC[Use Cases]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        AUTH[Supabase Auth]
        CACHE[Future: Redis Cache]
    end
    
    U --> UI
    UI --> SC
    UI --> CC
    CC --> CTX
    CC --> API
    SC --> UC
    API --> MW
    MW --> AUTH
    API --> UC
    UC --> DB
    
    classDef user fill:#ffcdd2
    classDef ui fill:#e1f5fe  
    classDef api fill:#f3e5f5
    classDef data fill:#e8f5e8
    
    class U user
    class UI,SC,CC,CTX ui
    class MW,API,UC api
    class DB,AUTH,CACHE data
```

## ユーザーインタラクションフロー

### 認証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as フロントエンド
    participant M as 認証ミドルウェア
    participant A as API
    participant S as Supabase Auth
    participant D as データベース
    
    Note over U,D: ユーザーサインイン
    U->>F: 認証情報入力
    F->>F: クライアント側バリデーション
    F->>A: POST /api/auth/signin
    A->>S: signInWithPassword()
    S->>S: 認証情報検証
    S-->>A: JWT + Session
    A->>A: HTTPOnlyクッキー設定
    A-->>F: 認証成功レスポンス
    F->>F: AuthContext更新
    F-->>U: ダッシュボードへリダイレクト
    
    Note over U,D: 認証後のAPI呼び出し
    U->>F: 保護されたアクション
    F->>A: APIリクエスト（クッキー付き）
    A->>M: 認証チェック
    M->>S: セッション検証
    S-->>M: ユーザー情報
    M->>D: RLSによるデータアクセス
    D-->>M: ユーザー固有データ
    M-->>F: 認証済みレスポンス
    F-->>U: UI更新
```

### ルーチン管理フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as ルーチンフォーム
    participant V as バリデーション
    participant API as API Route
    participant UC as Use Case
    participant R as Repository
    participant DB as PostgreSQL
    
    Note over U,DB: ルーチン作成
    U->>C: フォーム入力
    C->>V: Zodスキーマ検証
    V-->>C: 検証結果
    
    alt 検証成功
        C->>API: POST /api/routines
        API->>API: サーバー側バリデーション
        API->>UC: CreateRoutineUseCase
        UC->>UC: ビジネスルール適用
        UC->>R: Repository.save()
        R->>DB: INSERT INTO routines
        DB-->>R: 作成されたデータ
        R-->>UC: Routineエンティティ
        UC-->>API: 成功結果
        API-->>C: 201 Created
        C->>C: UI状態更新
        C-->>U: 成功フィードバック
    else 検証失敗
        V-->>C: エラーメッセージ
        C-->>U: フィールドエラー表示
    end
```

## データ処理フロー

### ルーチン実行とゲーミフィケーション連携

```mermaid
flowchart TD
    A[ユーザーアクション: ルーチン実行] --> B[実行記録作成]
    B --> C[ExecutionRecordService]
    C --> D[データベース保存]
    D --> E[XPCalculationService]
    
    E --> F[基本XP計算]
    F --> G[ボーナス計算]
    G --> H[XPTransaction記録]
    
    H --> I[ユーザープロフィール更新]
    I --> J{レベルアップ?}
    J -->|Yes| K[レベルアップ処理]
    J -->|No| L[現在XP更新]
    
    K --> M[レベルアップ通知]
    K --> N[バッジ解除チェック]
    L --> O[ミッション進捗更新]
    M --> O
    N --> O
    
    O --> P[チャレンジ進捗更新]
    P --> Q[通知システム]
    Q --> R[フロントエンド状態更新]
    R --> S[ユーザーへのフィードバック]
    
    classDef action fill:#ffcdd2
    classDef service fill:#e1f5fe
    classDef data fill:#e8f5e8
    classDef notification fill:#fff3e0
    
    class A action
    class C,E,F,G,H,I service  
    class D,B,L,O,P data
    class M,N,Q,R,S notification
```

### XP獲得とレベリングフロー詳細

```mermaid
sequenceDiagram
    participant ER as ExecutionRecord
    participant XPS as XPService
    participant MS as MissionService
    participant BS as BadgeService
    participant NS as NotificationService
    participant UP as UserProfile
    participant DB as Database
    
    ER->>XPS: calculateXP(executionRecord)
    XPS->>XPS: 基本XP計算
    XPS->>XPS: ストリークボーナス計算
    XPS->>XPS: 初回完了ボーナス計算
    XPS->>DB: XPTransaction作成
    
    XPS->>UP: addXP(amount)
    UP->>UP: 総XP更新
    UP->>UP: currentXP更新
    UP->>UP: レベル計算
    
    alt レベルアップ
        UP->>NS: レベルアップ通知作成
        UP->>BS: 新レベルバッジチェック
        BS->>DB: バッジ解除記録
        BS->>NS: バッジ解除通知作成
    end
    
    XPS->>MS: updateMissionProgress(userId, type)
    MS->>MS: 進捗計算
    MS->>DB: ミッション進捗更新
    
    alt ミッション完了
        MS->>XPS: awardMissionXP(missionId)
        MS->>NS: ミッション完了通知作成
    end
    
    NS->>DB: 通知一括保存
```

## リアルタイムデータ同期フロー（将来実装）

### WebSocket接続によるリアルタイム更新

```mermaid
sequenceDiagram
    participant U1 as ユーザー1
    participant F1 as フロントエンド1
    participant U2 as ユーザー2 
    participant F2 as フロントエンド2
    participant WS as WebSocketサーバー
    participant DB as PostgreSQL
    participant RT as Supabaseリアルタイム
    
    Note over U1,RT: 現在未実装、将来の拡張案
    
    F1->>WS: WebSocket接続
    F2->>WS: WebSocket接続
    
    U1->>F1: チャレンジ進捗更新
    F1->>DB: データ更新
    DB->>RT: テーブル変更通知
    RT->>WS: リアルタイムイベント
    WS->>F2: チャレンジ進捗更新通知
    F2->>F2: リーダーボード更新
    F2->>U2: リアルタイムUI反映
```

## エラーハンドリングフロー

### 階層別エラー処理

```mermaid
flowchart TD
    A[ユーザー入力] --> B[クライアント検証]
    B --> C{検証結果}
    C -->|成功| D[APIリクエスト]
    C -->|失敗| E[フィールドエラー表示]
    
    D --> F[サーバー検証]
    F --> G{検証結果}
    G -->|成功| H[ビジネスロジック実行]
    G -->|失敗| I[400 Bad Request]
    
    H --> J{認証チェック}
    J -->|成功| K[データベース処理]
    J -->|失敗| L[401 Unauthorized]
    
    K --> M{処理結果}
    M -->|成功| N[200 Success]
    M -->|エラー| O[500 Server Error]
    
    I --> P[エラーレスポンス]
    L --> P
    O --> P
    P --> Q[クライアントエラーハンドリング]
    Q --> R[ユーザーフィードバック]
    
    E --> S[即座にユーザーフィードバック]
    N --> T[成功フィードバック]
    
    classDef input fill:#e3f2fd
    classDef validation fill:#f3e5f5
    classDef error fill:#ffebee
    classDef success fill:#e8f5e8
    
    class A input
    class B,F,G,J validation
    class E,I,L,O,P,Q,R error
    class N,T success
```

## 状態管理フロー

### React Context状態管理

```mermaid
flowchart TD
    subgraph "Auth Context"
        A1[ユーザー状態] --> A2[ローディング状態]
        A2 --> A3[認証メソッド]
    end
    
    subgraph "Theme Context"  
        B1[テーマ状態] --> B2[システムテーマ]
        B2 --> B3[テーマ切り替えメソッド]
    end
    
    subgraph "Snackbar Context"
        C1[通知キュー] --> C2[表示/非表示メソッド]
        C2 --> C3[自動消去タイマー]
    end
    
    A3 --> D[コンポーネントツリー]
    B3 --> D
    C3 --> D
    D --> E[UIコンポーネント]
    
    E --> F[ユーザーインタラクション]
    F --> G[Context更新]
    G --> H[自動再レンダリング]
```

### Server/Client状態同期

```mermaid
sequenceDiagram
    participant SSC as Server Components
    participant CSC as Client Components  
    participant API as API Routes
    participant DB as Database
    participant CTX as Context
    
    Note over SSC,DB: 初期データ取得（SSR）
    SSC->>DB: 初期データフェッチ
    DB-->>SSC: サーバーサイドデータ
    SSC->>CSC: Props経由でデータ渡し
    
    Note over CSC,CTX: クライアント側初期化
    CSC->>CTX: Context初期化
    CTX->>CSC: 初期状態提供
    
    Note over CSC,DB: ユーザーインタラクション
    CSC->>API: データ変更リクエスト
    API->>DB: データベース更新
    DB-->>API: 更新されたデータ
    API-->>CSC: 最新データレスポンス
    CSC->>CTX: Context状態更新
    CTX->>CSC: 関連コンポーネント再レンダリング
```

## パフォーマンス最適化フロー

### データローディング戦略

```mermaid
flowchart TD
    A[ページリクエスト] --> B{コンテンツタイプ}
    
    B -->|静的| C[SSG: ビルド時生成]
    B -->|動的| D[SSR: リクエスト時生成]
    B -->|インタラクティブ| E[CSR: クライアント側]
    
    C --> F[CDNキャッシュ]
    D --> G[サーバーキャッシュ]
    E --> H[ブラウザキャッシュ]
    
    F --> I[高速配信]
    G --> I
    H --> I
    
    I --> J{データ鮮度}
    J -->|新鮮| K[キャッシュ利用]
    J -->|期限切れ| L[新しいデータ取得]
    
    L --> M[キャッシュ更新]
    M --> K
    K --> N[ユーザーへの表示]
```

### データベースクエリ最適化

```mermaid
flowchart TD
    A[APIリクエスト] --> B[クエリ解析]
    B --> C{複雑さ判定}
    
    C -->|単純| D[単一テーブルクエリ]
    C -->|複雑| E[JOIN最適化]
    
    D --> F[基本インデックス使用]
    E --> G[複合インデックス使用]
    
    F --> H[高速クエリ実行]
    G --> H
    
    H --> I{結果サイズ}
    I -->|小| J[全データ取得]
    I -->|大| K[ページネーション]
    
    J --> L[レスポンス]
    K --> L
```

## 監視・ログフロー

### ログ収集・分析フロー（推奨実装）

```mermaid
flowchart TD
    A[アプリケーション] --> B[構造化ログ出力]
    B --> C[ログアグリゲーター]
    C --> D[ログストレージ]
    
    E[エラートラッキング] --> F[Sentry等]
    F --> G[アラート通知]
    
    H[パフォーマンス監視] --> I[APMツール]
    I --> J[メトリクスダッシュボード]
    
    D --> K[ログ分析]
    G --> L[インシデント対応]
    J --> M[パフォーマンス改善]
    
    classDef logging fill:#e3f2fd
    classDef monitoring fill:#f3e5f5
    classDef analysis fill:#e8f5e8
    
    class A,B,C,D logging
    class E,F,G,H,I monitoring
    class K,L,M,J analysis
```

---

## データフロー設計の特徴

### 強み

1. **明確な責任分離**: 各層が明確な役割を持つ
2. **型安全性**: TypeScriptによる end-to-end型安全性
3. **リアクティブ設計**: 状態変更の自動的なUI反映
4. **セキュリティファースト**: 認証・認可の一貫した適用

### 最適化ポイント

1. **キャッシュ戦略**: 頻繁なクエリの結果キャッシュ
2. **バッチ処理**: 複数の更新の一括処理
3. **非同期処理**: 重い処理のバックグラウンド実行
4. **リアルタイム機能**: WebSocketによるイベント駆動更新

### 将来の拡張性

1. **マイクロサービス化**: API層の分離と独立スケーリング
2. **イベントソーシング**: ドメインイベントによる状態管理
3. **CQRS**: 読み取り/書き込みの最適化分離
4. **グローバル展開**: CDNとエッジコンピューティング活用