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
    // 現在はモックデータを返す（API実装まで）
    const mockProfile = {
      userId,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      nextLevelXP: 100,
      streak: 0,
      longestStreak: 0,
      totalRoutines: 0,
      totalExecutions: 0,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      badges: [], // UserBadgeWithBadge[]
      title: undefined // optional title
    };
    
    const mockStreakData = { 
      current: 0, 
      longest: 0, 
      freezeCount: 0, 
      lastActiveDate: new Date() 
    };

    return {
      userProfile: mockProfile,
      streakData: mockStreakData
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
      userProfile={userProfile}
      streakData={streakData}
      onTitleChange={handleTitleChange}
    />
  );
}