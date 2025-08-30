# データフロー図

## システム全体データフロー

### 高レベルアーキテクチャフロー
```mermaid
flowchart TD
    U[ユーザー] --> FE[Frontend Layer]
    FE --> API[API Routes]
    API --> BL[Business Logic]
    BL --> DB[(Database)]
    
    FE -.-> MSW[MSW Mock]
    MSW -.-> FE
    
    subgraph "Frontend Layer"
        FE --> PC[Page Components]
        FE --> UC[UI Components]
        FE --> CTX[React Context]
    end
    
    subgraph "Backend Layer"
        API --> AUTH[Authentication]
        API --> VAL[Validation]
        BL --> DOM[Domain Services]
        BL --> APP[Application UseCases]
        BL --> REP[Repository Layer]
    end
    
    subgraph "Data Layer"
        REP --> DBQ[Database Queries]
        DBQ --> DB
    end
    
    style FE fill:#e1f5fe
    style API fill:#fff3e0
    style DB fill:#f3e5f5
    style MSW fill:#e8f5e8
```

## レイヤー分離データフロー

### 正しいデータフローパターン
```mermaid
sequenceDiagram
    participant U as User
    participant PC as Page Component
    participant AC as API Client
    participant AR as API Routes
    participant UC as UseCase
    participant Q as DB Query
    participant DB as Database
    
    U->>PC: ページアクセス
    PC->>AC: serverTypedGet()
    AC->>AR: HTTP Request
    AR->>UC: ビジネスロジック呼び出し
    UC->>Q: データ取得
    Q->>DB: SQL実行
    DB-->>Q: 結果返却
    Q-->>UC: 型安全データ
    UC-->>AR: ビジネスロジック完了
    AR-->>AC: API Response
    AC-->>PC: 型安全レスポンス
    PC-->>U: UIレンダリング
    
    Note over PC,AR: 🚫 Page ComponentからDB Queryの直接呼び出し禁止
    Note over AC,AR: ✅ API Routes経由の統制されたアクセス
```

### 禁止されたデータフローパターン
```mermaid
sequenceDiagram
    participant PC as Page Component
    participant Q as DB Query
    participant DB as Database
    
    PC->>Q: 直接import & 呼び出し
    Note over PC,Q: ❌ 禁止パターン
    Q->>DB: SQL実行
    DB-->>Q: 結果
    Q-->>PC: データ返却
    
    Note over PC: ❌ アーキテクチャ違反
    Note over PC: ❌ 責任境界の曖昧化
    Note over PC: ❌ テスタビリティの低下
```

## 型システム統一フロー

### Schema-First型定義フロー
```mermaid
flowchart LR
    SCH[schema.ts] --> IF[Inferred Types]
    IF --> PC[Page Components]
    IF --> AR[API Routes]
    IF --> MC[Mock Data]
    IF --> TS[Test Code]
    
    subgraph "統一型定義"
        IF --> RT[Routine]
        IF --> UP[UserProfile]
        IF --> ER[ExecutionRecord]
        IF --> IR[InsertRecord]
    end
    
    OLD[/types/* ディレクトリ] -.-> X[❌ 削除対象]
    
    style SCH fill:#4caf50,color:#fff
    style OLD fill:#f44336,color:#fff
    style X fill:#f44336,color:#fff
```

### Mock-Schema同期フロー
```mermaid
sequenceDiagram
    participant SCH as Schema
    participant MDT as Mock Data Types
    participant MH as Mock Handlers
    participant MSW as MSW System
    participant FE as Frontend
    
    SCH->>MDT: 型定義同期
    MDT->>MH: 型安全Mockデータ生成
    MH->>MSW: Handler登録
    
    Note over SCH,MDT: ✅ 完全型一致
    Note over MDT,MH: ✅ エラー時Mock返却禁止
    
    FE->>MSW: API呼び出し
    MSW-->>FE: 開発時のみMock返却
    
    Note over MSW,FE: 🔄 本番環境では無効化
```

## スタイリング統一フロー

### Tailwindカラーパターンフロー
```mermaid
flowchart TD
    DS[Design System] --> CP[Color Patterns]
    
    CP --> TP[text-text-*]
    CP --> BP[bg-bg-*]
    
    TP --> TPP[text-text-primary]
    TP --> TPS[text-text-secondary]
    TP --> TPM[text-text-muted]
    
    BP --> BPP[bg-bg-primary]
    BP --> BPS[bg-bg-secondary]
    BP --> BPA[bg-bg-accent]
    
    OLD[直接カラー指定] -.-> REPL[❌ 置換対象]
    REPL -.-> CP
    
    subgraph "Component使用"
        TPP --> BTN[Button Component]
        BPP --> CARD[Card Component]
        TPM --> TEXT[Text Component]
    end
    
    style CP fill:#2196f3,color:#fff
    style OLD fill:#f44336,color:#fff
    style REPL fill:#ff9800,color:#fff
```

## Next.js 15対応フロー

### Promise型Params処理フロー
```mermaid
sequenceDiagram
    participant R as Router
    participant PC as Page Component
    participant AR as API Route
    
    Note over R: Next.js 15
    R->>PC: params: Promise<{id: string}>
    PC->>PC: const {id} = await params
    PC->>AR: API呼び出し(id)
    
    R->>AR: params: Promise<{id: string}>
    AR->>AR: const {id} = await params
    AR-->>PC: レスポンス返却
    
    Note over PC: ✅ Promise型対応完了
    Note over AR: ✅ 統一されたパラメータ処理
```

## エラーハンドリングフロー

### 適切なエラー処理フロー
```mermaid
flowchart TD
    API[API呼び出し] --> TRY{try-catch}
    TRY -->|成功| DATA[データ処理]
    TRY -->|エラー| ERR[Error処理]
    
    ERR --> LOG[エラーログ出力]
    ERR --> MSG[ユーザーフレンドリーメッセージ]
    ERR --> UI[エラーUI表示]
    
    ERR -.-> MOCK[❌ Mockデータ返却禁止]
    
    DATA --> VALID[データ検証]
    VALID -->|有効| RENDER[UI更新]
    VALID -->|無効| ERR
    
    style ERR fill:#f44336,color:#fff
    style MOCK fill:#ff5722,color:#fff
    style DATA fill:#4caf50,color:#fff
```

## 開発時データフロー（MSW）

### MSW開発支援フロー
```mermaid
flowchart TD
    DEV{開発環境?} -->|Yes| MSW[MSW Worker開始]
    DEV -->|No| PROD[本番API呼び出し]
    
    MSW --> INTER[API Intercept]
    INTER --> HDL[Handler処理]
    HDL --> MOCK[Mockレスポンス返却]
    
    PROD --> REAL[実際のAPI]
    REAL --> DB[(Database)]
    
    subgraph "MSW Handler"
        HDL --> CRUD[CRUD操作シミュレート]
        HDL --> AUTH[認証チェック]
        HDL --> VAL[リクエスト検証]
    end
    
    MOCK --> FE[Frontend受信]
    DB --> FE
    
    style MSW fill:#e8f5e8
    style PROD fill:#fff3e0
    style FE fill:#e1f5fe
```

## コロケーションファイル配置フロー

### ディレクトリ構成配置フロー
```mermaid
flowchart TD
    ROOT[src/app] --> AUTH[/(authenticated)]
    ROOT --> PUB[/(public)]
    
    AUTH --> DASH[dashboard/]
    AUTH --> ROUT[routines/]
    
    DASH --> DPAGE[page.tsx]
    DASH --> DCOMP[_components/]
    DASH --> DHOOK[_hooks/]
    DASH --> DTYPE[_types/]
    
    ROUT --> RPAGE[page.tsx]
    ROUT --> RCREA[create/]
    ROUT --> RID[[id]/]
    ROUT --> RCOMP[_components/]
    
    RCREA --> RCPAGE[page.tsx]
    RCREA --> RCCOMP[_components/]
    
    RID --> RIDPAGE[page.tsx]
    RID --> RIDEDIT[edit/]
    RID --> RIDCOMP[_components/]
    
    style AUTH fill:#e3f2fd
    style PUB fill:#f3e5f5
    style DCOMP fill:#e8f5e8
    style RCOMP fill:#e8f5e8
```

## 品質チェックフロー

### 自動品質検証フロー
```mermaid
flowchart TD
    CODE[コード変更] --> TYPE[type-check]
    TYPE --> LINT[lint]
    LINT --> TEST[test:e2e]
    TEST --> BUILD[build]
    
    TYPE -->|エラー| TFIX[型エラー修正]
    LINT -->|警告| LFIX[Lint警告修正]
    TEST -->|失敗| TESTFIX[テスト修正]
    BUILD -->|失敗| BFIX[ビルドエラー修正]
    
    TFIX --> TYPE
    LFIX --> LINT
    TESTFIX --> TEST
    BFIX --> BUILD
    
    BUILD -->|成功| PASS[品質チェック合格]
    
    subgraph "品質基準"
        PASS --> QC1[TypeScriptエラー: 0]
        PASS --> QC2[Lintエラー・警告: 0]
        PASS --> QC3[E2Eテスト: 全パス]
        PASS --> QC4[ビルド: 成功]
    end
    
    style PASS fill:#4caf50,color:#fff
    style TFIX fill:#ff9800
    style LFIX fill:#ff9800
```

## リファクタリング実行フロー

### フェーズ別実装フロー
```mermaid
gantt
    title フロントエンド実装ルール遵守リファクタリング実行フロー
    dateFormat  X
    axisFormat  フェーズ%d
    
    section フェーズ1: アーキテクチャ再設計
    ディレクトリ構成変更        :phase1a, 0, 1
    FE/BE層分離実装             :phase1b, 0, 1
    コロケーション適用          :phase1c, 0, 1
    
    section フェーズ2: 基盤修正
    Tailwindカラーパターン統一  :phase2a, 1, 1
    型システム統一              :phase2b, 1, 1
    Page Components修正         :phase2c, 1, 1
    
    section フェーズ3: 型安全性確保
    Mock整合性修正              :phase3a, 2, 1
    Next.js 15対応              :phase3b, 2, 1
    TypeScript厳格ルール        :phase3c, 2, 1
    
    section フェーズ4: 品質保証
    ts-ignoreコメント除去       :phase4a, 3, 1
    type-check完全パス          :phase4b, 3, 1
    lint警告ゼロ達成            :phase4c, 3, 1
```

---

**データフロー設計完了日**: 2025-01-30  
**対象システム**: RoutineRecord (Next.js 15 + TypeScript)  
**フロー設計者**: Claude Code Assistant