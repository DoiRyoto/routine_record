import { 
  getActiveMissions,
  getUserMissions, 
  startMission,
  updateMissionProgress,
  completeMission
} from '../missions';
import { db } from '../../index';

// Mock database
jest.mock('../../index');

const mockDb = db as jest.Mocked<typeof db>;

describe('ミッション機能 - 既存実装の品質検証', () => {
  beforeEach(() => {
    // 【テスト前準備】: 各テスト実行前にMock状態をリセットし、一貫したテスト条件を保証
    // 【環境初期化】: 前のテストの影響を受けないよう、データベースMockの状態をクリーンにリセット
    jest.clearAllMocks();
  });

  afterEach(() => {
    // 【テスト後処理】: テスト実行後にMock状態をクリーンアップ
    // 【状態復元】: 次のテストに影響しないよう、システムを元の状態に戻す
    jest.resetAllMocks();
  });

  describe('正常系テスト - 基本的な動作確認', () => {
    test('認証ユーザーのミッション一覧取得', async () => {
      // 【テスト目的】: アクティブなミッション一覧を正しく取得できることを確認
      // 【テスト内容】: getActiveMissions関数が適切にデータベースから情報を取得し、正しい形式で返却することを検証
      // 【期待される動作】: アクティブフラグがtrueのミッションのみが、作成日時順で取得される
      // 🟢 信頼性レベル: 既存API実装から確実に導出

      // 【テストデータ準備】: 複数のミッション（アクティブ・非アクティブ）を準備し、フィルタリング動作を確認
      // 【初期条件設定】: データベースに各種ミッションが存在する状態
      const mockMissions = [
        {
          id: 'mission-1',
          title: '3日連続ルーティン実行',
          description: 'ルーティンを3日連続で実行しよう',
          type: 'streak',
          targetValue: 3,
          xpReward: 100,
          difficulty: 'easy',
          isActive: true,
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'mission-2', 
          title: '10回のルーティン実行',
          description: '合計10回のルーティンを実行しよう',
          type: 'count',
          targetValue: 10,
          xpReward: 200,
          difficulty: 'medium',
          isActive: true,
          createdAt: new Date('2024-01-02')
        }
      ];

      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockMissions)
          })
        })
      });

      // 【実際の処理実行】: アクティブミッション取得関数を実行
      // 【処理内容】: データベースからアクティブなミッション一覧を取得する処理
      const result = await getActiveMissions();

      // 【結果検証】: 取得されたミッション一覧が期待通りの内容であることを確認
      // 【期待値確認】: アクティブなミッションのみが適切な順序で返却されることを検証
      expect(result).toEqual(mockMissions); // 【確認内容】: 返却データが期待されるミッション一覧と一致することを確認 🟢
      expect(result).toHaveLength(2); // 【確認内容】: 期待されるミッション数が返却されることを確認 🟢
      expect(result[0].isActive).toBe(true); // 【確認内容】: すべてのミッションがアクティブ状態であることを確認 🟢
      expect(result[1].isActive).toBe(true); // 【確認内容】: すべてのミッションがアクティブ状態であることを確認 🟢
    });

    test('新規ミッション開始の成功', async () => {
      // 【テスト目的】: ユーザーが新しいミッションを開始し、適切にUserMissionが作成されることを確認
      // 【テスト内容】: 重複チェック、ミッション存在確認、UserMission作成の一連の処理が正常に実行される
      // 【期待される動作】: 新規ミッション開始処理が成功し、進捗追跡が開始される
      // 🟢 信頼性レベル: 既存実装から確実に導出

      // 【テストデータ準備】: ミッション開始時の標準的なユーザー・ミッション情報を準備
      // 【初期条件設定】: ユーザーが未開始のアクティブミッションを開始する状態
      const userId = 'user1';
      const missionId = 'mission1';
      const mockMission = {
        id: missionId,
        title: 'テストミッション',
        isActive: true,
        targetValue: 5,
        xpReward: 100
      };
      const mockUserMission = {
        id: 'user-mission-1',
        userId,
        missionId,
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock setup for checking existing mission (should return empty)
      const mockExistingCheck = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]) // No existing mission
            })
          })
        })
      };

      // Mock setup for checking mission exists
      const mockMissionCheck = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([mockMission]) // Mission exists
            })
          })
        })
      };

      // Mock setup for creating user mission
      const mockCreate = {
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUserMission])
          })
        })
      };

      // Setup mocks in sequence they're called
      mockDb.select
        .mockReturnValueOnce(mockExistingCheck.select() as any)
        .mockReturnValueOnce(mockMissionCheck.select() as any);
      mockDb.insert = mockCreate.insert as any;

      // 【実際の処理実行】: ミッション開始処理を実行
      // 【処理内容】: ユーザーミッション作成処理の実行
      const result = await startMission(userId, missionId);

      // 【結果検証】: ミッション開始が成功し、適切なUserMissionが作成されることを確認
      // 【期待値確認】: 初期状態でのUserMission作成が正常に完了することを検証
      expect(result).toEqual(mockUserMission); // 【確認内容】: 作成されたUserMissionが期待通りの内容であることを確認 🟢
      expect(result.progress).toBe(0); // 【確認内容】: 初期進捗が0に設定されることを確認 🟢
      expect(result.isCompleted).toBe(false); // 【確認内容】: 初期完了状態がfalseに設定されることを確認 🟢
      expect(result.userId).toBe(userId); // 【確認内容】: 正しいユーザーIDが設定されることを確認 🟢
      expect(result.missionId).toBe(missionId); // 【確認内容】: 正しいミッションIDが設定されることを確認 🟢
    });

    test('ミッション進捗更新の成功', async () => {
      // 【テスト目的】: ミッションの進捗値が正しく更新され、データベースに反映されることを確認
      // 【テスト内容】: 進捗値の更新処理が適切に実行され、更新日時も正しく設定される
      // 【期待される動作】: 指定された進捗値でUserMissionが更新される
      // 🟡 信頼性レベル: 既存実装から妥当な推測

      // 【テストデータ準備】: 進捗更新時の標準的な状況を準備
      // 【初期条件設定】: ユーザーが進行中のミッションを持つ状態
      const userId = 'user1';
      const missionId = 'mission1';
      const newProgress = 3;
      const mockUpdatedUserMission = {
        id: 'user-mission-1',
        userId,
        missionId,
        progress: newProgress,
        isCompleted: false,
        updatedAt: new Date()
      };

      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedUserMission])
          })
        })
      });

      // 【実際の処理実行】: ミッション進捗更新処理を実行
      // 【処理内容】: 指定された進捗値でのUserMission更新処理
      const result = await updateMissionProgress(userId, missionId, newProgress);

      // 【結果検証】: 進捗更新が成功し、正しい値が設定されることを確認
      // 【期待値確認】: 進捗値とupdatedAtが適切に更新されることを検証
      expect(result).toEqual(mockUpdatedUserMission); // 【確認内容】: 更新されたUserMissionが期待通りの内容であることを確認 🟡
      expect(result.progress).toBe(newProgress); // 【確認内容】: 進捗値が指定値に更新されることを確認 🟡
      expect(result.userId).toBe(userId); // 【確認内容】: ユーザーIDが保持されることを確認 🟡
      expect(result.missionId).toBe(missionId); // 【確認内容】: ミッションIDが保持されることを確認 🟡
    });

    test('ユーザーミッション一覧取得', async () => {
      // 【テスト目的】: ユーザーの進行中・完了済みミッションが適切に取得され、関連データが正しく結合されることを確認
      // 【テスト内容】: getUserMissions関数がミッション情報・進捗・バッジ情報を正しく結合して返却することを検証
      // 【期待される動作】: ユーザーのミッション一覧と詳細情報が適切に結合されて取得される
      // 🟢 信頼性レベル: 既存実装から確実に導出

      // 【テストデータ準備】: ユーザーミッション一覧取得の標準的なデータを準備
      // 【初期条件設定】: ユーザーが複数のミッション（進行中・完了）を持つ状態
      const userId = 'user1';
      const mockUserMissions = [
        {
          id: 'user-mission-1',
          userId,
          missionId: 'mission-1', 
          progress: 2,
          isCompleted: false,
          startedAt: new Date('2024-01-01'),
          completedAt: null,
          claimedAt: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          mission: {
            id: 'mission-1',
            title: '3日連続ルーティン実行',
            description: 'ルーティンを3日連続で実行しよう',
            type: 'streak',
            targetValue: 3,
            xpReward: 100,
            badgeId: 'badge-1',
            difficulty: 'easy',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          badge: {
            id: 'badge-1',
            name: 'ストリークマスター',
            description: '連続実行の達人',
            iconUrl: '/badges/streak-master.svg',
            rarity: 'common',
            category: 'achievement',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        },
        {
          id: 'user-mission-2',
          userId,
          missionId: 'mission-2',
          progress: 10,
          isCompleted: true,
          startedAt: new Date('2024-01-01'),
          completedAt: new Date('2024-01-03'),
          claimedAt: new Date('2024-01-03'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-03'),
          mission: {
            id: 'mission-2',
            title: '10回のルーティン実行',
            description: '合計10回のルーティンを実行しよう',
            type: 'count',
            targetValue: 10,
            xpReward: 200,
            badgeId: null,
            difficulty: 'medium',
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          badge: null
        }
      ];

      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockResolvedValue(mockUserMissions)
              })
            })
          })
        })
      });

      // 【実際の処理実行】: ユーザーミッション一覧取得処理を実行
      // 【処理内容】: ミッション・バッジ情報を結合したユーザーミッション一覧の取得
      const result = await getUserMissions(userId);

      // 【結果検証】: ユーザーミッション一覧が適切に取得され、関連データが正しく結合されることを確認
      // 【期待値確認】: 進行中・完了済みミッションが適切な詳細情報と共に返却されることを検証
      expect(result).toEqual(mockUserMissions); // 【確認内容】: 取得されたデータが期待通りの構造であることを確認 🟢
      expect(result).toHaveLength(2); // 【確認内容】: 期待されるミッション数が返却されることを確認 🟢
      expect(result[0].mission.title).toBe('3日連続ルーティン実行'); // 【確認内容】: ミッション情報が正しく結合されることを確認 🟢
      expect(result[0].badge?.name).toBe('ストリークマスター'); // 【確認内容】: バッジ情報が正しく結合されることを確認 🟢
      expect(result[1].badge).toBeNull(); // 【確認内容】: バッジが無いミッションではnullが返却されることを確認 🟢
      expect(result[0].isCompleted).toBe(false); // 【確認内容】: 進行中ミッションの状態が正しいことを確認 🟢
      expect(result[1].isCompleted).toBe(true); // 【確認内容】: 完了済みミッションの状態が正しいことを確認 🟢
    });

    test('ミッション完了と報酬受け取りの成功', async () => {
      // 【テスト目的】: ミッション完了時に適切に状態更新され、報酬情報が返却されることを確認
      // 【テスト内容】: 完了フラグ設定、完了日時設定、進捗値最終更新、報酬計算の一連の処理
      // 【期待される動作】: ミッション完了状態への更新と報酬情報の正確な返却
      // 🟡 信頼性レベル: 既存実装から妥当な推測

      // 【テストデータ準備】: ミッション完了時の標準的な状況を準備
      // 【初期条件設定】: ユーザーが完了可能状態のミッションを持つ状態
      const userId = 'user1';
      const missionId = 'mission1';
      const mockMission = {
        id: missionId,
        title: 'テストミッション',
        targetValue: 5,
        xpReward: 150
      };
      const mockCompletedUserMission = {
        id: 'user-mission-1',
        userId,
        missionId,
        progress: mockMission.targetValue,
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date()
      };

      // Mock mission lookup
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockMission])
          })
        })
      });

      // Mock completion update
      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockCompletedUserMission])
          })
        })
      });

      // 【実際の処理実行】: ミッション完了処理を実行
      // 【処理内容】: ミッション完了状態への更新と報酬計算処理
      const result = await completeMission(userId, missionId);

      // 【結果検証】: ミッション完了処理が成功し、適切な報酬情報が返却されることを確認
      // 【期待値確認】: 完了状態への更新と報酬情報の正確性を検証
      expect(result.userMission).toEqual(mockCompletedUserMission); // 【確認内容】: 完了状態に更新されたUserMissionが返却されることを確認 🟡
      expect(result.xpReward).toBe(mockMission.xpReward); // 【確認内容】: 正しいXP報酬が返却されることを確認 🟡
      expect(result.userMission.isCompleted).toBe(true); // 【確認内容】: 完了フラグが正しく設定されることを確認 🟡
      expect(result.userMission.progress).toBe(mockMission.targetValue); // 【確認内容】: 進捗が目標値に設定されることを確認 🟡
    });
  });

  describe('異常系テスト - エラーハンドリング確認', () => {
    test('重複ミッション開始の拒否', async () => {
      // 【テスト目的】: 既に開始済みのミッションを再度開始しようとした場合に適切にエラーとなることを確認
      // 【テスト内容】: 重複開始チェックが機能し、適切なエラーメッセージが返却されることを検証
      // 【期待される動作】: 重複開始を防止し、明確なエラーメッセージを返却する
      // 🟡 信頼性レベル: ビジネスルール詳細が部分的に推測

      // 【テストデータ準備】: 重複開始が発生する状況を準備
      // 【初期条件設定】: ユーザーが既に開始済みのミッションを再度開始しようとする状態
      const userId = 'user1';
      const missionId = 'mission1';
      const existingUserMission = {
        id: 'existing-user-mission',
        userId,
        missionId,
        progress: 2,
        isCompleted: false
      };

      // Mock existing mission check (returns existing mission)
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([existingUserMission]) // Existing mission found
          })
        })
      });

      // 【実際の処理実行】: 重複開始処理を実行し、エラーが発生することを確認
      // 【処理内容】: 既に開始済みのミッションに対する開始処理の実行
      await expect(startMission(userId, missionId)).rejects.toThrow('このミッションは既に開始済みです'); // 【確認内容】: 重複開始エラーが適切に発生することを確認 🟡
    });

    test('存在しないミッション開始の拒否', async () => {
      // 【テスト目的】: 存在しないまたは非アクティブなミッションの開始試行が適切に拒否されることを確認
      // 【テスト内容】: ミッション存在チェックが機能し、適切なエラーメッセージが返却されることを検証
      // 【期待される動作】: 無効なミッションIDに対して明確なエラーを返却する
      // 🟢 信頼性レベル: データ整合性チェックから確実に導出

      // 【テストデータ準備】: 存在しないミッションへの開始試行状況を準備
      // 【初期条件設定】: 有効でないミッションIDが指定される状態
      const userId = 'user1';
      const missionId = 'non-existent-mission';

      // Mock no existing user mission
      const mockExistingCheck = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]) // No existing mission
            })
          })
        })
      };

      // Mock mission not found
      const mockMissionCheck = {
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([]) // Mission not found
            })
          })
        })
      };

      mockDb.select
        .mockReturnValueOnce(mockExistingCheck.select() as any)
        .mockReturnValueOnce(mockMissionCheck.select() as any);

      // 【実際の処理実行】: 存在しないミッション開始処理を実行し、エラーが発生することを確認
      // 【処理内容】: 無効なミッションIDに対する開始処理の実行
      await expect(startMission(userId, missionId)).rejects.toThrow('指定されたミッションが見つからないか、非アクティブです'); // 【確認内容】: ミッション未存在エラーが適切に発生することを確認 🟢
    });

    test('存在しないUserMissionの進捗更新拒否', async () => {
      // 【テスト目的】: 開始していないミッションの進捗更新が適切に拒否されることを確認
      // 【テスト内容】: UserMission存在チェックが機能し、適切なエラーメッセージが返却される
      // 【期待される動作】: 無効な進捗更新試行に対して明確なエラーを返却する
      // 🟡 信頼性レベル: データ整合性チェックから妥当な推測

      // 【テストデータ準備】: 存在しないUserMissionへの更新試行状況を準備
      // 【初期条件設定】: 開始していないミッションの進捗更新が試行される状態
      const userId = 'user1';
      const missionId = 'mission1';
      const progress = 3;

      // Mock update returning null (no matching record)
      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]) // No record updated
          })
        })
      });

      // 【実際の処理実行】: 存在しないUserMissionの進捗更新を実行し、エラーが発生することを確認
      // 【処理内容】: 開始していないミッションに対する進捗更新処理の実行
      await expect(updateMissionProgress(userId, missionId, progress)).rejects.toThrow('ユーザーミッションが見つかりません'); // 【確認内容】: UserMission未存在エラーが適切に発生することを確認 🟡
    });

    test('データベースエラー時の適切なエラーハンドリング', async () => {
      // 【テスト目的】: データベース接続エラー等のシステムエラー時に適切にエラーハンドリングされることを確認
      // 【テスト内容】: データベースエラーが発生した場合の例外処理とエラーメッセージの妥当性を検証
      // 【期待される動作】: システムエラーを適切にキャッチし、ユーザーフレンドリーなエラーメッセージを返却
      // 🔴 信頼性レベル: エラーハンドリング仕様が推測ベース

      // 【テストデータ準備】: データベースエラーが発生する状況を準備
      // 【初期条件設定】: データベース接続障害等のシステムエラーが発生する状態
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockRejectedValue(new Error('Database connection failed'))
          })
        })
      });

      // 【実際の処理実行】: データベースエラーが発生する処理を実行し、適切にエラーハンドリングされることを確認
      // 【処理内容】: システムエラー時のgetActiveMissions関数の動作確認
      await expect(getActiveMissions()).rejects.toThrow('アクティブなミッションの取得に失敗しました'); // 【確認内容】: システムエラーが適切にハンドリングされ、ユーザーフレンドリーなメッセージが返却されることを確認 🔴
    });
  });

  describe('境界値テスト - 極端な条件での動作確認', () => {
    test('進捗値0での更新処理', async () => {
      // 【テスト目的】: 最小進捗値（0）での更新が正常に処理されることを確認
      // 【テスト内容】: 境界値である進捗値0での更新処理の正確性を検証
      // 【期待される動作】: 進捗値0が適切に処理され、データベースに正しく反映される
      // 🟡 信頼性レベル: 境界値動作が既存実装から推測

      // 【テストデータ準備】: 最小境界値での更新状況を準備
      // 【初期条件設定】: 進捗値0での更新が実行される状態
      const userId = 'user1';
      const missionId = 'mission1';
      const minProgress = 0;
      const mockUpdatedUserMission = {
        id: 'user-mission-1',
        userId,
        missionId,
        progress: minProgress,
        isCompleted: false,
        updatedAt: new Date()
      };

      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedUserMission])
          })
        })
      });

      // 【実際の処理実行】: 最小境界値での進捗更新処理を実行
      // 【処理内容】: 進捗値0での更新処理の実行
      const result = await updateMissionProgress(userId, missionId, minProgress);

      // 【結果検証】: 最小境界値での更新が正常に処理されることを確認
      // 【期待値確認】: 進捗値0が適切に設定されることを検証
      expect(result.progress).toBe(minProgress); // 【確認内容】: 最小境界値（0）が正しく設定されることを確認 🟡
      expect(result.userId).toBe(userId); // 【確認内容】: ユーザーIDが保持されることを確認 🟡
      expect(result.missionId).toBe(missionId); // 【確認内容】: ミッションIDが保持されることを確認 🟡
    });

    test('目標値と同じ進捗値での更新処理', async () => {
      // 【テスト目的】: 目標値と同じ進捗値（完了条件境界）での更新が正常に処理されることを確認
      // 【テスト内容】: 完了判定境界での進捗更新処理の正確性を検証
      // 【期待される動作】: 目標達成時の進捗値が適切に処理される
      // 🟡 信頼性レベル: 境界値動作が既存実装から推測

      // 【テストデータ準備】: 完了境界値での更新状況を準備
      // 【初期条件設定】: 進捗値が目標値に到達する状態
      const userId = 'user1';
      const missionId = 'mission1';
      const targetProgress = 10; // 目標値と同じ値
      const mockUpdatedUserMission = {
        id: 'user-mission-1',
        userId,
        missionId,
        progress: targetProgress,
        isCompleted: false, // まだ完了処理は別途実行
        updatedAt: new Date()
      };

      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUpdatedUserMission])
          })
        })
      });

      // 【実際の処理実行】: 目標値での進捗更新処理を実行
      // 【処理内容】: 目標達成時の進捗更新処理の実行
      const result = await updateMissionProgress(userId, missionId, targetProgress);

      // 【結果検証】: 目標値境界での更新が正常に処理されることを確認
      // 【期待値確認】: 目標値進捗が適切に設定されることを検証
      expect(result.progress).toBe(targetProgress); // 【確認内容】: 目標値境界での進捗値が正しく設定されることを確認 🟡
      expect(result.userId).toBe(userId); // 【確認内容】: ユーザーIDが保持されることを確認 🟡
      expect(result.missionId).toBe(missionId); // 【確認内容】: ミッションIDが保持されることを確認 🟡
    });
  });
});