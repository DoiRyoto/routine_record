// フロントエンドディレクトリ再編成 TypeScript型定義

// ============================================================================
// 移行設定・構成型定義
// ============================================================================

/** 
 * ディレクトリ構造の定義
 */
export interface DirectoryStructure {
  app: AppLayerStructure;
  common: CommonLayerStructure;  
  model: ModelLayerStructure;
  server: ServerLayerStructure; // 既存維持
}

/**
 * アプリケーション層構造（高コンテキスト依存）
 */
export interface AppLayerStructure {
  authenticated: AuthenticatedRoutes;
  public: PublicRoutes;
  api: string[]; // 既存API Routes維持
}

export interface AuthenticatedRoutes {
  dashboard: PageStructure;
  routines: PageStructure;
  settings: PageStructure;
  profile: PageStructure;
  leaderboard: PageStructure;
}

export interface PublicRoutes {
  auth: PageStructure;
  landing: PageStructure;
}

export interface PageStructure {
  pageComponent: string;    // "page.tsx"
  uiComponent: string;     // "[Page]Page.tsx" 
  components: string[];    // "_components/" 配下
  stories?: string[];      // Storybook ファイル
}

/**
 * 共通層構造（低コンテキスト依存）
 */
export interface CommonLayerStructure {
  components: CommonComponents;
  hooks: string[];         // 汎用カスタムフック
  lib: CommonLibraries;
  types: string[];        // 汎用型定義
  context: string[];      // React Context
  utils: string[];        // 汎用ユーティリティ
}

export interface CommonComponents {
  ui: string[];           // shadcn/ui 系コンポーネント
  layout: string[];       // Header, Navigation等
  filters: string[];      // 汎用フィルタリング
  charts: string[];       // 汎用チャート・可視化
  mobile: string[];       // モバイル対応共通
}

export interface CommonLibraries {
  date: string;          // date-fns 再エクスポート
  guard: string;         // remeda 再エクスポート  
  validation: string;    // バリデーションユーティリティ
  apiClient: string;     // API クライアント
}

/**
 * モデル層構造（中コンテキスト依存）
 */
export interface ModelLayerStructure {
  user: DomainModel;
  routine: DomainModel;
  challenge: DomainModel;
  mission: DomainModel;
  badge: DomainModel;
  gamification: DomainModel;
  category: DomainModel;
}

export interface DomainModel {
  components: DomainComponents;
  hooks: string[];        // ドメイン固有フック
  lib?: string[];        // ドメイン固有ロジック
  types?: string;        // ドメイン型定義
}

export interface DomainComponents {
  [componentGroup: string]: string[]; // 例: avatar/, form/, list/, item/
}

/**
 * サーバー層構造（既存維持）
 */
export interface ServerLayerStructure {
  application: string[];
  domain: string[];
  lib: string[];
}

// ============================================================================
// 移行プロセス型定義  
// ============================================================================

/**
 * 移行フェーズ定義
 */
export type MigrationPhase = 
  | 'structure-creation'      // Phase 1: ディレクトリ構造作成
  | 'ui-component-migration'  // Phase 2: UIコンポーネント移行
  | 'domain-component-migration' // Phase 3: ドメイン固有移行
  | 'utility-migration'       // Phase 4: フック・ユーティリティ移行
  | 'import-validation';      // Phase 5: Import修正・検証

/**
 * 移行タスク定義
 */
export interface MigrationTask {
  id: string;              // MIGRATION-001等
  phase: MigrationPhase;
  title: string;
  description: string;
  sourcePattern: string;   // 移行元パスパターン
  targetPattern: string;   // 移行先パスパターン  
  dependencies: string[];  // 依存するタスクID
  estimatedFiles: number;  // 影響ファイル数推定
}

/**
 * ファイル移行情報
 */
export interface FileMigration {
  originalPath: string;
  newPath: string;
  contextLevel: ContextDependencyLevel;
  domainModel?: DomainModelType;
  relatedFiles: string[];  // 関連ファイル（stories等）
}

/**
 * コンテキスト依存度レベル
 */
export type ContextDependencyLevel = 'low' | 'medium' | 'high';

/**
 * ドメインモデル種別
 */
export type DomainModelType = 
  | 'user' 
  | 'routine' 
  | 'challenge' 
  | 'mission' 
  | 'badge' 
  | 'gamification' 
  | 'category';

// ============================================================================
// 依存関係・ルール型定義
// ============================================================================

/**
 * 依存関係ルール
 */
export interface DependencyRules {
  prohibited: ProhibitedDependency[];  // 禁止依存
  allowed: AllowedDependency[];       // 許可依存
  recommendations: string[];          // 推奨事項
}

export interface ProhibitedDependency {
  from: LayerType | string;  // 依存元
  to: LayerType | string;    // 依存先
  reason: string;           // 禁止理由
}

export interface AllowedDependency {
  from: LayerType | string;
  to: LayerType | string;
  condition?: string;       // 条件付き許可
}

export type LayerType = 'app' | 'common' | 'model' | 'server';

/**
 * Import 順序・グループ化ルール
 */
export interface ImportGroupingRules {
  groups: ImportGroup[];
  sortWithinGroup: boolean;  // グループ内ソート
  emptyLineBetweenGroups: boolean; // グループ間空行
}

export interface ImportGroup {
  name: string;             // 'external', 'common', 'model', 'app', 'relative'
  pattern: string | RegExp; // マッチパターン
  order: number;           // ソート順
}

// ============================================================================  
// 検証・品質チェック型定義
// ============================================================================

/**
 * 移行品質メトリクス
 */
export interface MigrationQualityMetrics {
  typeScriptErrors: number;
  eslintErrors: number;
  eslintWarnings: number;
  e2eTestResults: TestResults;
  buildTime: number;       // ビルド時間(ms)
  bundleSize: BundleSizeMetrics;
  dependencyViolations: DependencyViolation[];
}

export interface TestResults {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface BundleSizeMetrics {
  total: number;          // bytes
  javascript: number;
  css: number;
  treeshakingEfficiency: number; // %
}

export interface DependencyViolation {
  type: 'prohibited-import' | 'circular-dependency' | 'cross-layer-violation';
  file: string;
  violatingImport: string;
  rule: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// コンポーネント分析・分類型定義
// ============================================================================

/**
 * コンポーネント分析結果
 */
export interface ComponentAnalysis {
  filePath: string;
  componentName: string;
  usagePattern: ComponentUsagePattern;
  domainAffinity: DomainAffinityAnalysis;
  dependencies: ComponentDependencies;
  recommendedLocation: string;
  migrationComplexity: 'low' | 'medium' | 'high';
}

export interface ComponentUsagePattern {
  pagesUsedIn: string[];     // 使用されているページ
  frequency: number;         // 再利用頻度
  isPageSpecific: boolean;   // ページ固有かどうか
}

export interface DomainAffinityAnalysis {
  primaryDomain?: DomainModelType;  // 主要関心ドメイン
  secondaryDomains: DomainModelType[]; // 副次関心ドメイン
  isDomainNeutral: boolean;  // ドメインニュートラル
  confidence: number;        // 分析信頼度 0-1
}

export interface ComponentDependencies {
  imports: ImportAnalysis[];
  exports: ExportAnalysis[];
  internalDependencies: string[]; // プロジェクト内依存
  externalDependencies: string[]; // 外部ライブラリ依存
}

export interface ImportAnalysis {
  source: string;           // import 元
  specifiers: string[];     // import する項目
  isDynamic: boolean;       // dynamic import か
  contextLevel: ContextDependencyLevel;
}

export interface ExportAnalysis {
  name: string;
  type: 'default' | 'named';
  isReExport: boolean;
}

// ============================================================================
// 設定・環境型定義
// ============================================================================

/**
 * 移行設定
 */
export interface MigrationConfig {
  dryRun: boolean;          // 実際の移行を行わない
  backup: boolean;          // 移行前バックアップ作成
  validateOnly: boolean;    // 検証のみ実行
  phases: MigrationPhase[]; // 実行するフェーズ
  excludePatterns: string[]; // 除外ファイルパターン
  preserveGitHistory: boolean; // Git履歴保持（git mv使用）
}

/**
 * 検証設定
 */
export interface ValidationConfig {
  typeCheck: boolean;       // TypeScript型チェック
  lint: boolean;           // ESLint実行
  e2eTests: boolean;       // E2Eテスト実行
  bundleAnalysis: boolean; // バンドルサイズ分析
  dependencyCheck: boolean; // 依存関係違反チェック
  performanceCheck: boolean; // パフォーマンスチェック
}

// ============================================================================
// 新規メンバー向けガイド型定義
// ============================================================================

/**
 * ディレクトリ配置ガイド
 */
export interface PlacementGuide {
  questions: PlacementQuestion[];
  rules: PlacementRule[];
  examples: PlacementExample[];
}

export interface PlacementQuestion {
  id: string;
  question: string;
  answers: PlacementAnswer[];
}

export interface PlacementAnswer {
  text: string;
  nextQuestionId?: string;
  recommendation?: string; // 最終推奨配置
}

export interface PlacementRule {
  condition: string;
  action: string;
  layer: LayerType;
  example: string;
}

export interface PlacementExample {
  scenario: string;
  componentType: string;
  analysis: string;
  recommendedPath: string;
  reasoning: string;
}