import { getCurrentUser } from '@/lib/auth';
import { getUserProfile, createUserProfile } from '@/lib/db/queries/user-profiles';
import { autoCreateUserProfileIfNeeded } from '@/lib/services/auto-profile-creation';

// MockModules
jest.mock('@/lib/auth');
jest.mock('@/lib/db/queries/user-profiles');

const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockCreateUserProfile = createUserProfile as jest.MockedFunction<typeof createUserProfile>;

describe('プロフィール自動作成機能', () => {
  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にMock状態をリセットし、一貫したテスト条件を保証
    // 【環境初期化】: 前のテストの影響を受けないよう、Mockの状態をクリーンにリセット
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 【テスト後処理】: テスト実行後にMock状態をクリーンアップ
    // 【状態復元】: 次のテストに影響しないよう、システムを元の状態に戻す
    jest.resetAllMocks();
  });

  test('新規ユーザーのプロフィール自動作成', async () => {
    // 【テスト目的】: 初回ログイン時にプロフィールが存在しない場合、自動でデフォルトプロフィールが作成されることを確認
    // 【テスト内容】: 認証済みユーザーでプロフィール未作成の状態から、自動プロフィール作成処理を実行
    // 【期待される動作】: 新規ユーザーがエラー状態に陥らず、デフォルトプロフィールが正常に作成される
    // 🔴 信頼性レベル: P0課題解決のための推測ベーステストケース

    // 【テストデータ準備】: P0課題「プロフィール自動作成機能未実装」を解決するため新規ユーザー状態を準備
    // 【初期条件設定】: 認証済みだがプロフィール未作成のユーザー状態
    const mockUser = {
      id: 'test-user-123',
      email: 'test@example.com'
    };
    
    const expectedProfile = {
      userId: mockUser.id,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      nextLevelXP: 100,
      streak: 0,
      longestStreak: 0,
      totalRoutines: 0,
      totalExecutions: 0,
      joinedAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(null); // プロフィール未作成状態
    mockCreateUserProfile.mockResolvedValue(expectedProfile);

    // 【実際の処理実行】: プロフィール自動作成サービスの呼び出し
    // 【処理内容】: 未実装の autoCreateUserProfileIfNeeded 関数を呼び出し、自動作成処理を実行
    const result = await autoCreateUserProfileIfNeeded(mockUser.id);

    // 【結果検証】: プロフィール自動作成の成功と適切なデフォルト値の設定を確認
    // 【期待値確認】: P0課題解決によりエラー状態を回避し、基本的な機能使用が可能になる
    expect(result.success).toBe(true); // 【確認内容】: 自動作成処理が成功することを確認 🔴
    expect(result.created).toBe(true); // 【確認内容】: 新規プロフィールが作成されたことを確認 🔴
    expect(result.profile?.userId).toBe(mockUser.id); // 【確認内容】: 作成されたプロフィールのユーザーIDが正しいことを確認 🔴
    expect(result.profile?.level).toBe(1); // 【確認内容】: デフォルトレベルが1に設定されることを確認 🟡
    expect(result.profile?.totalXP).toBe(0); // 【確認内容】: 初期XPが0に設定されることを確認 🟡
    expect(result.profile?.streak).toBe(0); // 【確認内容】: 初期ストリークが0に設定されることを確認 🟡
  });

  test('既存プロフィールがある場合は作成をスキップ', async () => {
    // 【テスト目的】: 既にプロフィールが存在するユーザーでは自動作成処理をスキップすることを確認
    // 【テスト内容】: 認証済みユーザーでプロフィール既存の状態から、自動プロフィール作成処理を実行
    // 【期待される動作】: 既存プロフィールを変更せず、作成処理をスキップして既存データを返却
    // 🟡 信頼性レベル: 一般的な動作パターンから妥当な推測

    // 【テストデータ準備】: 既存プロフィールを持つユーザーの状態を準備
    // 【初期条件設定】: 認証済みでプロフィール作成済みのユーザー状態
    const mockUser = {
      id: 'existing-user-456',
      email: 'existing@example.com'
    };
    
    const existingProfile = {
      userId: mockUser.id,
      level: 5,
      totalXP: 500,
      currentXP: 50,
      nextLevelXP: 100,
      streak: 3,
      longestStreak: 10,
      totalRoutines: 8,
      totalExecutions: 25,
      joinedAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    };

    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockResolvedValue(existingProfile);

    // 【実際の処理実行】: プロフィール自動作成サービスの呼び出し
    // 【処理内容】: 既存プロフィールが存在する場合の autoCreateUserProfileIfNeeded 関数の動作確認
    const result = await autoCreateUserProfileIfNeeded(mockUser.id);

    // 【結果検証】: 既存プロフィールが保持され、作成処理がスキップされることを確認
    // 【期待値確認】: 既存データの整合性を維持し、不要な作成処理を回避する
    expect(result.success).toBe(true); // 【確認内容】: 処理が成功することを確認 🟡
    expect(result.created).toBe(false); // 【確認内容】: 新規作成が実行されなかったことを確認 🔴
    expect(result.profile).toEqual(existingProfile); // 【確認内容】: 既存プロフィール情報がそのまま返却されることを確認 🟡
    expect(result.profile?.level).toBe(5); // 【確認内容】: 既存のレベル情報が保持されることを確認 🟡
  });

  test('認証エラー時の適切なエラーハンドリング', async () => {
    // 【テスト目的】: 未認証ユーザーに対して適切なエラーハンドリングが行われることを確認
    // 【テスト内容】: 未認証状態でプロフィール自動作成処理を実行し、セキュリティエラーが発生することを確認
    // 【期待される動作】: 認証エラーを適切に検出し、セキュリティを確保したエラーレスポンスを返却
    // 🟢 信頼性レベル: セキュリティ要件から確実に導出

    // 【テストデータ準備】: 未認証状態を準備しセキュリティ確保を確認
    // 【初期条件設定】: getCurrentUser が null を返す未認証状態
    mockGetCurrentUser.mockResolvedValue(null);

    // 【実際の処理実行】: 未認証状態でのプロフィール自動作成サービス呼び出し
    // 【処理内容】: 未認証ユーザーでの autoCreateUserProfileIfNeeded 関数の呼び出し
    const result = await autoCreateUserProfileIfNeeded('invalid-user-id');

    // 【結果検証】: 認証エラーが適切に処理され、セキュリティが確保されることを確認
    // 【期待値確認】: 不正アクセスを防止し、システムの整合性を維持する
    expect(result.success).toBe(false); // 【確認内容】: 処理が失敗することを確認 🟢
    expect(result.error).toBe('認証が必要です'); // 【確認内容】: 適切な認証エラーメッセージが返却されることを確認 🔴
    expect(result.created).toBe(false); // 【確認内容】: プロフィール作成が実行されないことを確認 🟡
    expect(result.profile).toBeNull(); // 【確認内容】: プロフィールデータが返却されないことを確認 🟡
  });

  test('データベースエラー時の適切なエラーハンドリング', async () => {
    // 【テスト目的】: データベース接続エラー時に適切なエラーハンドリングが行われることを確認
    // 【テスト内容】: データベースエラーが発生した場合のプロフィール自動作成処理の動作確認
    // 【期待される動作】: データベースエラーを適切にキャッチし、ユーザーフレンドリーなエラーメッセージを返却
    // 🔴 信頼性レベル: エラーハンドリング仕様が未定義で推測ベース

    // 【テストデータ準備】: データベース接続エラーが発生する状況を準備
    // 【初期条件設定】: 認証済みだがデータベースエラーが発生する状態
    const mockUser = {
      id: 'test-user-db-error',
      email: 'dberror@example.com'
    };
    
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockGetUserProfile.mockRejectedValue(new Error('Database connection failed'));

    // 【実際の処理実行】: データベースエラーが発生する状況でのプロフィール自動作成サービス呼び出し
    // 【処理内容】: データベース接続エラー時の autoCreateUserProfileIfNeeded 関数の動作確認
    const result = await autoCreateUserProfileIfNeeded(mockUser.id);

    // 【結果検証】: データベースエラーが適切にハンドリングされ、システム安定性が保たれることを確認
    // 【期待値確認】: エラー時でもシステムが安全な状態を保ち、適切なフィードバックが提供される
    expect(result.success).toBe(false); // 【確認内容】: 処理が失敗することを確認 🟡
    expect(result.error).toContain('プロフィールの取得または作成に失敗しました'); // 【確認内容】: 適切なエラーメッセージが含まれることを確認 🔴
    expect(result.created).toBe(false); // 【確認内容】: プロフィール作成が実行されないことを確認 🟡
    expect(result.profile).toBeNull(); // 【確認内容】: エラー時にプロフィールデータが返却されないことを確認 🟡
  });
});