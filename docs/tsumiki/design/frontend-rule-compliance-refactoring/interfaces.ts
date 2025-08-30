/**
 * フロントエンド実装ルール遵守リファクタリング
 * TypeScript型定義設計
 * 
 * 設計方針:
 * 1. Schema-First: 全型定義は @/lib/db/schema.ts から取得
 * 2. 型変換禁止: スキーマから直接型を推論
 * 3. Mock整合性: MockデータはSchemaと完全一致
 * 4. API型安全性: Request/Response型の厳密定義
 */

// ========================================
// Schema-based 型定義（推奨パターン）
// ========================================

/**
 * ✅ 正しい型インポートパターン
 * スキーマから直接型を取得し、型の一元管理を実現
 */
import type { 
  // テーブル型（SELECT用）
  User,
  Routine,
  ExecutionRecord,
  UserProfile,
  UserSetting,
  Category,
  Challenge,
  Badge,
  Mission,
  GameNotification,
  XPTransaction,
  
  // INSERT用型
  InsertUser,
  InsertRoutine,
  InsertExecutionRecord,
  InsertUserProfile,
  InsertUserSetting,
  InsertCategory,
  InsertChallenge,
  InsertBadge,
  InsertMission,
  InsertGameNotification,
  InsertXPTransaction,
  
  // UPDATE用型は各ファイルで Partial<Type> として定義
  
  // Enum型
  goalTypeEnum,
  recurrenceTypeEnum,
  themeEnum,
  languageEnum,
  timeFormatEnum,
  userStatusEnum,
  missionTypeEnum,
  missionDifficultyEnum,
  badgeRarityEnum,
  challengeTypeEnum,
  notificationTypeEnum,
  xpSourceTypeEnum,
} from '@/lib/db/schema';

// ========================================
// API Request/Response 型定義
// ========================================

/**
 * 汎用APIレスポンス型
 * 全APIエンドポイントで統一して使用
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  totalCount?: number;
  hasNextPage?: boolean;
}

/**
 * ページネーション用パラメータ
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationResponse<T> extends ApiResponse<T[]> {
  metadata: ResponseMetadata & {
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    currentPage: number;
    totalPages: number;
  };
}

// ========================================
// Routines関連API型定義
// ========================================

/**
 * ルーチン一覧取得API
 */
export interface RoutinesGetRequest {
  userId?: string;
  category?: string;
  isActive?: boolean;
  pagination?: PaginationParams;
}

export interface RoutinesGetResponse extends ApiResponse<Routine[]> {}

/**
 * ルーチン作成API
 */
export interface RoutineCreateRequest extends Omit<InsertRoutine, 'id' | 'createdAt' | 'updatedAt'> {}

export interface RoutineCreateResponse extends ApiResponse<Routine> {}

/**
 * ルーチン更新API
 */
export interface RoutineUpdateRequest extends Partial<Routine> {}

export interface RoutineUpdateResponse extends ApiResponse<Routine> {}

/**
 * ルーチン削除API
 */
export interface RoutineDeleteResponse extends ApiResponse<{ deletedId: string }> {}

// ========================================
// User Profiles関連API型定義
// ========================================

/**
 * ユーザープロフィール取得API
 */
export interface UserProfileGetRequest {
  userId: string;
}

export interface UserProfileGetResponse extends ApiResponse<UserProfile> {}

/**
 * ユーザープロフィール更新API
 */
export interface UserProfileUpdateRequest extends Partial<UserProfile> {}

export interface UserProfileUpdateResponse extends ApiResponse<UserProfile> {}

// ========================================
// Gamification関連API型定義
// ========================================

/**
 * XP取得履歴API
 */
export interface XpTransactionsGetRequest {
  userId: string;
  sourceType?: typeof xpSourceTypeEnum.enumValues[number];
  startDate?: string;
  endDate?: string;
  pagination?: PaginationParams;
}

export interface XpTransactionsGetResponse extends PaginationResponse<XPTransaction> {}

/**
 * バッジ一覧取得API
 */
export interface BadgesGetRequest {
  userId?: string;
  rarity?: typeof badgeRarityEnum.enumValues[number];
  isUnlocked?: boolean;
}

export interface BadgesGetResponse extends ApiResponse<Badge[]> {}

/**
 * チャレンジ一覧取得API
 */
export interface ChallengesGetRequest {
  userId?: string;
  type?: typeof challengeTypeEnum.enumValues[number];
  isActive?: boolean;
}

export interface ChallengesGetResponse extends ApiResponse<Challenge[]> {}

// ========================================
// Authentication関連API型定義
// ========================================

/**
 * サインイン API
 */
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse extends ApiResponse<{
  user: User;
  sessionToken: string;
  expiresAt: string;
}> {}

/**
 * サインアップ API
 */
export interface SignUpRequest extends Pick<InsertUser, 'email' | 'displayName'> {
  password: string;
  confirmPassword: string;
}

export interface SignUpResponse extends ApiResponse<{
  user: User;
  emailVerificationRequired: boolean;
}> {}

/**
 * パスワードリセット API
 */
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse extends ApiResponse<{
  resetTokenSent: boolean;
}> {}

// ========================================
// Frontend Component Props型定義
// ========================================

/**
 * Page Component共通Props
 */
export interface BasePageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

/**
 * Dashboard Page Props
 */
export interface DashboardPageProps extends BasePageProps {
  initialRoutines: Routine[];
  initialExecutionRecords: ExecutionRecord[];
  userSettings: UserSetting;
  userProfile?: UserProfile;
  isLoading?: boolean;
  apiError?: string;
  networkError?: string;
  onRetry?: () => void;
}

/**
 * Routines Page Props
 */
export interface RoutinesPageProps extends BasePageProps {
  initialRoutines: Routine[];
  categories: Category[];
  userProfile: UserProfile;
}

/**
 * Statistics Page Props  
 */
export interface StatisticsPageProps extends BasePageProps {
  executionRecords: ExecutionRecord[];
  routines: Routine[];
  userProfile: UserProfile;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// ========================================
// UI Component Props型定義
// ========================================

/**
 * Button Component Props
 * Tailwindカラーパターンに準拠
 */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'data-testid'?: string;
}

/**
 * Toast Component Props
 */
export interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  className?: string;
}

/**
 * User Avatar Component Props
 */
export interface UserAvatarProps {
  userProfile: UserProfile;
  size: 'sm' | 'md' | 'lg' | 'xl';
  showLevel?: boolean;
  showXP?: boolean;
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

/**
 * Experience Points Component Props
 */
export interface ExperiencePointsProps {
  value: number;
  variant?: 'counter' | 'badge' | 'progress';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  'data-testid'?: string;
}

// ========================================
// Form関連型定義
// ========================================

/**
 * ルーチン作成フォーム
 */
export interface RoutineFormData extends Omit<InsertRoutine, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {}

/**
 * ユーザー設定フォーム
 */
export interface UserSettingsFormData extends Omit<Partial<UserSetting>, 'userId' | 'updatedAt'> {}

/**
 * プロフィール更新フォーム
 */
export interface ProfileUpdateFormData extends Omit<Partial<UserProfile>, 'userId' | 'updatedAt'> {}

// ========================================
// Error型定義
// ========================================

/**
 * アプリケーション固有エラー型
 */
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

/**
 * バリデーションエラー型
 */
export interface ValidationError extends AppError {
  fields: Record<string, string[]>;
}

/**
 * 認証エラー型
 */
export interface AuthError extends AppError {
  authRequired: boolean;
  redirectUrl?: string;
}

// ========================================
// Utility型定義
// ========================================

/**
 * Optional型ヘルパー
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required型ヘルパー
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Timestamp付き型
 */
export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

/**
 * ID付き型
 */
export type WithId<T> = T & {
  id: string;
};

// ========================================
// Next.js 15対応型定義
// ========================================

/**
 * Next.js 15 Page Component型定義
 * Promise型paramsに対応
 */
export interface NextPageProps {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Next.js 15 API Route型定義
 */
export interface NextApiContext {
  params: Promise<Record<string, string>>;
}

// ========================================
// Mock関連型定義
// ========================================

/**
 * Mock用型定義
 * 本番環境では使用禁止
 */
export interface MockConfig {
  enabled: boolean;
  delayMs?: number;
  errorRate?: number; // 0-1の範囲
}

/**
 * MSW Handler型定義
 */
export interface MockHandler {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  response: (request: Request) => Promise<Response>;
}

// ========================================
// 禁止パターン例（参考用）
// ========================================

/**
 * ❌ 禁止: 分散型定義
 * 以下のパターンは使用禁止
 */

// interface OldRoutine {  // ❌ @/types/routine からの独自定義
//   id: string;
//   name: string;
//   // スキーマと不一致の可能性
// }

// const mockData = data || {  // ❌ エラー時Mock返却
//   id: 'mock-id',
//   name: 'Mock Routine'
// };

// import { getRoutines } from '@/lib/db/queries/routines';  // ❌ Page ComponentでDB直接アクセス

// @ts-ignore  // ❌ 完全禁止
// const value = something as any;

/**
 * ✅ 推奨: Schema-based統一型定義
 * 上記で定義されたパターンを使用
 */

export default {};