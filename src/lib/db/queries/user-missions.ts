import { eq, and, desc, isNull, isNotNull } from 'drizzle-orm';

import { db } from '../index';
import {
  missions,
  userMissions,
  badges,
  type Mission,
  type UserMission,
  type Badge,
} from '../schema';

// フィルター型定義
export interface UserMissionFilters {
  missionId?: string;
  claimed?: boolean;
  status?: 'completed' | 'in_progress';
}

// ページネーション型定義
export interface UserMissionPagination {
  page?: number;
  limit?: number;
}

// ユーザーミッション進捗取得
export async function getUserMissions(
  userId: string, 
  filters?: UserMissionFilters,
  _pagination?: UserMissionPagination
): Promise<(UserMission & { mission: Mission; badge?: Badge | null })[]> {
  try {
    // Build where conditions
    const whereConditions = [eq(userMissions.userId, userId)];

    if (filters?.missionId) {
      whereConditions.push(eq(userMissions.missionId, filters.missionId));
    }

    if (filters?.status) {
      const isCompleted = filters.status === 'completed';
      whereConditions.push(eq(userMissions.isCompleted, isCompleted));
    }

    if (filters?.claimed !== undefined) {
      if (filters.claimed) {
        // claimedAt is not null (has been claimed)
        whereConditions.push(isNotNull(userMissions.claimedAt));
      } else {
        // claimedAt is null (not claimed)
        whereConditions.push(isNull(userMissions.claimedAt));
      }
    }

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
      .where(and(...whereConditions))
      .orderBy(desc(userMissions.startedAt));

    return userMissionList;
  } catch (error) {
    console.error('Failed to get user missions:', error);
    throw new Error('ユーザーミッションの取得に失敗しました');
  }
}

// ユーザーミッション進捗取得（ステータス別）
export async function getUserMissionsByStatus(
  userId: string, 
  status: 'completed' | 'in_progress'
): Promise<(UserMission & { mission: Mission; badge?: Badge | null })[]> {
  try {
    const isCompleted = status === 'completed';
    
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
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.isCompleted, isCompleted)
      ))
      .orderBy(desc(userMissions.startedAt));

    return userMissionList;
  } catch (error) {
    console.error('Failed to get user missions by status:', error);
    throw new Error('ユーザーミッション（ステータス別）の取得に失敗しました');
  }
}

// ユーザーミッション詳細取得（ミッション詳細付き）
export async function getUserMissionsWithMissionDetails(userId: string): Promise<(UserMission & { 
  mission: Mission; 
  badge?: Badge | null 
})[]> {
  try {
    // 基本的にgetUserMissionsと同じだが、より詳細な情報を含む場合に使用
    return await getUserMissions(userId);
  } catch (error) {
    console.error('Failed to get user missions with details:', error);
    throw new Error('ユーザーミッション詳細の取得に失敗しました');
  }
}