import type { DataService } from './data-service';
import type { Routine, ExecutionRecord, UserSettings } from '@/types/routine';
import { supabase } from '@/lib/supabase/client';

export function createApiDataService(): DataService {
  // 認証トークンを取得するヘルパー関数
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('認証が必要です');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  return {
    routines: {
      async getAll(): Promise<Routine[]> {
        const headers = await getAuthHeaders();
        const response = await fetch('/api/routines', { headers });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'ルーチン取得に失敗しました');
        }
        
        return data.data;
      },

      async getById(id: string): Promise<Routine | null> {
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/routines/${id}`, { headers });
        
        if (response.status === 404) {
          return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'ルーチン取得に失敗しました');
        }
        
        return data.data;
      },

      async create(routine: Omit<Routine, 'id' | 'createdAt'>): Promise<Routine> {
        const headers = await getAuthHeaders();
        const response = await fetch('/api/routines', {
          method: 'POST',
          headers,
          body: JSON.stringify(routine),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'ルーチン作成に失敗しました');
        }
        
        return data.data;
      },

      async update(id: string, updates: Partial<Routine>): Promise<Routine> {
        const headers = await getAuthHeaders();
        const response = await fetch(`/api/routines/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updates),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'ルーチン更新に失敗しました');
        }
        
        return data.data;
      },

      async delete(id: string): Promise<boolean> {
        const headers = await getAuthHeaders();
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
    },

    executionRecords: {
      async getAll(): Promise<ExecutionRecord[]> {
        const headers = await getAuthHeaders();
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
        const headers = await getAuthHeaders();
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
        const headers = await getAuthHeaders();
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
        const headers = await getAuthHeaders();
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
        const headers = await getAuthHeaders();
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
        const headers = await getAuthHeaders();
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
        const headers = await getAuthHeaders();
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