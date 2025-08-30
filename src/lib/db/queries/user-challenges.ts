import { eq, desc, and } from 'drizzle-orm';

import { db } from '../index';
import {
  userChallenges,
  challenges,
  challengeRequirements,
  challengeRewards,
  type UserChallenge,
  type Challenge,
  type ChallengeRequirement,
  type ChallengeReward,
} from '../schema';

// ユーザーのチャレンジ一覧取得
export async function getUserChallenges(
  userId: string, 
  filters?: { challengeId?: string } | null, 
  pagination?: { page: number; limit: number }
): Promise<UserChallenge[]> {
  let whereCondition = eq(userChallenges.userId, userId);
  
  // challengeIdフィルタ適用
  if (filters?.challengeId) {
    whereCondition = and(
      whereCondition,
      eq(userChallenges.challengeId, filters.challengeId)
    ) as any;
  }

  let query = db
    .select()
    .from(userChallenges)
    .where(whereCondition)
    .orderBy(desc(userChallenges.createdAt));

  // ページネーション適用
  if (pagination) {
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.limit(pagination.limit).offset(offset);
  }

  return await query;
}

// 完了状態でフィルタリングされたユーザーチャレンジ取得
export async function getUserChallengesByStatus(
  userId: string,
  status: 'completed' | 'in_progress'
): Promise<UserChallenge[]> {
  const isCompleted = status === 'completed';
  return await db
    .select()
    .from(userChallenges)
    .where(and(
      eq(userChallenges.userId, userId),
      eq(userChallenges.isCompleted, isCompleted)
    ))
    .orderBy(desc(userChallenges.createdAt));
}

// 詳細情報付きユーザーチャレンジ取得
export async function getUserChallengesWithDetails(userId: string): Promise<(UserChallenge & {
  challenge: Challenge & {
    requirements: ChallengeRequirement[];
    rewards: ChallengeReward[];
  };
})[]> {
  const userChallengeList = await db
    .select()
    .from(userChallenges)
    .leftJoin(challenges, eq(userChallenges.challengeId, challenges.id))
    .where(eq(userChallenges.userId, userId))
    .orderBy(desc(userChallenges.createdAt));

  const userChallengesWithDetails = await Promise.all(
    userChallengeList.map(async (item) => {
      if (!item.challenges) {
        throw new Error('Challenge not found');
      }

      const requirements = await db
        .select()
        .from(challengeRequirements)
        .where(eq(challengeRequirements.challengeId, item.challenges.id));

      const rewards = await db
        .select()
        .from(challengeRewards)
        .where(eq(challengeRewards.challengeId, item.challenges.id));

      return {
        ...item.user_challenges,
        challenge: {
          ...item.challenges,
          requirements,
          rewards,
        },
      };
    })
  );

  return userChallengesWithDetails;
}

// 特定のチャレンジに対するユーザーの参加状況取得
export async function getUserChallengeByChallenge(
  userId: string,
  challengeId: string
): Promise<UserChallenge | null> {
  const result = await db
    .select()
    .from(userChallenges)
    .where(and(
      eq(userChallenges.userId, userId),
      eq(userChallenges.challengeId, challengeId)
    ))
    .limit(1);

  return result[0] || null;
}