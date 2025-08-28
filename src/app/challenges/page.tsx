import { getCurrentUser } from '@/lib/auth/server';

import { ChallengesPage } from './ChallengesPage';

async function getChallengesData(_userId?: string) {
  try {
    // 現在はモックデータを返す（API実装まで）
    const mockChallenges: any[] = [];
    const mockUserChallenges: any[] = [];

    return {
      challenges: mockChallenges,
      userChallenges: mockUserChallenges
    };
  } catch (error) {
    console.error('Failed to fetch challenges data:', error);
    throw error;
  }
}

async function handleJoinChallenge(challengeId: string) {
  'use server';
  const user = await getCurrentUser();
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
}

async function handleLeaveChallenge(challengeId: string) {
  'use server';
  const user = await getCurrentUser();
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
}

export default async function Page() {
  const user = await getCurrentUser();
  const { challenges, userChallenges } = await getChallengesData(user?.id);

  return (
    <ChallengesPage
      challenges={challenges}
      userChallenges={userChallenges}
      onJoinChallenge={handleJoinChallenge}
      onLeaveChallenge={handleLeaveChallenge}
    />
  );
}
