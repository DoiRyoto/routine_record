'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge, UserBadge } from '@/lib/db/schema';
import { cn } from '@/lib/ui-utils';

// Types
interface BadgeWithUserData extends Badge {
  userBadge?: UserBadge;
  isEarned: boolean;
}

interface BadgesPageProps {
  className?: string;
}

type FilterType = 'all' | 'earned' | 'unearned' | 'new';
type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

// BadgeCard component
interface BadgeCardProps {
  badge: BadgeWithUserData;
  onClick: () => void;
  className?: string;
}

function BadgeCard({ badge, onClick, className }: BadgeCardProps) {
  const getRarityColor = (rarity: RarityType) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const isNew = badge.userBadge?.isNew || false;

  return (
    <Card 
      className={cn(
        'relative p-4 cursor-pointer transition-all duration-200 hover:shadow-lg',
        getRarityColor(badge.rarity),
        !badge.isEarned && 'opacity-50 grayscale',
        isNew && 'ring-2 ring-yellow-400 animate-pulse',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${badge.name}バッジ${badge.isEarned ? '（取得済み）' : '（未取得）'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* NEW badge */}
      {isNew && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
          NEW
        </div>
      )}

      {/* Badge icon placeholder */}
      <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
        {badge.iconUrl ? (
          <Image 
            src={badge.iconUrl} 
            alt={`${badge.name}のアイコン`}
            width={64}
            height={64}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          '🏆'
        )}
      </div>

      {/* Badge name */}
      <h3 className={cn(
        'text-sm font-semibold text-center mb-2 truncate',
        badge.isEarned ? 'text-gray-900' : 'text-gray-500'
      )}>
        {badge.name}
      </h3>

      {/* Rarity */}
      <div className={cn(
        'text-xs text-center capitalize font-medium',
        badge.rarity === 'common' && 'text-gray-600',
        badge.rarity === 'rare' && 'text-blue-600', 
        badge.rarity === 'epic' && 'text-purple-600',
        badge.rarity === 'legendary' && 'text-yellow-600'
      )}>
        {badge.rarity}
      </div>

      {/* Earned date or status */}
      {badge.isEarned && badge.userBadge ? (
        <div className="text-xs text-gray-500 text-center mt-1">
          {new Date(badge.userBadge.earnedAt).toLocaleDateString('ja-JP')}
        </div>
      ) : (
        <div className="text-xs text-gray-400 text-center mt-1">
          未取得
        </div>
      )}
    </Card>
  );
}

// BadgeDetailModal component
interface BadgeDetailModalProps {
  badge: BadgeWithUserData | null;
  isOpen: boolean;
  onClose: () => void;
}

function BadgeDetailModal({ badge, isOpen, onClose }: BadgeDetailModalProps) {
  if (!badge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
              {badge.iconUrl ? (
                <Image 
                  src={badge.iconUrl} 
                  alt={`${badge.name}のアイコン`}
                  width={48}
                  height={48}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                '🏆'
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">{badge.name}</h2>
              <span className={cn(
                'text-sm capitalize',
                badge.rarity === 'common' && 'text-gray-600',
                badge.rarity === 'rare' && 'text-blue-600',
                badge.rarity === 'epic' && 'text-purple-600', 
                badge.rarity === 'legendary' && 'text-yellow-600'
              )}>
                {badge.rarity}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-sm mb-1">説明</h3>
            <p className="text-gray-600 text-sm">{badge.description}</p>
          </div>

          {/* Category */}
          <div>
            <h3 className="font-semibold text-sm mb-1">カテゴリ</h3>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {badge.category}
            </span>
          </div>

          {/* Earned status */}
          {badge.isEarned && badge.userBadge ? (
            <div>
              <h3 className="font-semibold text-sm mb-1">取得日時</h3>
              <p className="text-gray-600 text-sm">
                {new Date(badge.userBadge.earnedAt).toLocaleString('ja-JP')}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-sm mb-1">取得条件</h3>
              <p className="text-gray-600 text-sm">
                このバッジはまだ取得されていません。条件を満たすと自動で獲得できます。
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Filter component
interface BadgeFiltersProps {
  categories: string[];
  rarities: RarityType[];
  selectedFilter: FilterType;
  selectedCategory: string;
  selectedRarity: string;
  onFilterChange: (filter: FilterType) => void;
  onCategoryChange: (category: string) => void;
  onRarityChange: (rarity: string) => void;
  onReset: () => void;
}

function BadgeFilters({
  categories,
  rarities,
  selectedFilter,
  selectedCategory,
  selectedRarity,
  onFilterChange,
  onCategoryChange,
  onRarityChange,
  onReset
}: BadgeFiltersProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <h3 className="w-full text-sm font-semibold text-gray-700 mb-2">取得状況</h3>
        {[
          { key: 'all' as FilterType, label: '全て' },
          { key: 'earned' as FilterType, label: '取得済み' },
          { key: 'unearned' as FilterType, label: '未取得' },
          { key: 'new' as FilterType, label: '新規' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              selectedFilter === key
                ? 'bg-blue text-white'
                : 'bg-gray text-gray hover:bg-gray/70'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <h3 className="w-full text-sm font-semibold text-gray-700 mb-2">カテゴリ</h3>
        <button
          onClick={() => onCategoryChange('')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            selectedCategory === ''
              ? 'bg-blue text-white'
              : 'bg-gray text-gray hover:bg-gray/70'
          )}
        >
          全て
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === category
                ? 'bg-blue text-white'
                : 'bg-gray text-gray hover:bg-gray/70'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <h3 className="w-full text-sm font-semibold text-gray-700 mb-2">レア度</h3>
        <button
          onClick={() => onRarityChange('')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            selectedRarity === ''
              ? 'bg-blue text-white'
              : 'bg-gray text-gray hover:bg-gray/70'
          )}
        >
          全て
        </button>
        {rarities.map(rarity => (
          <button
            key={rarity}
            onClick={() => onRarityChange(rarity)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize',
              selectedRarity === rarity
                ? 'bg-blue text-white'
                : 'bg-gray text-gray hover:bg-gray/70'
            )}
          >
            {rarity}
          </button>
        ))}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReset}
        className="w-full"
      >
        フィルターリセット
      </Button>
    </Card>
  );
}

// Main BadgesPage component
export function BadgesPage({ className }: BadgesPageProps) {
  const [badges, setBadges] = useState<BadgeWithUserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithUserData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filters
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');

  // Fetch badges data
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all badges
        const badgesResponse = await fetch('/api/badges');
        if (!badgesResponse.ok) {
          throw new Error('Failed to fetch badges');
        }
        const badgesData = await badgesResponse.json();

        // Fetch user badges
        const userBadgesResponse = await fetch('/api/user-badges');
        if (!userBadgesResponse.ok) {
          throw new Error('Failed to fetch user badges');
        }
        const userBadgesData = await userBadgesResponse.json();

        // Merge badges with user data
        const userBadgeMap = new Map(
          (userBadgesData.userBadges || []).map((ub: UserBadge & { badgeId: string }) => [ub.badgeId, ub])
        );

        const mergedBadges: BadgeWithUserData[] = (badgesData.badges || []).map((badge: Badge) => ({
          ...badge,
          userBadge: userBadgeMap.get(badge.id),
          isEarned: userBadgeMap.has(badge.id)
        }));

        setBadges(mergedBadges);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setBadges([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []);

  // Get unique categories and rarities
  const { categories, rarities } = useMemo(() => {
    const cats = [...new Set(badges.map(b => b.category))];
    const rars = [...new Set(badges.map(b => b.rarity))] as RarityType[];
    return { categories: cats, rarities: rars };
  }, [badges]);

  // Filter badges
  const filteredBadges = useMemo(() => {
    return badges.filter(badge => {
      // Filter by status
      if (selectedFilter === 'earned' && !badge.isEarned) return false;
      if (selectedFilter === 'unearned' && badge.isEarned) return false;
      if (selectedFilter === 'new' && !badge.userBadge?.isNew) return false;

      // Filter by category
      if (selectedCategory && badge.category !== selectedCategory) return false;

      // Filter by rarity
      if (selectedRarity && badge.rarity !== selectedRarity) return false;

      return true;
    });
  }, [badges, selectedFilter, selectedCategory, selectedRarity]);

  // Statistics
  const stats = useMemo(() => {
    const total = badges.length;
    const earned = badges.filter(b => b.isEarned).length;
    const newBadges = badges.filter(b => b.userBadge?.isNew).length;
    
    return {
      total,
      earned,
      unearned: total - earned,
      new: newBadges,
      completionRate: total > 0 ? Math.round((earned / total) * 100) : 0
    };
  }, [badges]);

  const handleBadgeClick = async (badge: BadgeWithUserData) => {
    setSelectedBadge(badge);
    setIsDetailOpen(true);

    // Mark as viewed if it's a new badge
    if (badge.userBadge?.isNew) {
      try {
        await fetch('/api/user-badges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'markViewed',
            userId: badge.userBadge.userId,
            badgeId: badge.id
          })
        });

        // Update local state
        setBadges(prev => prev.map(b => 
          b.id === badge.id && b.userBadge
            ? { ...b, userBadge: { ...b.userBadge, isNew: false } }
            : b
        ));
      } catch (err) {
        console.error('Failed to mark badge as viewed:', err);
      }
    }
  };

  const handleReset = () => {
    setSelectedFilter('all');
    setSelectedCategory('');
    setSelectedRarity('');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange/5 to-yellow/10 dark:from-black dark:via-orange/5 dark:to-yellow/10">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              再試行
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-white via-orange/5 to-yellow/10 dark:from-black dark:via-orange/5 dark:to-yellow/10',
      className
    )}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-orange/90 to-yellow/90 text-white rounded-2xl p-8 shadow-xl backdrop-blur-md border border-white/20 dark:border-white/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
              🏆
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">バッジコレクション</h1>
              <p className="text-white/80 text-lg">
                あなたの実績を確認して、新しい目標に挑戦しよう！
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLoading ? '-' : stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">総バッジ数</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '-' : stats.earned}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">取得済み</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-500">
              {isLoading ? '-' : stats.unearned}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">未取得</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? '-' : stats.new}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">新規</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '-' : `${stats.completionRate}%`}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">達成率</div>
          </Card>
        </div>

        {/* Filters */}
        <BadgeFilters
          categories={categories}
          rarities={rarities}
          selectedFilter={selectedFilter}
          selectedCategory={selectedCategory}
          selectedRarity={selectedRarity}
          onFilterChange={setSelectedFilter}
          onCategoryChange={setSelectedCategory}
          onRarityChange={setSelectedRarity}
          onReset={handleReset}
        />

        {/* Badges Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
                <Skeleton className="h-4 mb-2" />
                <Skeleton className="h-3 w-1/2 mx-auto" />
              </Card>
            ))}
          </div>
        ) : filteredBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => handleBadgeClick(badge)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              バッジが見つかりません
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              選択した条件に一致するバッジがありません。
            </p>
            <Button onClick={handleReset}>
              フィルターをリセット
            </Button>
          </Card>
        )}

        {/* Badge Detail Modal */}
        <BadgeDetailModal
          badge={selectedBadge}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </div>
  );
}