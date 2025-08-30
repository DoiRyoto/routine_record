import { useState, useEffect, useCallback } from 'react';

interface ExecutionRecord {
  id: string;
  userId: string;
  routineId: string;
  executedAt: Date;
  duration?: number;
  memo?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateExecutionRecordData {
  routineId: string;
  executedAt: Date;
  duration?: number;
  memo?: string;
  isCompleted: boolean;
}

interface UpdateExecutionRecordData {
  duration?: number;
  memo?: string;
  isCompleted?: boolean;
}

export const useExecutionRecords = () => {
  const [records, setRecords] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // レコード取得
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/execution-records');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 日時を Date オブジェクトに変換
        const recordsWithDates = result.data.map((record: any) => ({
          ...record,
          executedAt: new Date(record.executedAt),
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        }));
        
        setRecords(recordsWithDates);
      } else {
        throw new Error(result.error || 'データの取得に失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(
        errorMessage.includes('Network') || errorMessage.includes('fetch') 
          ? 'ネットワークエラーが発生しました' 
          : 'サーバーエラーが発生しました'
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // レコード作成
  const createRecord = useCallback(async (data: CreateExecutionRecordData) => {
    try {
      const response = await fetch('/api/execution-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          executedAt: data.executedAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // 作成されたレコードをリストに追加
        const newRecord = {
          ...result.data,
          executedAt: new Date(result.data.executedAt),
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
        };
        
        setRecords(prev => [...prev, newRecord]);
        return newRecord;
      } else {
        throw new Error(result.error || '作成に失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      throw new Error(errorMessage);
    }
  }, []);

  // レコード更新
  const updateRecord = useCallback(async (id: string, data: UpdateExecutionRecordData) => {
    try {
      const response = await fetch(`/api/execution-records/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // 更新されたレコードをリストに反映
        const updatedRecord = {
          ...result.data,
          executedAt: new Date(result.data.executedAt),
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
        };
        
        setRecords(prev => 
          prev.map(record => 
            record.id === id ? updatedRecord : record
          )
        );
        return updatedRecord;
      } else {
        throw new Error(result.error || '更新に失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      throw new Error(errorMessage);
    }
  }, []);

  // レコード削除
  const deleteRecord = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/execution-records/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // 削除されたレコードをリストから除去
        setRecords(prev => prev.filter(record => record.id !== id));
      } else {
        throw new Error(result.error || '削除に失敗しました');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      throw new Error(errorMessage);
    }
  }, []);

  // 初期ロード
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
  };
};