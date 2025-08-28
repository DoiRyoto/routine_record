import { eq, desc, and, gte, lte, sum } from 'drizzle-orm';

import { db } from '../index';
import {
  xpTransactions,
  type XPTransaction,
  type InsertXPTransaction,
} from '../schema';

// ユーザーのXP履歴取得
export async function getXPHistory(
  userId: string, 
  limit = 50, 
  offset = 0
): Promise<XPTransaction[]> {
  try {
    const transactions = await db
      .select()
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId))
      .orderBy(desc(xpTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return transactions;
  } catch (error) {
    console.error('Failed to get XP history:', error);
    throw new Error('XP履歴の取得に失敗しました');
  }
}

// 期間別XP履歴取得
export async function getXPHistoryByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<XPTransaction[]> {
  try {
    const transactions = await db
      .select()
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.userId, userId),
          gte(xpTransactions.createdAt, startDate),
          lte(xpTransactions.createdAt, endDate)
        )
      )
      .orderBy(desc(xpTransactions.createdAt));

    return transactions;
  } catch (error) {
    console.error('Failed to get XP history by date range:', error);
    throw new Error('期間別XP履歴の取得に失敗しました');
  }
}

// ソース別XP履歴取得
export async function getXPHistoryBySource(
  userId: string,
  sourceType: 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock',
  limit = 50
): Promise<XPTransaction[]> {
  try {
    const transactions = await db
      .select()
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.userId, userId),
          eq(xpTransactions.sourceType, sourceType)
        )
      )
      .orderBy(desc(xpTransactions.createdAt))
      .limit(limit);

    return transactions;
  } catch (error) {
    console.error('Failed to get XP history by source:', error);
    throw new Error('ソース別XP履歴の取得に失敗しました');
  }
}

// XPトランザクション記録
export async function createXPTransaction(
  transactionData: InsertXPTransaction
): Promise<XPTransaction> {
  try {
    const [newTransaction] = await db
      .insert(xpTransactions)
      .values(transactionData)
      .returning();

    return newTransaction;
  } catch (error) {
    console.error('Failed to create XP transaction:', error);
    throw new Error('XPトランザクションの記録に失敗しました');
  }
}

// 総獲得XP計算
export async function getTotalXPEarned(userId: string): Promise<number> {
  try {
    const result = await db
      .select({
        totalXP: sum(xpTransactions.amount)
      })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId));

    return Number(result[0]?.totalXP) || 0;
  } catch (error) {
    console.error('Failed to get total XP earned:', error);
    throw new Error('総獲得XPの計算に失敗しました');
  }
}

// 日別XP統計
export async function getDailyXPStats(
  userId: string,
  days = 30
): Promise<{ date: Date; totalXP: number }[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await db
      .select({
        date: xpTransactions.createdAt,
        amount: xpTransactions.amount,
      })
      .from(xpTransactions)
      .where(
        and(
          eq(xpTransactions.userId, userId),
          gte(xpTransactions.createdAt, startDate)
        )
      )
      .orderBy(xpTransactions.createdAt);

    // 日別に集計
    const dailyStats = new Map<string, number>();
    
    transactions.forEach(transaction => {
      const dateKey = transaction.date.toISOString().split('T')[0];
      dailyStats.set(dateKey, (dailyStats.get(dateKey) || 0) + transaction.amount);
    });

    // 結果を配列に変換
    const result = Array.from(dailyStats.entries()).map(([dateStr, totalXP]) => ({
      date: new Date(dateStr),
      totalXP
    }));

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (error) {
    console.error('Failed to get daily XP stats:', error);
    throw new Error('日別XP統計の取得に失敗しました');
  }
}