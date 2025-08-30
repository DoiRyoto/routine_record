// ==============================================
// Routine Record TypeScript インターフェース設計
// ==============================================
// 設計日時: 2025年8月29日
// 設計根拠: 要件定義書に基づく技術設計

// ==============================================
// ENUM TYPES (Database Schema)
// ==============================================

export type UserStatus = 'active' | 'inactive' | 'suspended';
export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'ja' | 'en';
export type TimeFormat = '12h' | '24h';
export type GoalType = 'frequency_based' | 'schedule_based';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type MonthlyType = 'day_of_month' | 'day_of_week';

// ゲーミフィケーション関連 ENUM
export type MissionType = 'streak' | 'count' | 'variety' | 'consistency';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ChallengeType = 'weekly' | 'monthly' | 'seasonal' | 'special';
export type NotificationType = 
  | 'level_up' 
  | 'badge_unlocked' 
  | 'mission_completed' 
  | 'challenge_completed' 
  | 'streak_milestone' 
  | 'xp_milestone';
export type XPSourceType = 
  | 'routine_completion' 
  | 'streak_bonus' 
  | 'mission_completion' 
  | 'challenge_completion' 
  | 'daily_bonus' 
  | 'achievement_unlock';

// ==============================================
// CORE DOMAIN ENTITIES
// ==============================================

/**
 * ユーザーエンティティ
 * 要件: REQ-001 (ユーザー認証)
 */
export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  timezone: string;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ルーチンエンティティ
 * 要件: REQ-002 (ルーチン作成), REQ-101 (頻度ベース検証)
 */
export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: string;
  goalType: GoalType;
  recurrenceType: RecurrenceType;
  
  // 頻度ベース設定（REQ-101での必須チェック対象）
  targetCount?: number | null;
  targetPeriod?: string | null;
  
  // 繰り返し設定
  recurrenceInterval: number;
  monthlyType?: MonthlyType | null;
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeek?: number | null;
  daysOfWeek?: string | null; // JSON文字列 [1,3,5]
  
  startDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null; // ソフトデリート
}

/**
 * 実行記録エンティティ
 * 要件: REQ-003 (実行記録)
 */
export interface ExecutionRecord {
  id: string;
  routineId: string;
  userId: string;
  executedAt: Date;
  duration?: number | null; // 分単位
  memo?: string | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * カテゴリエンティティ
 * 要件: REQ-009 (カテゴリ管理)
 */
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // Tailwind CSSクラス
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ユーザー設定エンティティ
 * 要件: REQ-010 (設定管理)
 */
export interface UserSetting {
  id: string;
  userId: string;
  theme: Theme;
  language: Language;
  timeFormat: TimeFormat;
  createdAt: Date;
  updatedAt: Date;
}

// ==============================================
// GAMIFICATION ENTITIES
// ==============================================

/**
 * ユーザープロフィールエンティティ
 * 要件: REQ-004 (XP・レベルシステム), REQ-008 (ユーザープロフィール)
 */
export interface UserProfile {
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number; // 現在レベル内でのXP
  nextLevelXP: number; // 次レベルまでのXP
  streak: number; // 現在のストリーク
  longestStreak: number; // 最長ストリーク
  totalRoutines: number; // 作成したルーチン数
  totalExecutions: number; // 総実行回数
  joinedAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ミッションエンティティ
 * 要件: REQ-006 (ミッションシステム)
 */
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  targetValue: number;
  xpReward: number;
  badgeId?: string | null;
  difficulty: MissionDifficulty;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ユーザーミッション進捗エンティティ
 * 要件: REQ-006 (ミッションシステム)
 */
export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date | null;
  claimedAt?: Date | null; // 報酬受け取り日時
  createdAt: Date;
  updatedAt: Date;
}

/**
 * バッジエンティティ
 * 要件: REQ-005 (バッジシステム)
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  rarity: BadgeRarity;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ユーザーバッジエンティティ
 * 要件: REQ-005 (バッジシステム)
 */
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  isNew: boolean; // 新着フラグ
  createdAt: Date;
}

/**
 * チャレンジエンティティ
 * 要件: REQ-007 (チャレンジシステム)
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: ChallengeType;
  participants: number; // 参加者数
  maxParticipants?: number | null; // 最大参加者数
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ユーザーチャレンジ参加エンティティ
 * 要件: REQ-007 (チャレンジシステム)
 */
export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  rank?: number | null; // 順位
  createdAt: Date;
  updatedAt: Date;
}

/**
 * XP取引履歴エンティティ
 * 要件: REQ-004 (XP・レベルシステム), REQ-103 (XP獲得時の通知)
 */
export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string; // '朝の運動を完了', 'レベル2達成'など
  sourceType: XPSourceType;
  sourceId?: string | null; // 関連するroutineId, missionIdなど
  createdAt: Date;
}

/**
 * ゲーム通知エンティティ
 * 要件: REQ-103 (XP獲得時の通知), REQ-104 (レベルアップ時の特別通知)
 */
export interface GameNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string | null; // JSON文字列（レベル、XP、バッジIDなど）
  isRead: boolean;
  createdAt: Date;
}

/**
 * キャッチアッププランエンティティ
 * 要件: REQ-301 (挽回プランの提案)
 */
export interface CatchupPlan {
  id: string;
  routineId: string;
  userId: string;
  targetPeriodStart: Date;
  targetPeriodEnd: Date;
  originalTarget: number;
  currentProgress: number;
  remainingTarget: number;
  suggestedDailyTarget: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==============================================
// API REQUEST/RESPONSE TYPES
// ==============================================

/**
 * 共通APIレスポンス型
 * 要件: 統一的なAPIレスポンス形式
 */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface APIErrorResponse {
  success: false;
  error: string;
  data?: never;
}

export interface APISuccessResponse<T> {
  success: true;
  data: T;
  error?: never;
  message?: string;
}

export type TypedAPIResponse<T> = APISuccessResponse<T> | APIErrorResponse;

// ==============================================
// REQUEST TYPES
// ==============================================

/**
 * ルーチン作成リクエスト
 * 要件: REQ-002 (ルーチン作成), REQ-101 (頻度ベース検証)
 */
export interface RoutineCreateRequest {
  name: string;
  description?: string | null;
  category: string;
  goalType: GoalType;
  targetCount?: number | null; // 頻度ベース時必須（REQ-101）
  targetPeriod?: string | null; // 頻度ベース時必須（REQ-101）
  recurrenceType: RecurrenceType;
  recurrenceInterval?: number;
  monthlyType?: MonthlyType | null;
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeek?: number | null;
  daysOfWeek?: string | null;
  startDate?: Date | string | null;
  isActive?: boolean;
}

export interface RoutineUpdateRequest extends Partial<RoutineCreateRequest> {
  updatedAt?: Date;
}

/**
 * 実行記録作成リクエスト
 * 要件: REQ-003 (実行記録)
 */
export interface ExecutionRecordCreateRequest {
  routineId: string;
  executedAt?: string | Date;
  duration?: number | null;
  memo?: string | null;
  isCompleted?: boolean;
}

export interface ExecutionRecordUpdateRequest extends Partial<ExecutionRecordCreateRequest> {
  updatedAt?: Date;
}

/**
 * ユーザー設定更新リクエスト
 * 要件: REQ-010 (設定管理)
 */
export interface UserSettingsUpdateRequest {
  theme?: Theme;
  language?: Language;
  timeFormat?: TimeFormat;
}

export interface CategoryCreateRequest {
  name: string;
  color?: string;
  isDefault?: boolean;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {
  isActive?: boolean;
}

/**
 * ミッション作成リクエスト（管理者用）
 * 要件: REQ-006 (ミッションシステム)
 */
export interface MissionCreateRequest {
  action: 'create';
  title: string;
  description: string;
  type: MissionType;
  targetValue: number;
  xpReward?: number;
  badgeId?: string;
  difficulty?: MissionDifficulty;
}

// ==============================================
// RESPONSE TYPES
// ==============================================

export type RoutinesGetResponse = TypedAPIResponse<Routine[]>;
export type RoutinePostResponse = TypedAPIResponse<Routine>;
export type RoutineGetResponse = TypedAPIResponse<Routine>;
export type RoutineUpdateResponse = TypedAPIResponse<Routine>;
export type RoutineDeleteResponse = TypedAPIResponse<{ message: string }>;

export type ExecutionRecordsGetResponse = TypedAPIResponse<ExecutionRecord[]>;
export type ExecutionRecordPostResponse = TypedAPIResponse<ExecutionRecord>;
export type ExecutionRecordGetResponse = TypedAPIResponse<ExecutionRecord>;
export type ExecutionRecordUpdateResponse = TypedAPIResponse<ExecutionRecord>;
export type ExecutionRecordDeleteResponse = TypedAPIResponse<{ message: string }>;

export type CategoriesGetResponse = TypedAPIResponse<Category[]>;
export type CategoryPostResponse = TypedAPIResponse<Category>;
export type CategoryGetResponse = TypedAPIResponse<Category>;
export type CategoryUpdateResponse = TypedAPIResponse<Category>;
export type CategoryDeleteResponse = TypedAPIResponse<{ message: string }>;

export type UserSettingsGetResponse = TypedAPIResponse<UserSetting>;
export type UserSettingsUpdateResponse = TypedAPIResponse<UserSetting>;

export type UserProfileGetResponse = TypedAPIResponse<UserProfile>;

export type MissionsGetResponse = TypedAPIResponse<Mission[]>;
export type MissionPostResponse = TypedAPIResponse<Mission>;
export type UserMissionsGetResponse = TypedAPIResponse<UserMission[]>;

export type ChallengesGetResponse = TypedAPIResponse<Challenge[]>;
export type ChallengeGetResponse = TypedAPIResponse<Challenge>;
export type UserChallengesGetResponse = TypedAPIResponse<UserChallenge[]>;

export type BadgesGetResponse = TypedAPIResponse<Badge[]>;
export type UserBadgesGetResponse = TypedAPIResponse<UserBadge[]>;

export type XPTransactionsGetResponse = TypedAPIResponse<XPTransaction[]>;
export type GameNotificationsGetResponse = TypedAPIResponse<GameNotification[]>;

export type CatchupPlansGetResponse = TypedAPIResponse<CatchupPlan[]>;

// ==============================================
// DOMAIN VALUE OBJECTS
// ==============================================

/**
 * ドメイン値オブジェクトインターフェース
 * Clean Architectureの値オブジェクト実装用
 */
export interface RoutineIdValueObject {
  getValue(): string;
  equals(other: RoutineIdValueObject): boolean;
  toString(): string;
}

export interface UserIdValueObject {
  getValue(): string;
  equals(other: UserIdValueObject): boolean;
  toString(): string;
}

export interface ExecutionRecordIdValueObject {
  getValue(): string;
  equals(other: ExecutionRecordIdValueObject): boolean;
  toString(): string;
}

export interface GoalTypeValueObject {
  getValue(): string;
  isFrequencyBased(): boolean;
  isScheduleBased(): boolean;
}

export interface RecurrenceTypeValueObject {
  getValue(): string;
  isDaily(): boolean;
  isWeekly(): boolean;
  isMonthly(): boolean;
  isCustom(): boolean;
}

// ==============================================
// DTO TYPES (Use Case Layer)
// ==============================================

/**
 * Use Caseレイヤー用DTO（Data Transfer Objects）
 * アプリケーション層とドメイン層の境界での型安全なデータ転送
 */
export interface CreateRoutineDto {
  name: string;
  description?: string | null;
  category: string;
  goalType: string;
  recurrenceType: string;
  targetCount?: number | null;
  targetPeriod?: string | null;
  recurrenceInterval?: number;
  userId: string;
}

export interface UpdateRoutineDto {
  name?: string;
  description?: string | null;
  category?: string;
  goalType?: string;
  recurrenceType?: string;
  targetCount?: number | null;
  targetPeriod?: string | null;
  recurrenceInterval?: number;
}

export interface CreateExecutionRecordDto {
  routineId: string;
  userId: string;
  executedAt?: Date;
  duration?: number | null;
  memo?: string | null;
  isCompleted?: boolean;
}

// ==============================================
// UI COMPONENT PROPS TYPES
// ==============================================

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export interface SignUpFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export interface RoutineFormProps {
  routine?: Routine | null;
  onSubmit: (data: RoutineCreateRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export interface RoutineListProps {
  routines: Routine[];
  onEdit?: (routine: Routine) => void;
  onDelete?: (routineId: string) => void;
  onExecute?: (routineId: string) => void;
  loading?: boolean;
}

export interface DashboardProps {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
  userProfile?: UserProfile;
}

export interface CalendarProps {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

// ==============================================
// GAMIFICATION UI PROPS
// ==============================================

/**
 * ゲーミフィケーション機能のUIコンポーネントProps
 * 要件: REQ-004, REQ-005, REQ-006, REQ-007 対応
 */
export interface UserAvatarProps {
  userProfile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  showXP?: boolean;
}

export interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  size?: 'sm' | 'md' | 'lg';
  showNumbers?: boolean;
}

export interface ExperiencePointsProps {
  value: number;
  variant?: 'inline' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface StreakDisplayProps {
  streakData: {
    current: number;
    longest: number;
    freezeCount?: number;
    lastActiveDate?: Date;
  };
  variant?: 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
}

export interface BadgeCollectionProps {
  badges: UserBadge[];
  allBadges: Badge[];
  showLocked?: boolean;
  layout?: 'grid' | 'list';
}

export interface ChallengeItemProps {
  challenge: Challenge;
  userProgress?: UserChallenge;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
}

export interface TaskCardProps {
  mission: Mission;
  userProgress?: UserMission;
  onClaim?: (missionId: string) => void;
  showProgress?: boolean;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  className?: string;
}

export interface LeaderboardProps {
  users: Array<{
    userId: string;
    displayName?: string | null;
    level: number;
    totalXP: number;
    rank: number;
  }>;
  currentUserId?: string;
  showCurrentUser?: boolean;
}

// ==============================================
// CONTEXT TYPES (State Management)
// ==============================================

/**
 * React Context型定義
 * 要件: アプリケーション状態管理
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

export interface ThemeContextType {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface SnackbarContextType {
  showSnackbar: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideSnackbar: () => void;
}

// ==============================================
// UTILITY TYPES
// ==============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  startDate?: Date | string;
  endDate?: Date | string;
  category?: string;
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeZoneInfo {
  timezone: string;
  offset: number;
  label: string;
}

// ==============================================
// ERROR TYPES
// ==============================================

/**
 * ドメインエラー型
 * 要件: REQ-402 (入力検証), エラーハンドリング設計
 */
export interface DomainError {
  name: string;
  message: string;
  code?: string;
}

export interface ValidationError extends DomainError {
  field: string;
  value: any;
  constraints: string[];
}

export interface BusinessRuleViolationError extends DomainError {
  rule: string;
  context: Record<string, any>;
}

export interface NetworkError extends DomainError {
  status?: number;
  statusText?: string;
}

// ==============================================
// RESULT TYPES (Use Case Pattern)
// ==============================================

/**
 * Use Caseの結果型（Result Pattern）
 * 要件: エラーハンドリングの統一
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
  error?: never;
}

export interface Failure<E> {
  success: false;
  error: E;
  data?: never;
}

// ==============================================
// EXTENDED TYPES (with Relations)
// ==============================================

/**
 * リレーション付き拡張型
 * 複雑な画面表示用の結合データ型
 */
export interface RoutineWithExecutions extends Routine {
  executions?: ExecutionRecord[];
  todayExecution?: ExecutionRecord | null;
  completionRate?: number;
}

export interface UserWithProfile extends User {
  profile?: UserProfile;
  settings?: UserSetting;
}

export interface MissionWithProgress extends Mission {
  userProgress?: UserMission;
  badge?: Badge;
}

export interface ChallengeWithDetails extends Challenge {
  requirements?: any[]; // 将来の拡張用
  rewards?: any[]; // 将来の拡張用
  userParticipation?: UserChallenge;
}

export interface UserSettingWithTimezone extends UserSetting {
  timezoneInfo?: TimeZoneInfo;
}

export interface ExecutionRecordWithRoutine extends ExecutionRecord {
  routine?: Routine;
}

// ==============================================
// STATISTICS TYPES
// ==============================================

/**
 * 統計・分析データ型
 * 要件: REQ-201の統計機能対応
 */
export interface RoutineStatistics {
  totalRoutines: number;
  activeRoutines: number;
  completedToday: number;
  completionRate: number;
  averageDuration: number;
  longestStreak: number;
  currentStreak: number;
}

export interface UserStatistics {
  profile: UserProfile;
  routineStats: RoutineStatistics;
  weeklyProgress: number[];
  monthlyProgress: number[];
  categoryDistribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  recentAchievements: UserBadge[];
}

export interface GameificationStats {
  totalXP: number;
  level: number;
  nextLevelXP: number;
  completedMissions: number;
  activeMissions: number;
  unlockedBadges: number;
  totalBadges: number;
  challengesWon: number;
  currentStreak: number;
  longestStreak: number;
}

// ==============================================
// CONFIGURATION TYPES
// ==============================================

export interface AppConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    gamification: boolean;
    challenges: boolean;
    socialFeatures: boolean;
    notifications: boolean;
  };
}

export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  idleTimeout?: number;
  ssl?: boolean;
}

// ==============================================
// TYPE GUARDS (Runtime Type Checking)
// ==============================================

/**
 * 型ガード関数の型定義
 * ランタイムでの型安全性保証
 */
export function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}

export function isRoutine(obj: any): obj is Routine {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

export function isAPISuccessResponse<T>(response: APIResponse<T>): response is APISuccessResponse<T> {
  return response.success === true;
}

export function isAPIErrorResponse(response: APIResponse<any>): response is APIErrorResponse {
  return response.success === false;
}

// ==============================================
// MAIN EXPORTS
// ==============================================
// All types are already declared above and available for import