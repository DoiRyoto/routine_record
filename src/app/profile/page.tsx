import { getCurrentUser } from '@/lib/auth/server';

import { ProfilePage } from './ProfilePage';

async function getProfileData(userId?: string) {
  if (!userId) {
    return {
      userProfile: null,
      streakData: null
    };
  }

  try {
    // API Route経由でユーザープロフィール情報を取得
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const [profileResponse, streakResponse] = await Promise.all([
      fetch(`${baseUrl}/api/user-profiles?userId=${userId}&includeDetails=true`)
        .then(res => res.json()),
      fetch(`${baseUrl}/api/gamification?type=stats&userId=${userId}`)
        .then(res => res.json())
    ]);

    // ユーザープロフィールがない場合は作成
    if (profileResponse.error && profileResponse.error.includes('見つかりません')) {
      const createResponse = await fetch(`${baseUrl}/api/user-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          userId,
          level: 1,
          totalXP: 0,
          currentXP: 0,
          nextLevelXP: 100,
          streak: 0,
          longestStreak: 0,
          totalRoutines: 0,
          totalExecutions: 0
        })
      });

      if (!createResponse.ok) {
        throw new Error('プロフィールの作成に失敗しました');
      }

      // 作成後に再度取得
      const newProfileResponse = await fetch(`${baseUrl}/api/user-profiles?userId=${userId}&includeDetails=true`)
        .then(res => res.json());
      
      return {
        userProfile: newProfileResponse.userProfile,
        streakData: newProfileResponse.streakData || streakResponse
      };
    }

    return {
      userProfile: profileResponse.userProfile,
      streakData: profileResponse.streakData || streakResponse
    };
  } catch (error) {
    console.error('Failed to fetch profile data:', error);
    throw error;
  }
}

export default async function Page() {
  const user = await getCurrentUser();
  const { userProfile, streakData } = await getProfileData(user?.id);

  if (!userProfile || !streakData) {
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

  const handleAvatarChange = async (avatarUrl: string) => {
    'use server';
    if (!user?.id) return;
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          userId: user.id,
          avatarUrl
        })
      });
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  };

  const handleTitleChange = async (title: string) => {
    'use server';
    if (!user?.id) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          userId: user.id,
          title
        })
      });
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  return (
    <ProfilePage
      userProfile={userProfile}
      streakData={streakData}
      onAvatarChange={handleAvatarChange}
      onTitleChange={handleTitleChange}
    />
  );
}