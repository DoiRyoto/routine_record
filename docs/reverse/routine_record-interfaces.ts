// ======================
// ルーチンレコード 型定義集約（逆生成）
// ======================
// 分析日時: 2025年8月28日 JST
// 生成元: /Users/doi-ryoto/Desktop/Programming/routine_record

// ======================
// DATABASE SCHEMA TYPES (Drizzle ORM Generated)
// ======================

export type UserStatus = 'active' | 'inactive' | 'suspended';
export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'ja' | 'en';
export type TimeFormat = '12h' | '24h';
export type GoalType = 'frequency_based' | 'schedule_based';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type MonthlyType = 'day_of_month' | 'day_of_week';

// ゲーミフィケーション関連
export type MissionType = 'streak' | 'count' | 'variety' | 'consistency';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ChallengeType = 'weekly' | 'monthly' | 'seasonal' | 'special';
export type NotificationType = 'level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone';
export type XPSourceType = 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock';

// ======================
// CORE ENTITY INTERFACES
// ======================

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

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category: string;
  goalType: GoalType;
  recurrenceType: RecurrenceType;
  targetCount?: number | null;
  targetPeriod?: string | null;
  recurrenceInterval: number;
  monthlyType?: MonthlyType | null;
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeek?: number | null;
  daysOfWeek?: string | null;
  startDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

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

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // Tailwind CSS classes
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSetting {
  id: string;
  userId: string;
  theme: Theme;
  language: Language;
  timeFormat: TimeFormat;
  createdAt: Date;
  updatedAt: Date;
}

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

// ======================
// GAMIFICATION ENTITIES
// ======================

export interface UserProfile {
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
  longestStreak: number;
  totalRoutines: number;
  totalExecutions: number;
  joinedAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date | null;
  claimedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  isNew: boolean;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: ChallengeType;
  participants: number;
  maxParticipants?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeRequirement {
  id: string;
  challengeId: string;
  type: string;
  value: number;
  description: string;
  createdAt: Date;
}

export interface ChallengeReward {
  id: string;
  challengeId: string;
  name: string;
  description: string;
  badgeId?: string | null;
  xpAmount?: number | null;
  requirement: string;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  rank?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceType: XPSourceType;
  sourceId?: string | null;
  createdAt: Date;
}

export interface GameNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string | null; // JSON文字列
  isRead: boolean;
  createdAt: Date;
}

// ======================
// API REQUEST/RESPONSE TYPES
// ======================

// 共通APIレスポンス型
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

// ======================
// API REQUEST TYPES
// ======================

export interface RoutineCreateRequest {
  name: string;
  description?: string | null;
  category: string;
  goalType: GoalType;
  targetCount?: number | null;
  targetPeriod?: string | null;
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

// ======================
// API RESPONSE TYPES
// ======================

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

// ======================
// DOMAIN VALUE OBJECTS
// ======================

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

// ======================
// DTO TYPES (Data Transfer Objects)
// ======================

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

// ======================
// UI COMPONENT PROPS TYPES
// ======================

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

// ======================
// GAMIFICATION UI PROPS
// ======================

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

// ======================
// CONTEXT TYPES
// ======================

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

// ======================
// UTILITY TYPES
// ======================

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

// ======================
// CONFIGURATION TYPES
// ======================

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

// ======================
// ERROR TYPES
// ======================

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

// ======================
// RESULT TYPES (For Use Cases)
// ======================

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

// ======================
// EXTENDED TYPES (with relations)
// ======================

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
  requirements?: ChallengeRequirement[];
  rewards?: ChallengeReward[];
  userParticipation?: UserChallenge;
}

export interface UserSettingWithTimezone extends UserSetting {
  timezoneInfo?: TimeZoneInfo;
}

export interface ExecutionRecordWithRoutine extends ExecutionRecord {
  routine?: Routine;
}

// ======================
// STATISTICS TYPES
// ======================

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

// ======================
// MAIN EXPORTS
// ======================
// All types are already declared above and available for import