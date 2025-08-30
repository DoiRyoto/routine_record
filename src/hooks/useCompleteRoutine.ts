import { useState, useCallback } from 'react';

// 型定義
export interface CompleteRoutineResponse {
  success: boolean;
  xpGained: number;
  newLevel?: number;
  newBadges?: Array<{
    id: string;
    name: string;
    iconUrl: string;
  }>;
}

export interface UseCompleteRoutineOptions {
  onComplete?: (result: CompleteRoutineResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseCompleteRoutineReturn {
  completeRoutine: (routineId: string) => Promise<CompleteRoutineResponse>;
  isCompleting: boolean;
  error: Error | null;
}

export function useCompleteRoutine(options: UseCompleteRoutineOptions = {}): UseCompleteRoutineReturn {
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const completeRoutine = useCallback(async (routineId: string): Promise<CompleteRoutineResponse> => {
    setIsCompleting(true);
    setError(null);

    try {
      const response = await fetch('/api/execution-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routineId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const result: CompleteRoutineResponse = await response.json();

      // 成功コールバック実行
      if (options.onComplete) {
        options.onComplete(result);
      }

      return result;
    } catch (err) {
      let error: Error;

      if (err instanceof Error) {
        // ネットワークエラーの場合はメッセージを分かりやすくする
        if (err.message.includes('fetch')) {
          error = new Error('ネットワークエラーが発生しました');
        } else {
          error = err;
        }
      } else {
        error = new Error('不明なエラーが発生しました');
      }

      setError(error);

      // エラーコールバック実行
      if (options.onError) {
        options.onError(error);
      }

      // エラーを再スロー
      throw error;
    } finally {
      setIsCompleting(false);
    }
  }, [options]);

  return {
    completeRoutine,
    isCompleting,
    error,
  };
}