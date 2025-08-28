'use client';

import React from 'react';

import {
  UserAvatar,
  LevelProgressBar,
  BadgeCollection,
  StreakDisplay,
  StatsCard
} from '@/components/gamification';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import type { UserProfile, UserBadge, Badge } from '@/lib/db/schema';

// UserBadge with related Badge data
type UserBadgeWithBadge = UserBadge & {
  badge: Badge;
};

// Extended UserProfile with badges
type UserProfileWithBadges = UserProfile & {
  badges: UserBadgeWithBadge[];
  title?: string;
};

interface StreakData {
  current: number;
  longest: number;
  freezeCount: number;
  lastActiveDate: Date;
}

interface ProfilePageProps {
  userProfile: UserProfileWithBadges;
  streakData: StreakData;
  onTitleChange?: (title: string) => void;
  onBadgeClick?: (badge: UserBadgeWithBadge) => void;
}

export function ProfilePage({
  userProfile,
  streakData,
  onTitleChange: _onTitleChange,
  onBadgeClick
}: ProfilePageProps) {
  // Avatar change functionality removed as onClick prop doesn't exist on UserAvatar

  // const handleTitleChange = (title: string) => {
  //   if (_onTitleChange) {
  //     _onTitleChange(title);
  //   } else {
  //     console.warn('Title changed:', title);
  //   }
  // };

  const handleBadgeClick = (badge: UserBadgeWithBadge) => {
    if (onBadgeClick) {
      onBadgeClick(badge);
    } else {
      console.warn('Badge clicked:', badge);
    }
  };
  // const [isEditing, _setIsEditing] = useState(false);

  // バッジをレアリティ別に分類
  const badgesByRarity = userProfile.badges.reduce((acc, badge) => {
    if (badge.badge) {
      const rarity = badge.badge.rarity;
      if (!acc[rarity]) acc[rarity] = [];
      acc[rarity].push(badge);
    }
    return acc;
  }, {} as Record<string, UserBadgeWithBadge[]>);

  // 最近の実績（新しいバッジ）
  const recentBadges = userProfile.badges
    .filter(badge => badge.isNew)
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* プロフィールヘッダー */}
      <Card className="p-6 bg-blue dark:bg-dark-blue text-blue dark:text-blue border-blue dark:border-dark-blue">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* アバターセクション */}
          <div className="flex-shrink-0 text-center">
            <UserAvatar
              userProfile={userProfile}
            />
            {userProfile.title && (
              <div className="mt-2 px-3 py-1 bg-rarity-rare text-white rounded-full text-sm font-medium">
                {userProfile.title}
              </div>
            )}
          </div>

          {/* プロフィール情報 */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              プレイヤー プロフィール
            </h1>
            
            <div className="mb-4">
              <LevelProgressBar
                level={userProfile.level}
                currentXP={userProfile.currentXP}
                nextLevelXP={userProfile.nextLevelXP}
                totalXP={userProfile.totalXP}
              />
            </div>

            {/* クイック統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-xp-600">{userProfile.badges.length}</div>
                <div className="text-sm text-text-secondary">バッジ</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{streakData.current}</div>
                <div className="text-sm text-text-secondary">現在のストリーク</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">{streakData.longest}</div>
                <div className="text-sm text-text-secondary">最長ストリーク</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">{userProfile.totalExecutions}</div>
                <div className="text-sm text-text-secondary">総実行回数</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ストリーク情報 */}
      <div className="grid md:grid-cols-2 gap-6">
        <StreakDisplay
          streakData={streakData}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            title="アクティブ日数"
            value={Math.floor((new Date().getTime() - userProfile.joinedAt.getTime()) / (1000 * 60 * 60 * 24))}
            subtitle="参加から"
            icon={<span className="text-lg">📅</span>}
            variant="primary"
          />
          <StatsCard
            title="総XP"
            value={userProfile.totalXP}
            icon={<span className="text-lg">⭐</span>}
            variant="success"
          />
        </div>
      </div>

      {/* バッジコレクション */}
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">🏆 バッジコレクション</h2>
          <TabsList>
            <TabsTrigger value="all">全て ({userProfile.badges.length})</TabsTrigger>
            <TabsTrigger value="recent">最新</TabsTrigger>
            <TabsTrigger value="legendary">伝説 ({badgesByRarity.legendary?.length || 0})</TabsTrigger>
            <TabsTrigger value="epic">エピック ({badgesByRarity.epic?.length || 0})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          <Card className="p-6">
            {userProfile.badges.length > 0 ? (
              <BadgeCollection
                badges={userProfile.badges as UserBadgeWithBadge[]}
                maxDisplay={24}
                showEmpty={true}
                size="md"
                onBadgeClick={handleBadgeClick}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  まだバッジがありません
                </h3>
                <p className="text-text-secondary">
                  ミッションを完了してバッジを獲得しましょう！
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card className="p-6">
            {recentBadges.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">最近獲得したバッジ</p>
                <BadgeCollection
                  badges={recentBadges as UserBadgeWithBadge[]}
                  maxDisplay={12}
                  showEmpty={false}
                  size="md"
                  onBadgeClick={handleBadgeClick}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">最近獲得したバッジがありません</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="legendary">
          <Card className="p-6">
            {badgesByRarity.legendary?.length > 0 ? (
              <BadgeCollection
                badges={badgesByRarity.legendary as UserBadgeWithBadge[]}
                showEmpty={false}
                size="lg"
                onBadgeClick={handleBadgeClick}
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👑</div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  伝説のバッジがありません
                </h3>
                <p className="text-text-secondary">
                  最も困難な挑戦を達成して伝説のバッジを獲得しましょう！
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="epic">
          <Card className="p-6">
            {badgesByRarity.epic?.length > 0 ? (
              <BadgeCollection
                badges={badgesByRarity.epic as UserBadgeWithBadge[]}
                showEmpty={false}
                size="md"
                onBadgeClick={handleBadgeClick}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🌟</div>
                <p className="text-text-secondary">
                  エピックバッジはまだありません
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* 統計サマリー */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">📊 統計サマリー</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <StatsCard
            title="参加日"
            value={userProfile.joinedAt.toLocaleDateString()}
            subtitle={`${Math.floor((new Date().getTime() - userProfile.joinedAt.getTime()) / (1000 * 60 * 60 * 24))}日前`}
            icon={<span className="text-lg">📅</span>}
            variant="default"
          />
          <StatsCard
            title="最終アクティブ"
            value={userProfile.lastActiveAt.toLocaleDateString()}
            subtitle="最後の活動"
            icon={<span className="text-lg">👤</span>}
            variant="default"
          />
          <StatsCard
            title="総ルーティン数"
            value={userProfile.totalRoutines}
            subtitle="作成したルーティン"
            icon={<span className="text-lg">📋</span>}
            variant="default"
          />
        </div>
      </Card>
    </div>
  );
}