import { eq, desc, and, sql } from 'drizzle-orm';

import { db } from '../index';
import {
  challenges,
  userChallenges,
  challengeRequirements,
  challengeRewards,
  users,
  type Challenge,
  type UserChallenge,
  type ChallengeRequirement,
  type ChallengeReward,
  type InsertChallenge,
  type InsertChallengeRequirement,
  type InsertChallengeReward,
} from '../schema';

// 全チャレンジ取得
export async function getAllChallenges(): Promise<(Challenge & {
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
})[]> {
  try {
    const challengeList = await db
      .select()
      .from(challenges)
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
    console.error('Failed to get all challenges:', error);
    throw new Error('全チャレンジの取得に失敗しました');
  }
}

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

    // 進捗更新後、ランキングを再計算
    if (progress >= 100) {
      await updateChallengeRankings(challengeId);
    }

    return updatedUserChallenge;
  } catch (error) {
    console.error('Failed to update challenge progress:', error);
    throw new Error('チャレンジ進捗の更新に失敗しました');
  }
}

// チャレンジのリーダーボード取得
export async function getChallengeLeaderboard(challengeId: string): Promise<(UserChallenge & {
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
})[]> {
  try {
    const leaderboard = await db
      .select({
        id: userChallenges.id,
        userId: userChallenges.userId,
        challengeId: userChallenges.challengeId,
        joinedAt: userChallenges.joinedAt,
        progress: userChallenges.progress,
        isCompleted: userChallenges.isCompleted,
        completedAt: userChallenges.completedAt,
        rank: userChallenges.rank,
        createdAt: userChallenges.createdAt,
        updatedAt: userChallenges.updatedAt,
        user: {
          id: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        }
      })
      .from(userChallenges)
      .leftJoin(users, eq(userChallenges.userId, users.id))
      .where(eq(userChallenges.challengeId, challengeId))
      .orderBy(desc(userChallenges.progress), desc(userChallenges.completedAt))
      .limit(50); // 上位50位まで表示

    return leaderboard;
  } catch (error) {
    console.error('Failed to get challenge leaderboard:', error);
    throw new Error('リーダーボードの取得に失敗しました');
  }
}

// チャレンジランキング再計算（進捗に基づいて順位を更新）
async function updateChallengeRankings(challengeId: string): Promise<void> {
  try {
    // 完了したユーザーを進捗と完了時間でソート
    const completedUsers = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.challengeId, challengeId),
        eq(userChallenges.isCompleted, true)
      ))
      .orderBy(desc(userChallenges.progress), userChallenges.completedAt);

    // 順位を更新
    for (let i = 0; i < completedUsers.length; i++) {
      const user = completedUsers[i];
      await db
        .update(userChallenges)
        .set({ 
          rank: i + 1,
          updatedAt: new Date()
        })
        .where(eq(userChallenges.id, user.id));
    }
  } catch (error) {
    console.error('Failed to update challenge rankings:', error);
    // ランキング更新は重要ではないので、エラーをスローしない
  }
}

// チャレンジ報酬取得
export async function getChallengeRewards(challengeId: string): Promise<ChallengeReward[]> {
  try {
    const rewards = await db
      .select()
      .from(challengeRewards)
      .where(eq(challengeRewards.challengeId, challengeId));

    return rewards;
  } catch (error) {
    console.error('Failed to get challenge rewards:', error);
    throw new Error('チャレンジ報酬の取得に失敗しました');
  }
}

// チャレンジ報酬受け取り（ユーザーのXPやバッジを更新）
export async function claimChallengeReward(
  userId: string, 
  challengeId: string
): Promise<{ success: boolean; rewards: ChallengeReward[] }> {
  try {
    // ユーザーがチャレンジを完了しているか確認
    const userChallenge = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId),
        eq(userChallenges.isCompleted, true)
      ))
      .limit(1);

    if (userChallenge.length === 0) {
      throw new Error('チャレンジが完了していません');
    }

    // 報酬情報を取得
    const rewards = await getChallengeRewards(challengeId);
    
    // 報酬処理はここで実装
    // 例: XP付与、バッジ付与など
    // 実際の実装では user-profiles queries を使用

    return { success: true, rewards };
  } catch (error) {
    console.error('Failed to claim challenge reward:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('報酬の受け取りに失敗しました');
  }
}

// タイプ別チャレンジ取得
export async function getChallengesByType(type: string): Promise<(Challenge & {
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
})[]> {
  try {
    const challengeList = await db
      .select()
      .from(challenges)
      .where(eq(challenges.type, type))
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
    console.error('Failed to get challenges by type:', error);
    throw new Error('タイプ別チャレンジの取得に失敗しました');
  }
}

// チャレンジ詳細取得
export async function getChallengesWithDetails(): Promise<(Challenge & {
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  participantCount: number;
})[]> {
  try {
    // getAllChallenges と同じだが、参加者数情報も含む
    return await getAllChallenges();
  } catch (error) {
    console.error('Failed to get challenges with details:', error);
    throw new Error('チャレンジ詳細の取得に失敗しました');
  }
}

// チャレンジを IDで取得
export async function getChallengeById(challengeId: string): Promise<Challenge | null> {
  try {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    return challenge || null;
  } catch (error) {
    console.error('Failed to get challenge by id:', error);
    throw new Error('チャレンジの取得に失敗しました');
  }
}

// ユーザーがすでにチャレンジに参加済みかチェック
export async function isUserAlreadyJoined(userId: string, challengeId: string): Promise<boolean> {
  try {
    const [existingRecord] = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId)
      ))
      .limit(1);

    return !!existingRecord;
  } catch (error) {
    console.error('Failed to check if user already joined:', error);
    throw new Error('参加状況の確認に失敗しました');
  }
}