import { ProfilePage } from './ProfilePage';
import { getCurrentUser } from '@/lib/auth/server';
import { getUserProfile, createUserProfile } from '@/lib/db/queries/user-profiles';
import { getStreakData } from '@/lib/db/queries/gamification';

async function getProfileData(userId?: string) {
  if (!userId) {
    return {
      userProfile: null,
      streakData: null
    };
  }

  try {
    let userProfile = await getUserProfile(userId);
    
    // ユーザープロフィールがない場合は作成
    if (!userProfile) {
      userProfile = await createUserProfile({
        userId,
        level: 1,
        totalXP: 0,
        currentXP: 0,
        nextLevelXP: 100,
        streak: 0,
        longestStreak: 0,
        totalRoutines: 0,
        totalExecutions: 0
      });
    }

    // バッジ情報とストリークデータを取得
    const [badges, streakData] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-badges?userId=${userId}`)
        .then(res => res.json())
        .catch(() => []),
      getStreakData(userId)
    ]);

    const profileWithBadges = {
      ...userProfile,
      badges: badges || []
    };

    return {
      userProfile: profileWithBadges,
      streakData
    };
  } catch (error) {
    console.error('Failed to fetch profile data:', error);
    
    // エラー時はモックデータを返す
    const mockUserProfile = {
      userId,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      nextLevelXP: 100,
      badges: [],
      streak: 0,
      longestStreak: 0,
      totalRoutines: 0,
      totalExecutions: 0,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
    };

    const mockStreakData = {
      current: 0,
      longest: 0,
      lastExecutionDate: null,
      freezesUsed: 0,
      freezesAvailable: 3,
    };

    return {
      userProfile: mockUserProfile,
      streakData: mockStreakData
    };
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