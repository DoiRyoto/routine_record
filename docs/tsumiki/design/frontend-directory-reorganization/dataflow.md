# データフロー図

## システム全体のアーキテクチャフロー

```mermaid
flowchart TD
    A[新規開発者] --> B[プロジェクト構造理解]
    B --> C{コンテキスト依存度判断}
    
    C -->|低| D[common/ 配下確認]
    C -->|中| E[model/ 配下確認]  
    C -->|高| F[app/ 配下確認]
    
    D --> G[汎用コンポーネント・ライブラリ]
    E --> H[ドメイン固有モジュール]
    F --> I[ページ固有実装]
    
    G --> J[実装・配置決定]
    H --> J
    I --> J
    
    J --> K[依存関係ルール遵守チェック]
    K --> L[実装完了]
```

## ディレクトリ構造判断フロー

```mermaid
flowchart TD
    A[新しいモジュール作成] --> B{どこに配置すべき？}
    
    B --> C{特定のページでのみ使用？}
    C -->|Yes| D[app/[page]/_components/]
    C -->|No| E{複数ページで使用？}
    
    E -->|Yes| F{ドメインモデルに関心がある？}
    F -->|Yes| G{どのドメイン？}
    F -->|No| H[common/components/]
    
    G --> I[user] --> J[model/user/components/]
    G --> K[routine] --> L[model/routine/components/]
    G --> M[gamification] --> N[model/gamification/components/]
    G --> O[その他ドメイン] --> P[model/[domain]/components/]
    
    D --> Q[配置完了]
    H --> Q
    J --> Q
    L --> Q
    N --> Q
    P --> Q
    
    Q --> R[import パス更新]
    R --> S[依存関係ルール確認]
    S --> T[TypeScript・Lint チェック]
```

## 移行プロセスフロー

### Phase 1: ディレクトリ構造作成

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant FS as ファイルシステム
    participant Git as Git
    
    Dev->>FS: mkdir -p src/app src/common src/model
    Dev->>FS: mkdir -p src/model/[各ドメイン]
    Dev->>FS: mkdir -p src/common/components
    Dev->>Git: コミット（構造作成）
```

### Phase 2-4: コンポーネント移行

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant Old as 既存構造
    participant New as 新構造
    participant TS as TypeScript
    
    Dev->>Old: ファイル特定・分析
    Dev->>Dev: 配置先決定
    Dev->>New: ファイル移動
    Dev->>New: import パス更新
    Dev->>TS: 型チェック実行
    TS-->>Dev: エラー報告
    Dev->>Dev: エラー修正
    Dev->>TS: 再チェック
```

### Phase 5: 最終検証

```mermaid
sequenceDiagram
    participant Dev as 開発者
    participant TS as TypeScript
    participant ESLint as ESLint
    participant E2E as E2E Test
    participant MSW as MSW Mock
    
    Dev->>TS: npm run type-check
    TS-->>Dev: 型エラー0確認
    
    Dev->>ESLint: npm run lint
    ESLint-->>Dev: Lint エラー0確認
    
    Dev->>MSW: MSW動作確認
    MSW-->>Dev: Mock正常動作
    
    Dev->>E2E: npm run test:e2e
    E2E-->>Dev: 全テストpass
```

## 依存関係フロー

```mermaid
flowchart TD
    subgraph "App Layer (高コンテキスト)"
        A1[dashboard/page.tsx]
        A2[routines/page.tsx]
        A3[settings/page.tsx]
    end
    
    subgraph "Model Layer (中コンテキスト)"
        M1[user/components]
        M2[routine/components]
        M3[gamification/components]
        M4[challenge/components]
    end
    
    subgraph "Common Layer (低コンテキスト)"
        C1[components/ui]
        C2[components/layout]
        C3[hooks]
        C4[lib]
    end
    
    A1 --> M1
    A1 --> M3
    A2 --> M2
    A3 --> M1
    
    M1 --> C1
    M2 --> C1
    M3 --> C1
    M4 --> C1
    
    M1 --> C3
    M2 --> C4
    
    style A1 fill:#ffcccc
    style A2 fill:#ffcccc
    style A3 fill:#ffcccc
    style M1 fill:#ffffcc
    style M2 fill:#ffffcc
    style M3 fill:#ffffcc
    style M4 fill:#ffffcc
    style C1 fill:#ccffcc
    style C2 fill:#ccffcc
    style C3 fill:#ccffcc
    style C4 fill:#ccffcc
```

## データ取得フロー（現行維持）

```mermaid
sequenceDiagram
    participant Page as Page Component
    participant API as API Routes  
    participant DB as Database
    participant MSW as MSW (dev only)
    
    Note over Page,MSW: 開発環境
    Page->>MSW: serverTypedGet()
    MSW-->>Page: Mock Response
    
    Note over Page,DB: 本番環境
    Page->>API: serverTypedGet()
    API->>DB: Query Execution
    DB-->>API: Data
    API-->>Page: Response
    
    Note over Page: エラー時
    API-->>Page: Error Response
    Page->>Page: Error UI Display
    Note right of Page: 絶対にMockデータを返さない
```

## コンポーネント再利用パターン

```mermaid
graph TD
    subgraph "UI Component Hierarchy"
        A[app/dashboard/page.tsx]
        B[model/gamification/components/LevelProgressBar.tsx]
        C[model/user/components/UserAvatar.tsx]
        D[common/components/ui/Progress.tsx]
        E[common/components/ui/Avatar.tsx]
    end
    
    A --> B
    A --> C
    B --> D
    C --> E
    
    subgraph "Multiple Page Usage"
        F[app/profile/page.tsx]
        G[app/leaderboard/page.tsx]
    end
    
    F --> B
    F --> C
    G --> B
    G --> C
    
    style A fill:#ffcccc
    style F fill:#ffcccc
    style G fill:#ffcccc
    style B fill:#ffffcc
    style C fill:#ffffcc
    style D fill:#ccffcc
    style E fill:#ccffcc
```

## import 文グループ化フロー

```mermaid
flowchart TD
    A[import文の分析] --> B{どの層からの import?}
    
    B -->|外部ライブラリ| C[Group 1: External]
    B -->|common/| D[Group 2: Common]
    B -->|model/| E[Group 3: Model]
    B -->|app/| F[Group 4: App]
    B -->|相対パス| G[Group 5: Relative]
    
    C --> H[コンテキスト依存度順ソート]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[最終import文生成]
    
    subgraph "例"
        J["import React from 'react'<br/>
        import { Button } from '@/common/components/ui'<br/>
        import { UserAvatar } from '@/model/user/components'<br/>
        import { DashboardStats } from './_components'"]
    end
```

## エラーハンドリングフロー

```mermaid
flowchart TD
    A[移行作業実行] --> B{TypeScript エラー?}
    B -->|Yes| C[型定義確認]
    C --> D[スキーマベース型使用]
    D --> E[型エラー解決]
    E --> B
    
    B -->|No| F{ESLint エラー?}
    F -->|Yes| G[アーキテクチャルール確認]
    G --> H[依存関係修正]
    H --> F
    
    F -->|No| I{E2E テスト失敗?}
    I -->|Yes| J[コンポーネント動作確認]
    J --> K[パス・プロパティ修正]
    K --> I
    
    I -->|No| L{MSW 動作異常?}
    L -->|Yes| M[Mock パス確認]
    M --> N[Handler 修正]
    N --> L
    
    L -->|No| O[移行完了]
```