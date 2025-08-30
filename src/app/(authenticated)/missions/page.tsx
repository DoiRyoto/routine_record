import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { getCurrentUser } from '@/lib/auth/server';
import { 
  MissionsGetResponseSchema,
  UserMissionsGetResponseSchema
} from '@/lib/schemas/api-response';

import { MissionsPage } from './MissionsPage';

async function handleClaimReward(missionId: string) {
  'use server';
  const user = await getCurrentUser();
  if (!user?.id) return;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'complete',
        userId: user.id,
        missionId
      })
    });

    if (!response.ok) {
      throw new Error('ミッション完了に失敗しました');
    }

    // TODO: 成功時のリダイレクトやリロード
  } catch (error) {
    console.error('Failed to claim reward:', error);
  }
}

async function handleFilterChange(filters: { type?: string; difficulty?: string; category?: string }) {
  'use server';
  // フィルター処理は通常クライアントサイドで行うため、ここでは何もしない
  console.warn('Filter changed:', filters);
}

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            ミッションを表示するにはログインが必要です
          </h1>
          <p className="text-text-secondary mb-6">
            アカウントにサインインしてミッションを表示してください。
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
    // API Routes経由でミッションデータを取得
    const [missionsResponse, userMissionsResponse] = await Promise.all([
      serverTypedGet('/api/missions', MissionsGetResponseSchema),
      serverTypedGet(`/api/user-missions?userId=${user.id}`, UserMissionsGetResponseSchema),
    ]);

    return (
      <MissionsPage
        missions={missionsResponse.data || []}
        userMissions={userMissionsResponse.data || []}
        onClaimReward={handleClaimReward}
        onFilterChange={handleFilterChange}
      />
    );
  } catch (error) {
    console.error('Failed to fetch missions data:', error);
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            ミッションデータ読み込みエラー
          </h1>
          <p className="text-text-secondary mb-6">
            ミッション情報を読み込めませんでした。しばらくしてから再度お試しください。
          </p>
        </div>
      </div>
    );
  }
}