import type { GameNotification } from '@/lib/db/schema';

export const mockGameNotifications: GameNotification[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'level_up',
    title: 'レベルアップ！',
    message: 'レベル12に到達しました！継続の力を感じますね。',
    data: JSON.stringify({ level: 12, xpGained: 100 }),
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    userId: 'user1',
    type: 'badge_unlocked',
    title: '新しいバッジを獲得！',
    message: '「習慣マスター」バッジを獲得しました！',
    data: JSON.stringify({ badgeId: 'badge1', badgeName: '習慣マスター' }),
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    userId: 'user1',
    type: 'streak_milestone',
    title: 'ストリーク記録更新！',
    message: '45日連続でルーティンを実行中！すごいですね。',
    data: JSON.stringify({ streak: 45, milestone: 45 }),
    isRead: false,
    createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    userId: 'user1',
    type: 'mission_completed',
    title: 'ミッション完了！',
    message: '「習慣の第一歩」ミッションを完了しました！',
    data: JSON.stringify({ missionId: '1', missionName: '習慣の第一歩', xpReward: 50 }),
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    userId: 'user2',
    type: 'level_up',
    title: 'レベルアップ！',
    message: 'レベル5に到達しました！順調な成長ですね。',
    data: JSON.stringify({ level: 5, xpGained: 80 }),
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    userId: 'user2',
    type: 'xp_milestone',
    title: 'XP記録達成！',
    message: '総XP 500を達成しました！',
    data: JSON.stringify({ totalXP: 680, milestone: 500 }),
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '7',
    userId: 'user3',
    type: 'challenge_completed',
    title: 'チャレンジ完了！',
    message: '「ウィークリー完璧主義者」チャレンジを完了しました！',
    data: JSON.stringify({ challengeId: '2', challengeName: 'ウィークリー完璧主義者', rank: 1 }),
    isRead: true,
    createdAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '8',
    userId: 'user3',
    type: 'badge_unlocked',
    title: '新しいバッジを獲得！',
    message: '「伝説の継続者」バッジを獲得しました！',
    data: JSON.stringify({ badgeId: 'badge3', badgeName: '伝説の継続者' }),
    isRead: false,
    createdAt: new Date(Date.now() - 0.02 * 24 * 60 * 60 * 1000),
  },
];

// Mock関数 - lib/db/queries/game-notifications.ts に対応
export const getMockGameNotifications = (userId: string): GameNotification[] => {
  return mockGameNotifications.filter(notification => notification.userId === userId);
};

export const getMockUnreadNotifications = (userId: string): GameNotification[] => {
  return mockGameNotifications.filter(notification => 
    notification.userId === userId && !notification.isRead
  );
};

export const mockCreateNotification = (
  notificationData: Omit<GameNotification, 'id' | 'createdAt'>
): GameNotification => {
  const newNotification: GameNotification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    ...notificationData,
    createdAt: new Date(),
  };
  
  mockGameNotifications.push(newNotification);
  return newNotification;
};

export const mockMarkNotificationAsRead = (notificationId: string): GameNotification => {
  const notification = mockGameNotifications.find(n => n.id === notificationId);
  if (!notification) {
    throw new Error('通知が見つかりません');
  }
  
  notification.isRead = true;
  return notification;
};

export const mockMarkAllNotificationsAsRead = (userId: string): void => {
  mockGameNotifications.forEach(notification => {
    if (notification.userId === userId) {
      notification.isRead = true;
    }
  });
};

export const mockDeleteNotification = (notificationId: string): void => {
  const index = mockGameNotifications.findIndex(n => n.id === notificationId);
  if (index === -1) {
    throw new Error('通知が見つかりません');
  }
  
  mockGameNotifications.splice(index, 1);
};