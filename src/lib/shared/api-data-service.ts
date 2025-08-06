import type { Routine, ExecutionRecord, UserSettings } from '@/types/routine';

import type { DataService } from './data-service';

// APIから取得したroutineデータをDate型に変換
function transformRoutineFromAPI(rawRoutine: Record<string, unknown>): Routine {
  return {
    ...rawRoutine,
    createdAt: new Date(rawRoutine.createdAt as string),
    updatedAt: new Date(rawRoutine.updatedAt as string),
  } as Routine;
}

export function createApiDataService(): DataService {
  // Cookieベースの認証を使用するため、Authorizationヘッダーは不要
  const getHeaders = () => ({
    'Content-Type': 'application/json',
  });

  return {
    routines: {
      async getAll(): Promise<Routine[]> {
        const headers = getHeaders();
        const response = await fetch('/api/routines', { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ルーチン取得に失敗しました');
        }

        return data.data.map(transformRoutineFromAPI);
      },

      async getById(id: string): Promise<Routine | null> {
        const headers = getHeaders();
        const response = await fetch(`/api/routines/${id}`, { headers });

        if (response.status === 404) {
          return null;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ルーチン取得に失敗しました');
        }

        return data.data ? transformRoutineFromAPI(data.data) : null;
      },

      async create(routine: Omit<Routine, 'id' | 'createdAt'>): Promise<Routine> {
        const headers = getHeaders();
        const response = await fetch('/api/routines', {
          method: 'POST',
          headers,
          body: JSON.stringify(routine),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ルーチン作成に失敗しました');
        }

        return transformRoutineFromAPI(data.data);
      },

      async update(id: string, updates: Partial<Routine>): Promise<Routine> {
        const headers = getHeaders();
        const response = await fetch(`/api/routines/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ルーチン更新に失敗しました');
        }

        return transformRoutineFromAPI(data.data);
      },

      async delete(id: string): Promise<boolean> {
        const headers = getHeaders();
        const response = await fetch(`/api/routines/${id}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'ルーチン削除に失敗しました');
        }

        return true;
      },

      async restore(id: string): Promise<Routine> {
        const headers = getHeaders();
        const response = await fetch(`/api/routines/${id}`, {
          method: 'PATCH',
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ルーチン復元に失敗しました');
        }

        return transformRoutineFromAPI(data.data);
      },
    },

    executionRecords: {
      async getAll(): Promise<ExecutionRecord[]> {
        const headers = getHeaders();
        const response = await fetch('/api/execution-records', { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '実行記録取得に失敗しました');
        }

        return data.data.map((record: Record<string, unknown>) => ({
          ...record,
          executedAt: new Date(record.executedAt as string),
        }));
      },

      async getByRoutineId(routineId: string): Promise<ExecutionRecord[]> {
        const headers = getHeaders();
        const response = await fetch(`/api/execution-records?routineId=${routineId}`, { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '実行記録取得に失敗しました');
        }

        return data.data.map((record: Record<string, unknown>) => ({
          ...record,
          executedAt: new Date(record.executedAt as string),
        }));
      },

      async create(record: Omit<ExecutionRecord, 'id'>): Promise<ExecutionRecord> {
        const headers = getHeaders();
        const response = await fetch('/api/execution-records', {
          method: 'POST',
          headers,
          body: JSON.stringify(record),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '実行記録作成に失敗しました');
        }

        return {
          ...data.data,
          executedAt: new Date(data.data.executedAt),
        };
      },

      async update(id: string, updates: Partial<ExecutionRecord>): Promise<ExecutionRecord> {
        const headers = getHeaders();
        const response = await fetch(`/api/execution-records/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updates),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '実行記録更新に失敗しました');
        }

        return {
          ...data.data,
          executedAt: new Date(data.data.executedAt),
        };
      },

      async delete(id: string): Promise<boolean> {
        const headers = getHeaders();
        const response = await fetch(`/api/execution-records/${id}`, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '実行記録削除に失敗しました');
        }

        return true;
      },
    },

    userSettings: {
      async get(): Promise<UserSettings | null> {
        const headers = getHeaders();
        const response = await fetch('/api/user-settings', { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ユーザー設定取得に失敗しました');
        }

        return data.data;
      },

      async create(settings: UserSettings): Promise<UserSettings> {
        // ユーザー設定は自動作成されるため、updateを呼び出す
        const result = await this.update(settings);
        if (!result) {
          throw new Error('ユーザー設定の作成に失敗しました');
        }
        return result;
      },

      async update(settings: Partial<UserSettings>): Promise<UserSettings | null> {
        const headers = getHeaders();
        const response = await fetch('/api/user-settings', {
          method: 'PUT',
          headers,
          body: JSON.stringify(settings),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'ユーザー設定更新に失敗しました');
        }

        return data.data;
      },
    },
  };
}
