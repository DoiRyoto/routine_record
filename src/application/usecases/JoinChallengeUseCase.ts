import {
  getChallengeById,
  joinChallenge,
  isUserAlreadyJoined
} from '@/lib/db/queries/challenges';
import type { Challenge, UserChallenge } from '@/lib/db/schema';

export interface JoinChallengeRequest {
  userId: string;
  challengeId: string;
}

export interface JoinChallengeResponse {
  userChallenge: UserChallenge;
  challenge: Challenge;
}

export class JoinChallengeUseCase {
  async execute(request: JoinChallengeRequest): Promise<JoinChallengeResponse> {
    const { userId, challengeId } = request;

    // チャレンジの存在確認
    const challenge = await getChallengeById(challengeId);
    if (!challenge) {
      throw new Error('チャレンジが見つかりません');
    }

    // アクティブチェック
    if (!challenge.isActive) {
      throw new Error('このチャレンジは現在参加できません');
    }

    // 期間チェック
    const now = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    
    if (now < startDate) {
      throw new Error('このチャレンジはまだ開始されていません');
    }
    
    if (now > endDate) {
      throw new Error('このチャレンジの参加期限が過ぎています');
    }

    // 参加者数上限チェック
    if (challenge.maxParticipants && challenge.participants >= challenge.maxParticipants) {
      throw new Error('このチャレンジは満員です');
    }

    // 重複参加チェック
    const alreadyJoined = await isUserAlreadyJoined(userId, challengeId);
    if (alreadyJoined) {
      throw new Error('既にこのチャレンジに参加しています');
    }

    // チャレンジ参加処理
    const userChallenge = await joinChallenge(userId, challengeId);

    // 更新されたチャレンジ情報を取得
    const updatedChallenge = await getChallengeById(challengeId);

    return {
      userChallenge,
      challenge: updatedChallenge || challenge
    };
  }
}