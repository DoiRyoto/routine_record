import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { getCurrentUser } from '@/lib/auth/server';
import { UserProfileGetResponseSchema } from '@/lib/schemas/api-response';

import { ProfilePage } from './ProfilePage';

export default async function Page() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            プロフィールを表示するにはログインが必要です
          </h1>
          <p className="text-text-secondary mb-6">
            アカウントにサインインしてプロフィールを表示してください。
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
    // API Routes経由でUserProfile取得（バッジ情報も含める）
    const userProfileResponse = await serverTypedGet(
      `/api/user-profiles?userId=${user.id}&includeDetails=true`, 
      UserProfileGetResponseSchema
    );

    if (!userProfileResponse.data) {
      throw new Error('ユーザープロフィールを取得できませんでした');
    }

    const userProfile = userProfileResponse.data;
    
    // ProfilePageが期待するUserProfileWithBadges型に合わせる
    const userProfileWithBadges = {
      ...userProfile,
      badges: [], // API実装が完了するまで空配列
      title: undefined,
    };
    
    const streakData = {
      current: userProfile.streak,
      longest: userProfile.longestStreak,
      freezeCount: 1, // スキーマにないためハードコード
      lastActiveDate: userProfile.lastActiveAt,
    };

    const handleTitleChange = async (title: string) => {
      'use server';
      if (!user?.id) return;

      try {
        console.warn('Updating title for user:', { userId: user.id, title });
        // TODO: API実装後に有効化
      } catch (error) {
        console.error('Failed to update title:', error);
      }
    };

    return (
      <ProfilePage
        userProfile={userProfileWithBadges}
        streakData={streakData}
        onTitleChange={handleTitleChange}
      />
    );
  } catch (error) {
    console.error('Failed to fetch profile data:', error);
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            プロフィール読み込みエラー
          </h1>
          <p className="text-text-secondary mb-6">
            プロフィール情報を読み込めませんでした。しばらくしてから再度お試しください。
          </p>
        </div>
      </div>
    );
  }
}