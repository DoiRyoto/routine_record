import { eq, and, desc } from 'drizzle-orm';

import { db } from '../index';
import {
  missions,
  userMissions,
  badges,
  type Mission,
  type UserMission,
  type Badge,
  type InsertMission,
} from '../schema';

// アクティブなミッション一覧取得
export async function getActiveMissions(): Promise<Mission[]> {
  try {
    const missionList = await db
      .select()
      .from(missions)
      .where(eq(missions.isActive, true))
      .orderBy(missions.createdAt);

    return missionList;
  } catch (error) {
    console.error('Failed to get active missions:', error);
    throw new Error('アクティブなミッションの取得に失敗しました');
  }
}

// ユーザーミッション進捗取得
export async function getUserMissions(userId: string): Promise<(UserMission & { mission: Mission; badge?: Badge | null })[]> {
  try {
    const userMissionList = await db
      .select({
        id: userMissions.id,
        userId: userMissions.userId,
        missionId: userMissions.missionId,
        progress: userMissions.progress,
        isCompleted: userMissions.isCompleted,
        startedAt: userMissions.startedAt,
        completedAt: userMissions.completedAt,
        claimedAt: userMissions.claimedAt,
        createdAt: userMissions.createdAt,
        updatedAt: userMissions.updatedAt,
        mission: {
          id: missions.id,
          title: missions.title,
          description: missions.description,
          type: missions.type,
          targetValue: missions.targetValue,
          xpReward: missions.xpReward,
          badgeId: missions.badgeId,
          difficulty: missions.difficulty,
          isActive: missions.isActive,
          createdAt: missions.createdAt,
          updatedAt: missions.updatedAt,
        },
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          iconUrl: badges.iconUrl,
          rarity: badges.rarity,
          category: badges.category,
          createdAt: badges.createdAt,
          updatedAt: badges.updatedAt,
        }
      })
      .from(userMissions)
      .innerJoin(missions, eq(userMissions.missionId, missions.id))
      .leftJoin(badges, eq(missions.badgeId, badges.id))
      .where(eq(userMissions.userId, userId))
      .orderBy(desc(userMissions.startedAt));

    return userMissionList;
  } catch (error) {
    console.error('Failed to get user missions:', error);
    throw new Error('ユーザーミッションの取得に失敗しました');
  }
}

// ミッション開始
export async function startMission(userId: string, missionId: string): Promise<UserMission> {
  try {
    // 既に開始済みかチェック
    const existingMission = await db
      .select()
      .from(userMissions)
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, missionId)
      ))
      .limit(1);

    if (existingMission.length > 0) {
      throw new Error('このミッションは既に開始済みです');
    }

    // ミッションが存在するかチェック
    const [mission] = await db
      .select()
      .from(missions)
      .where(and(
        eq(missions.id, missionId),
        eq(missions.isActive, true)
      ))
      .limit(1);

    if (!mission) {
      throw new Error('指定されたミッションが見つからないか、非アクティブです');
    }

    // ユーザーミッションを作成
    const [newUserMission] = await db
      .insert(userMissions)
      .values({
        userId,
        missionId,
        progress: 0,
        isCompleted: false
      })
      .returning();

    return newUserMission;
  } catch (error) {
    console.error('Failed to start mission:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ミッションの開始に失敗しました');
  }
}

// ミッション進捗更新
export async function updateMissionProgress(
  userId: string,
  missionId: string,
  progress: number
): Promise<UserMission> {
  try {
    const [userMission] = await db
      .update(userMissions)
      .set({
        progress,
        updatedAt: new Date()
      })
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, missionId)
      ))
      .returning();

    if (!userMission) {
      throw new Error('ユーザーミッションが見つかりません');
    }

    return userMission;
  } catch (error) {
    console.error('Failed to update mission progress:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ミッション進捗の更新に失敗しました');
  }
}

// ミッション完了
export async function completeMission(
  userId: string,
  missionId: string
): Promise<{ userMission: UserMission; xpReward: number }> {
  try {
    // ミッション情報取得
    const [mission] = await db
      .select()
      .from(missions)
      .where(eq(missions.id, missionId))
      .limit(1);

    if (!mission) {
      throw new Error('ミッションが見つかりません');
    }

    // ユーザーミッション完了更新
    const [completedUserMission] = await db
      .update(userMissions)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        progress: mission.targetValue, // 進捗を目標値に設定
        updatedAt: new Date()
      })
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, missionId),
        eq(userMissions.isCompleted, false)
      ))
      .returning();

    if (!completedUserMission) {
      throw new Error('ユーザーミッションが見つからないか、既に完了済みです');
    }

    return {
      userMission: completedUserMission,
      xpReward: mission.xpReward
    };
  } catch (error) {
    console.error('Failed to complete mission:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ミッションの完了に失敗しました');
  }
}

// ミッション作成（管理者用）
export async function createMission(missionData: InsertMission): Promise<Mission> {
  try {
    const [newMission] = await db
      .insert(missions)
      .values(missionData)
      .returning();

    return newMission;
  } catch (error) {
    console.error('Failed to create mission:', error);
    throw new Error('ミッションの作成に失敗しました');
  }
}