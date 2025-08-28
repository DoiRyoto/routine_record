/**
 * Mission Card & Today View TypeScript インターフェース定義
 * 
 * 既存のDB schema型を拡張し、コンポーネント固有の型を定義
 */

// === 基本的な型定義 ===

/**
 * ミッション実行状態
 */
export type MissionStatus = 'pending' | 'active' | 'completed' | 'overdue' | 'cancelled';

/**
 * 時間帯情報
 */
export interface TimeSlot {
  /** 開始時刻 (ISO 8601 format) */
  startTime: string;
  /** 終了時刻 (ISO 8601 format) */
  endTime: string;
  /** 継続時間（分） */
  duration: number;
  /** 現在の時刻がこの時間帯に含まれているか */
  isActive: boolean;
  /** 時間帯が過去のものか */
  isPast: boolean;
  /** 時間帯が未来のものか */
  isFuture: boolean;
}

/**
 * フォーマット済み時間表示
 */
export interface FormattedTimeSlot {
  /** 表示用開始時刻 ("3:00 PM", "15:00") */
  startTime: string;
  /** 表示用終了時刻 ("3:30 PM", "15:30") */
  endTime: string;
  /** 表示用継続時間 ("30 Min", "2時間30分") */
  duration: string;
  /** 時刻フォーマット */
  format: '12h' | '24h';
}

/**
 * 進捗情報
 */
export interface ProgressData {
  /** 現在の進捗値 */
  current: number;
  /** 目標値 */
  target: number;
  /** パーセンテージ (0-100) */
  percentage: number;
  /** 進捗状態 */
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
}

/**
 * 参加者表示情報
 */
export interface ParticipantDisplay {
  /** ユーザーID */
  id: string;
  /** 表示名 */
  displayName: string;
  /** アバターURL */
  avatarUrl?: string;
  /** 表示順序 */
  order: number;
  /** 表示するかどうか（最大3名まで表示、残りは数字） */
  visible: boolean;
}

/**
 * カテゴリ表示情報
 */
export interface CategoryDisplay {
  /** カテゴリID */
  id: string;
  /** カテゴリ名 */
  name: string;
  /** 背景色クラス名 (Tailwind) */
  backgroundColor: string;
  /** テキスト色クラス名 (Tailwind) */
  textColor: string;
  /** アイコンまたは絵文字 */
  icon?: string;
}

// === 拡張エンティティ型 ===

/**
 * 詳細情報付きミッション
 * 既存のMission型にUI表示用の情報を追加
 */
export interface MissionWithDetails {
  // 基本ミッション情報（既存スキーマから）
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  targetCount?: number;
  targetPeriod?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;

  // 関連エンティティ
  /** ユーザーミッション情報 */
  userMission?: UserMissionExtended;
  /** カテゴリ情報 */
  categoryInfo: CategoryDisplay;
  /** 参加者情報 */
  participants: ParticipantDisplay[];

  // 計算済み情報
  /** 時間帯情報 */
  timeSlot?: TimeSlot;
  /** 進捗情報 */
  progress: ProgressData;
  /** ミッション状態 */
  status: MissionStatus;
  /** 今日実行予定かどうか */
  isScheduledToday: boolean;
}

/**
 * ユーザーミッション拡張
 */
export interface UserMissionExtended {
  // 基本ユーザーミッション情報（既存スキーマから）
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // 拡張情報
  /** 今日の実行記録 */
  todayExecutionRecords: ExecutionRecordSummary[];
  /** 継続日数 */
  streakDays: number;
  /** 今週の実行回数 */
  weeklyExecutionCount: number;
}

/**
 * 実行記録サマリー
 */
export interface ExecutionRecordSummary {
  id: string;
  executedAt: Date;
  duration?: number;
  isCompleted: boolean;
  memo?: string;
}

// === コンポーネントProps型 ===

/**
 * MissionCard コンポーネントのProps
 */
export interface MissionCardProps {
  /** ミッション詳細情報 */
  mission: MissionWithDetails;
  /** 時間表示設定 */
  timeSlot?: TimeSlot;
  /** サイズバリアント */
  size?: 'compact' | 'default' | 'expanded';
  /** カードの表示モード */
  mode?: 'today' | 'calendar' | 'archive';
  /** アクションハンドラー */
  onComplete?: (missionId: string) => void | Promise<void>;
  /** 開始ハンドラー */
  onStart?: (missionId: string) => void | Promise<void>;
  /** 編集ハンドラー */
  onEdit?: (missionId: string) => void;
  /** 削除ハンドラー */
  onDelete?: (missionId: string) => void | Promise<void>;
  /** カスタムスタイル */
  className?: string;
  /** テスト用ID */
  'data-testid'?: string;
  /** アクセシビリティ設定 */
  'aria-label'?: string;
}

/**
 * TodayView コンポーネントのProps
 */
export interface TodayViewProps {
  /** 今日のミッション一覧 */
  missions: MissionWithDetails[];
  /** 現在日時 */
  currentTime: Date;
  /** 選択された日付 */
  selectedDate: Date;
  /** タイムゾーン設定 */
  timezones?: {
    primary: string;
    secondary?: string;
  };
  /** ユーザー設定 */
  userSettings: {
    timeFormat: '12h' | '24h';
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
  };
  /** ローディング状態 */
  isLoading?: boolean;
  /** エラー状態 */
  error?: Error;
  /** アクションハンドラー */
  onMissionAction?: (action: MissionAction, missionId: string) => void | Promise<void>;
  /** 日付変更ハンドラー */
  onDateChange?: (date: Date) => void;
  /** 更新ハンドラー */
  onRefresh?: () => void | Promise<void>;
  /** カスタムスタイル */
  className?: string;
}

/**
 * TimeSlot コンポーネントのProps
 */
export interface TimeSlotProps {
  /** 時間帯情報 */
  timeSlot: TimeSlot;
  /** フォーマット設定 */
  format: '12h' | '24h';
  /** 表示サイズ */
  size?: 'small' | 'medium' | 'large';
  /** 現在時刻の強調表示 */
  highlightCurrent?: boolean;
  /** カスタムスタイル */
  className?: string;
}

/**
 * ParticipantAvatars コンポーネントのProps
 */
export interface ParticipantAvatarsProps {
  /** 参加者一覧 */
  participants: ParticipantDisplay[];
  /** 最大表示数 */
  maxVisible?: number;
  /** アバターサイズ */
  size?: 'small' | 'medium' | 'large';
  /** 重ね合わせスタイル */
  overlap?: boolean;
  /** 残り人数の表示 */
  showRemaining?: boolean;
  /** クリックハンドラー */
  onClick?: (participantId: string) => void;
  /** カスタムスタイル */
  className?: string;
}

/**
 * TimeHeader コンポーネントのProps
 */
export interface TimeHeaderProps {
  /** 現在日時 */
  currentTime: Date;
  /** 選択された日付 */
  selectedDate: Date;
  /** タイムゾーン設定 */
  timezones?: {
    primary: string;
    secondary?: string;
  };
  /** 時刻フォーマット */
  timeFormat: '12h' | '24h';
  /** 日付変更ハンドラー */
  onDateChange?: (date: Date) => void;
  /** カスタムスタイル */
  className?: string;
}

// === アクション型定義 ===

/**
 * ミッションに対するアクション
 */
export type MissionAction = 
  | 'start'
  | 'complete' 
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'edit'
  | 'delete'
  | 'duplicate';

/**
 * ミッションアクションの結果
 */
export interface MissionActionResult {
  /** アクションが成功したか */
  success: boolean;
  /** 更新されたミッション情報 */
  updatedMission?: MissionWithDetails;
  /** エラーメッセージ */
  error?: string;
  /** 追加メッセージ */
  message?: string;
}

// === APIリクエスト/レスポンス型 ===

/**
 * 今日のミッション取得リクエスト
 */
export interface GetTodayMissionsRequest {
  /** ユーザーID */
  userId: string;
  /** 対象日（ISO 8601 date） */
  date: string;
  /** タイムゾーン */
  timezone?: string;
}

/**
 * 今日のミッション取得レスポンス
 */
export interface GetTodayMissionsResponse {
  /** 成功フラグ */
  success: boolean;
  /** ミッション一覧 */
  data?: MissionWithDetails[];
  /** エラー情報 */
  error?: {
    code: string;
    message: string;
  };
  /** メタデータ */
  meta?: {
    totalCount: number;
    completedCount: number;
    pendingCount: number;
    overdueCount: number;
  };
}

/**
 * ミッション更新リクエスト
 */
export interface UpdateMissionStatusRequest {
  /** ミッションID */
  missionId: string;
  /** ユーザーID */
  userId: string;
  /** アクションタイプ */
  action: MissionAction;
  /** 実行日時 */
  executedAt?: string;
  /** 継続時間（分） */
  duration?: number;
  /** メモ */
  memo?: string;
}

/**
 * ミッション更新レスポンス
 */
export interface UpdateMissionStatusResponse {
  /** 成功フラグ */
  success: boolean;
  /** 更新されたミッション */
  data?: MissionWithDetails;
  /** エラー情報 */
  error?: {
    code: string;
    message: string;
  };
  /** XP獲得情報（ゲーミフィケーション） */
  xpGained?: {
    amount: number;
    source: string;
    levelUp?: boolean;
  };
}

/**
 * ミッション進捗取得リクエスト
 */
export interface GetMissionProgressRequest {
  /** ユーザーID */
  userId: string;
  /** ミッションID */
  missionId: string;
  /** 対象期間 */
  period?: 'today' | 'week' | 'month' | 'all';
  /** 履歴を含むかどうか */
  includeHistory?: boolean;
}

/**
 * ミッション進捗レスポンス
 */
export interface MissionProgressResponse {
  /** ミッション詳細 */
  mission: MissionWithDetails;
  /** 進捗情報 */
  progress: {
    current: number;
    target: number;
    percentage: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  };
  /** 実行履歴 */
  history: ExecutionRecordSummary[];
  /** 継続記録 */
  streak: {
    current: number;
    longest: number;
    isActive: boolean;
  };
  /** 分析データ */
  analytics?: {
    averageDuration: number;
    completionRate: number;
    bestTimeSlot: string;
  };
}

// === ユーティリティ型 ===

/**
 * コンポーネントの共通Props
 */
export interface CommonComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

/**
 * 非同期状態管理
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * ページネーション
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * フィルター条件
 */
export interface MissionFilter {
  status?: MissionStatus[];
  categories?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchQuery?: string;
}

/**
 * ソート条件
 */
export interface MissionSort {
  field: 'name' | 'createdAt' | 'startTime' | 'priority';
  order: 'asc' | 'desc';
}

// === Storybook用型定義 ===

/**
 * Storybookでのコンポーネントテスト用
 */
export interface StoryBookProps<T> {
  /** コンポーネントのProps */
  args: T;
  /** ストーリーのバリアント名 */
  name: string;
  /** 説明 */
  description?: string;
  /** テスト用のモックデータ */
  mockData?: any;
}

// === 設定・環境型 ===

/**
 * アプリケーション設定
 */
export interface AppConfig {
  /** APIのベースURL */
  apiBaseUrl: string;
  /** デバッグモード */
  debug: boolean;
  /** ゲーミフィケーション機能の有効/無効 */
  gamificationEnabled: boolean;
  /** アナリティクス設定 */
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
  /** 通知設定 */
  notifications: {
    enabled: boolean;
    types: string[];
  };
}

/**
 * テーマ設定
 */
export interface ThemeConfig {
  /** カラーパレット */
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    background: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  /** フォント設定 */
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  /** レスポンシブブレークポイント */
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}