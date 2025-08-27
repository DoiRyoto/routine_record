import { ChallengesPage } from './ChallengesPage';
import { getCurrentUser } from '@/lib/auth/server';
import { getActiveChallenges, getUserChallenges } from '@/lib/db/queries/challenges';

async function getChallengesData(userId?: string) {
  try {
    const [challenges, userChallenges] = await Promise.all([
      getActiveChallenges(),
      userId ? getUserChallenges(userId) : Promise.resolve([])
    ]);

    return {
      challenges,
      userChallenges
    };
  } catch (error) {
    console.error('Failed to fetch challenges data:', error);
    
    // エラー時はMockデータを返す
    const mockChallenges = [
      {
        id: '1',
        title: '新年スタートダッシュ',
        description: '1月中に100回のルーティンを実行して2025年を最高のスタートにしよう！',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        type: 'monthly' as const,
        participants: 1247,
        maxParticipants: 2000,
        isActive: true,
        rewards: [
          {
            id: '1',
            challengeId: '1',
            name: '新年マスターバッジ',
            description: '2025年最初のチャレンジ完了者',
            badgeId: 'new-year-2025',
            requirement: 'completion',
            xpAmount: null,
            createdAt: new Date(),
          },
          {
            id: '2',
            challengeId: '1',
            name: 'XPボーナス',
            description: '完了報酬',
            xpAmount: 500,
            badgeId: null,
            requirement: 'completion',
            createdAt: new Date(),
          },
        ],
        requirements: [
          {
            id: '1',
            challengeId: '1',
            type: 'routine_count',
            value: 100,
            description: '1月中に100回のルーティンを実行',
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    const mockUserChallenges = userId ? [
      {
        id: '1',
        userId,
        challengeId: '1',
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        progress: 65,
        isCompleted: false,
        rank: 23,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ] : [];

    return {
      challenges: mockChallenges,
      userChallenges: mockUserChallenges
    };
  }
}

export default async function Page() {
  const user = await getCurrentUser();
  const { challenges, userChallenges } = await getChallengesData(user?.id);

  const handleJoinChallenge = async (challengeId: string) => {
    'use server';
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'join',
          userId: user.id,
          challengeId
        })
      });

      if (!response.ok) {
        throw new Error('チャレンジへの参加に失敗しました');
      }
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    'use server';
    if (!user?.id) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/challenges/${challengeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('チャレンジからの脱退に失敗しました');
      }
    } catch (error) {
      console.error('Failed to leave challenge:', error);
    }
  };

  return (
    <ChallengesPage
      challenges={challenges}
      userChallenges={userChallenges}
      onJoinChallenge={handleJoinChallenge}
      onLeaveChallenge={handleLeaveChallenge}
    />
  );
}
