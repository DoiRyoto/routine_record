/**
 * Mission Card データベースクエリ関数
 * TDD Green Phase - 最小実装でテストをパスさせる
 */

import { eq, and, desc, sql } from 'drizzle-orm';

import type { 
  MissionWithDetails,
  GetTodayMissionsRequest,
  UpdateMissionStatusRequest,
  MissionActionResult,
  GetMissionProgressRequest,
  MissionProgressResponse,
  MissionStatus,
  ProgressData,
  CategoryDisplay,
  UserMissionExtended,
  ExecutionRecordSummary
} from '../../../types/mission-card';
import { 
  calculateProgress, 
  determineMissionStatus,
  getCategoryBackgroundClass,
  getCategoryTextClass 
} from '../../../utils/mission-card';
import { db } from '../index';
import { 
  missions, 
  userMissions, 
  executionRecords
} from '../schema';



/**
 * 今日のミッション一覧を取得
 */
export async function getTodayMissions(
  request: GetTodayMissionsRequest
): Promise<MissionWithDetails[]> {
  const { userId, date, timezone: _timezone = 'Asia/Tokyo', includeCompleted = true } = request;
  
  // 入力検証
  if (!isValidUUID(userId)) {
    throw new Error('INVALID_USER_ID');
  }
  
  if (!isValidDate(date)) {
    throw new Error('INVALID_DATE');
  }

  try {
    // ユーザーのミッション一覧を取得（関連データも含む）
    const missionsData = await db
      .select({
        // Mission data
        missionId: missions.id,
        missionTitle: missions.title,
        missionDescription: missions.description,
        missionType: missions.type,
        missionTargetValue: missions.targetValue,
        missionXpReward: missions.xpReward,
        missionIsActive: missions.isActive,
        missionCreatedAt: missions.createdAt,
        missionUpdatedAt: missions.updatedAt,
        
        // UserMission data
        userMissionId: userMissions.id,
        userMissionUserId: userMissions.userId,
        userMissionProgress: userMissions.progress,
        userMissionIsCompleted: userMissions.isCompleted,
        userMissionStartedAt: userMissions.startedAt,
        userMissionCompletedAt: userMissions.completedAt,
        userMissionClaimedAt: userMissions.claimedAt,
        userMissionCreatedAt: userMissions.createdAt,
        userMissionUpdatedAt: userMissions.updatedAt,
        
        // Category data (仮のカテゴリ情報)
        categoryId: sql<string>`'default'`.as('categoryId'),
        categoryName: sql<string>`'general'`.as('categoryName'),
        categoryColor: sql<string>`'bg-gray-100 text-gray-800'`.as('categoryColor')
      })
      .from(missions)
      .leftJoin(userMissions, eq(missions.id, userMissions.missionId))
      .where(
        and(
          eq(missions.isActive, true),
          userMissions.userId ? eq(userMissions.userId, userId) : sql`true`
        )
      )
      .orderBy(missions.createdAt);

    // フィルタリング処理
    const filteredData = includeCompleted 
      ? missionsData 
      : missionsData.filter(m => !m.userMissionIsCompleted);

    // データを MissionWithDetails 形式に変換
    const result: MissionWithDetails[] = filteredData.map(data => {
      // ProgressData の計算
      const progress: ProgressData = calculateProgress(
        data.userMissionProgress || 0,
        data.missionTargetValue,
        data.userMissionIsCompleted || false,
        false // TODO: 期限切れ判定ロジック
      );

      // MissionStatus の判定
      const status: MissionStatus = determineMissionStatus(
        data.userMissionIsCompleted || false,
        data.missionIsActive,
        undefined // TODO: TimeSlot計算
      );

      // CategoryDisplay の構築
      const categoryInfo: CategoryDisplay = {
        id: data.categoryId,
        name: data.categoryName,
        backgroundColor: getCategoryBackgroundClass(data.categoryName),
        textColor: getCategoryTextClass(data.categoryName)
      };

      // UserMissionExtended の構築（存在する場合）
      const userMission: UserMissionExtended | undefined = data.userMissionId ? {
        id: data.userMissionId,
        userId: data.userMissionUserId!,
        missionId: data.missionId,
        progress: data.userMissionProgress!,
        isCompleted: data.userMissionIsCompleted!,
        startedAt: data.userMissionStartedAt!,
        completedAt: data.userMissionCompletedAt || undefined,
        claimedAt: data.userMissionClaimedAt || undefined,
        createdAt: data.userMissionCreatedAt!,
        updatedAt: data.userMissionUpdatedAt!,
        todayExecutionRecords: [], // TODO: 実行記録取得
        streakDays: 0, // TODO: 継続日数計算
        weeklyExecutionCount: 0 // TODO: 週間実行回数計算
      } : undefined;

      return {
        id: data.missionId,
        userId,
        name: data.missionTitle,
        description: data.missionDescription || undefined,
        category: data.categoryName,
        goalType: 'frequency_based', // TODO: 適切なマッピング
        targetCount: data.missionTargetValue,
        createdAt: data.missionCreatedAt,
        updatedAt: data.missionUpdatedAt,
        isActive: data.missionIsActive,
        
        userMission,
        categoryInfo,
        participants: [], // TODO: 参加者情報取得
        
        timeSlot: undefined, // TODO: TimeSlot計算
        progress,
        status,
        isScheduledToday: true // TODO: スケジュール判定
      };
    });

    return result;
  } catch (error) {
    console.error('Failed to get today missions:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('今日のミッションの取得に失敗しました');
  }
}

/**
 * ミッション状態を更新
 */
export async function updateMissionStatus(
  request: UpdateMissionStatusRequest
): Promise<MissionActionResult> {
  const { missionId, userId, action, executedAt, duration, memo } = request;

  try {
    // ミッションの存在確認
    const [mission] = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    if (!mission) {
      return {
        success: false,
        error: 'ミッションが見つかりません'
      };
    }

    // ユーザーミッションの確認/作成
    let [userMission] = await db
      .select()
      .from(userMissions)
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, missionId)
      ))
      .limit(1);

    switch (action) {
      case 'start':
        if (userMission) {
          return {
            success: false,
            error: 'このミッションは既に開始済みです'
          };
        }
        
        // 新しいユーザーミッション作成
        [userMission] = await db
          .insert(userMissions)
          .values({
            userId,
            missionId,
            progress: 0,
            isCompleted: false
          })
          .returning();
        break;

      case 'complete':
        if (!userMission) {
          return {
            success: false,
            error: 'ミッションが開始されていません'
          };
        }

        if (userMission.userId !== userId) {
          return {
            success: false,
            error: 'アクセス権限がありません'
          };
        }

        // ミッション完了
        [userMission] = await db
          .update(userMissions)
          .set({
            isCompleted: true,
            completedAt: new Date(),
            progress: mission.targetValue,
            updatedAt: new Date()
          })
          .where(eq(userMissions.id, userMission.id))
          .returning();

        // 実行記録作成
        if (executedAt || duration || memo) {
          await db.insert(executionRecords).values({
            routineId: missionId, // 便宜上routineIdを使用
            userId,
            executedAt: executedAt ? new Date(executedAt) : new Date(),
            duration,
            memo,
            isCompleted: true
          });
        }
        break;

      default:
        return {
          success: false,
          error: `サポートされていないアクション: ${action}`
        };
    }

    // 更新されたミッション情報を取得
    const updatedMissions = await getTodayMissions({
      userId,
      date: new Date().toISOString().split('T')[0]
    });

    const updatedMission = updatedMissions.find(m => m.id === missionId);

    return {
      success: true,
      updatedMission,
      message: `ミッションが${action === 'start' ? '開始' : '完了'}されました`
    };

  } catch (error) {
    console.error('Failed to update mission status:', error);
    return {
      success: false,
      error: 'ミッションの更新に失敗しました'
    };
  }
}

/**
 * ミッション進捗を取得
 */
export async function getMissionProgress(
  request: GetMissionProgressRequest
): Promise<MissionProgressResponse> {
  const { userId, missionId, period: _period = 'today' } = request;

  try {
    // ミッション詳細取得
    const userMissionList = await getTodayMissions({
      userId,
      date: new Date().toISOString().split('T')[0]
    });

    const mission = userMissionList.find(m => m.id === missionId);
    if (!mission) {
      throw new Error('ミッションが見つかりません');
    }

    // 実行記録取得
    const records = await db
      .select({
        id: executionRecords.id,
        executedAt: executionRecords.executedAt,
        duration: executionRecords.duration,
        isCompleted: executionRecords.isCompleted,
        memo: executionRecords.memo
      })
      .from(executionRecords)
      .where(and(
        eq(executionRecords.userId, userId),
        eq(executionRecords.routineId, missionId) // 便宜上routineIdを使用
      ))
      .orderBy(desc(executionRecords.executedAt));

    const history: ExecutionRecordSummary[] = records.map(record => ({
      id: record.id,
      executedAt: record.executedAt,
      duration: record.duration || undefined,
      isCompleted: record.isCompleted,
      memo: record.memo || undefined
    }));

    return {
      mission,
      progress: mission.progress,
      history,
      streak: {
        current: 0, // TODO: 継続日数計算
        longest: 0, // TODO: 最長継続日数計算  
        isActive: false // TODO: 継続中かどうか判定
      }
    };

  } catch (error) {
    console.error('Failed to get mission progress:', error);
    throw new Error('ミッション進捗の取得に失敗しました');
  }
}

// ヘルパー関数

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}