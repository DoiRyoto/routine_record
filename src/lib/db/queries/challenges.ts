import { eq, desc, and, sql } from 'drizzle-orm';

import { db } from '../index';
import type {
  Challenge,
  UserChallenge,
  ChallengeRequirement,
  ChallengeReward,
  InsertChallenge,
  InsertChallengeRequirement,
  InsertChallengeReward,
} from '../schema';
import {
  challenges,
  userChallenges,
  challengeRequirements,
  challengeRewards,
} from '../schema';

// チャレンジ一覧取得（アクティブなチャレンジのみ）
export async function getActiveChallenges(): Promise<(Challenge & {
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
})[]> {
  try {
    const challengeList = await db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true))
      .orderBy(desc(challenges.createdAt));

    const challengesWithDetails = await Promise.all(
      challengeList.map(async (challenge) => {
        const [requirements, rewards] = await Promise.all([
          db
            .select()
            .from(challengeRequirements)
            .where(eq(challengeRequirements.challengeId, challenge.id)),
          db
            .select()
            .from(challengeRewards)
            .where(eq(challengeRewards.challengeId, challenge.id))
        ]);

        return {
          ...challenge,
          requirements,
          rewards
        };
      })
    );

    return challengesWithDetails;
  } catch (error) {
    console.error('Failed to get active challenges:', error);
    throw new Error('チャレンジの取得に失敗しました');
  }
}

// ユーザーのチャレンジ参加状況取得
export async function getUserChallenges(userId: string): Promise<UserChallenge[]> {
  try {
    const userChallengeList = await db
      .select()
      .from(userChallenges)
      .where(eq(userChallenges.userId, userId))
      .orderBy(desc(userChallenges.createdAt));

    return userChallengeList;
  } catch (error) {
    console.error('Failed to get user challenges:', error);
    throw new Error('ユーザーチャレンジの取得に失敗しました');
  }
}

// チャレンジ参加
export async function joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
  try {
    // すでに参加しているかチェック
    const existingParticipation = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId)
      ))
      .limit(1);

    if (existingParticipation.length > 0) {
      throw new Error('すでにこのチャレンジに参加しています');
    }

    // チャレンジが存在し、参加可能かチェック
    const challenge = await db
      .select()
      .from(challenges)
      .where(and(
        eq(challenges.id, challengeId),
        eq(challenges.isActive, true)
      ))
      .limit(1);

    if (challenge.length === 0) {
      throw new Error('チャレンジが見つからないか、参加できません');
    }

    // 参加者数上限チェック
    if (challenge[0].maxParticipants && challenge[0].participants >= challenge[0].maxParticipants) {
      throw new Error('参加者数が上限に達しています');
    }

    // チャレンジに参加
    const [newUserChallenge] = await db
      .insert(userChallenges)
      .values({
        userId,
        challengeId,
        progress: 0,
        isCompleted: false
      })
      .returning();

    // 参加者数を更新
    await db
      .update(challenges)
      .set({ 
        participants: sql`${challenges.participants} + 1`,
        updatedAt: new Date()
      })
      .where(eq(challenges.id, challengeId));

    return newUserChallenge;
  } catch (error) {
    console.error('Failed to join challenge:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('チャレンジへの参加に失敗しました');
  }
}

// チャレンジから脱退
export async function leaveChallenge(userId: string, challengeId: string): Promise<void> {
  try {
    // 参加記録を削除
    const deletedRecords = await db
      .delete(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId)
      ))
      .returning();

    if (deletedRecords.length === 0) {
      throw new Error('参加記録が見つかりません');
    }

    // 参加者数を減らす
    await db
      .update(challenges)
      .set({ 
        participants: sql`${challenges.participants} - 1`,
        updatedAt: new Date()
      })
      .where(eq(challenges.id, challengeId));

  } catch (error) {
    console.error('Failed to leave challenge:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('チャレンジからの脱退に失敗しました');
  }
}

// チャレンジ作成（管理者用）
export async function createChallenge(
  challengeData: InsertChallenge,
  requirements: Omit<InsertChallengeRequirement, 'challengeId'>[],
  rewards: Omit<InsertChallengeReward, 'challengeId'>[]
): Promise<Challenge> {
  try {
    const [newChallenge] = await db
      .insert(challenges)
      .values(challengeData)
      .returning();

    // 要件を追加
    if (requirements.length > 0) {
      await db
        .insert(challengeRequirements)
        .values(requirements.map(req => ({ ...req, challengeId: newChallenge.id })));
    }

    // 報酬を追加
    if (rewards.length > 0) {
      await db
        .insert(challengeRewards)
        .values(rewards.map(reward => ({ ...reward, challengeId: newChallenge.id })));
    }

    return newChallenge;
  } catch (error) {
    console.error('Failed to create challenge:', error);
    throw new Error('チャレンジの作成に失敗しました');
  }
}

// チャレンジ進捗更新
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  progress: number
): Promise<UserChallenge> {
  try {
    const [updatedUserChallenge] = await db
      .update(userChallenges)
      .set({
        progress,
        updatedAt: new Date(),
        ...(progress >= 100 ? { isCompleted: true, completedAt: new Date() } : {})
      })
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId)
      ))
      .returning();

    return updatedUserChallenge;
  } catch (error) {
    console.error('Failed to update challenge progress:', error);
    throw new Error('チャレンジ進捗の更新に失敗しました');
  }
}