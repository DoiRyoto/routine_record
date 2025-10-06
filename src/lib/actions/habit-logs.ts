'use server';

import { revalidatePath } from 'next/cache';

import { serverTypedPost } from '@/lib/api-client/server-fetch';
import { HabitLogPostResponseSchema } from '@/lib/schemas/api-response';

export async function executeHabitAction(habitId: string) {
  try {
    if (!habitId) {
      return {
        success: false,
        error: '習慣IDが必要です',
      };
    }

    const result = await serverTypedPost(
      '/api/habit-logs',
      HabitLogPostResponseSchema,
      { habitId }
    );

    revalidatePath('/');

    return {
      success: true,
      message: result.data?.message || '実行記録が追加されました',
    };
  } catch (error) {
    console.error('Failed to execute habit:', error);
    return {
      success: false,
      error: '実行記録の追加に失敗しました',
    };
  }
}
