import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { getCurrentUser } from '@/lib/auth/server';
import { 
  ChallengesGetResponseSchema, 
  UserChallengesGetResponseSchema 
} from '@/lib/schemas/api-response';

import { ChallengesPage } from './ChallengesPage';

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
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            チャレンジを表示するにはログインが必要です
          </h1>
          <p className="text-text-secondary mb-6">
            アカウントにサインインしてチャレンジを表示してください。
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            サインイン
          </a>
        </div>
      </div>
    );
  }

  try {
    // API Routes経由でチャレンジデータを取得
    const [challengesResponse, userChallengesResponse] = await Promise.all([
      serverTypedGet('/api/challenges', ChallengesGetResponseSchema),
      serverTypedGet(`/api/user-challenges?userId=${user.id}`, UserChallengesGetResponseSchema),
    ]);

    return (
      <ChallengesPage
        challenges={challengesResponse.data || []}
        userChallenges={userChallengesResponse.data || []}
        onJoinChallenge={handleJoinChallenge}
        onLeaveChallenge={handleLeaveChallenge}
      />
    );
  } catch (error) {
    console.error('Failed to fetch challenges data:', error);
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            チャレンジデータ読み込みエラー
          </h1>
          <p className="text-text-secondary mb-6">
            チャレンジ情報を読み込めませんでした。しばらくしてから再度お試しください。
          </p>
        </div>
      </div>
    );
  }
}
