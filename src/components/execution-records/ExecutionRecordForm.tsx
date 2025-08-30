import React, { useState } from 'react';

interface Routine {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
  goalType: 'schedule_based' | 'frequency_based';
  recurrenceType?: 'daily' | 'weekly';
  targetPeriod?: 'daily' | 'weekly';
  targetCount?: number;
}

interface ExecutionRecordFormData {
  routineId: string;
  executedAt: Date;
  duration?: number;
  memo?: string;
  isCompleted: boolean;
}

interface ExecutionRecordFormProps {
  onSubmit: (data: ExecutionRecordFormData) => Promise<void> | void;
  routines: Routine[];
  initialData?: Partial<ExecutionRecordFormData>;
}

export const ExecutionRecordForm: React.FC<ExecutionRecordFormProps> = ({
  onSubmit,
  routines,
  initialData,
}) => {
  const [routineId, setRoutineId] = useState(initialData?.routineId || '');
  const [executedAt, setExecutedAt] = useState(
    initialData?.executedAt ? 
    initialData.executedAt.toISOString().slice(0, 16) : 
    new Date().toISOString().slice(0, 16)
  );
  const [duration, setDuration] = useState(initialData?.duration?.toString() || '');
  const [memo, setMemo] = useState(initialData?.memo || '');
  const [isCompleted, setIsCompleted] = useState(initialData?.isCompleted || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // ルーチン選択必須
    if (!routineId) {
      newErrors.routineId = 'ルーチンを選択してください';
    }

    // 実行日時の検証
    const date = new Date(executedAt);
    if (isNaN(date.getTime())) {
      newErrors.executedAt = '有効な日時を入力してください';
    }

    // 実行時間の検証（0-1440分）
    if (duration !== '') {
      const durationNum = parseInt(duration, 10);
      if (isNaN(durationNum) || durationNum < 0) {
        newErrors.duration = '実行時間は0分以上で入力してください';
      } else if (durationNum > 1440) {
        newErrors.duration = '実行時間は1440分以内で入力してください';
      }
    }

    // メモの文字数制限（500文字）
    if (memo.length > 500) {
      newErrors.memo = 'メモは500文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // リアルタイムバリデーション用の関数
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'duration':
        if (value !== '') {
          const durationNum = parseInt(value, 10);
          if (isNaN(durationNum) || durationNum < 0) {
            newErrors.duration = '実行時間は0分以上で入力してください';
          } else if (durationNum > 1440) {
            newErrors.duration = '実行時間は1440分以内で入力してください';
          } else {
            delete newErrors.duration;
          }
        } else {
          delete newErrors.duration;
        }
        break;
      case 'memo':
        if (value.length > 500) {
          newErrors.memo = 'メモは500文字以内で入力してください';
        } else {
          delete newErrors.memo;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData: ExecutionRecordFormData = {
        routineId,
        executedAt: new Date(executedAt),
        duration: duration ? parseInt(duration) : undefined,
        memo: memo || undefined,
        isCompleted,
      };

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ルーチン選択 */}
      <div>
        <label htmlFor="routine-select" className="block text-sm font-medium">
          ルーチン選択 <span className="text-red-500">*</span>
        </label>
        <select
          id="routine-select"
          value={routineId}
          onChange={(e) => setRoutineId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">選択してください</option>
          {routines.map(routine => (
            <option key={routine.id} value={routine.id}>
              {routine.name}
            </option>
          ))}
        </select>
        {errors.routineId && (
          <p className="mt-1 text-sm text-red-600">{errors.routineId}</p>
        )}
      </div>

      {/* 実行日時 */}
      <div>
        <label htmlFor="executed-at" className="block text-sm font-medium">
          実行日時 <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          id="executed-at"
          value={executedAt}
          onChange={(e) => setExecutedAt(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {errors.executedAt && (
          <p className="mt-1 text-sm text-red-600">{errors.executedAt}</p>
        )}
      </div>

      {/* 実行時間 */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium">
          実行時間
        </label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => {
            setDuration(e.target.value);
            validateField('duration', e.target.value);
          }}
          min="0"
          max="1440"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="分単位で入力"
        />
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
        )}
      </div>

      {/* メモ */}
      <div>
        <label htmlFor="memo" className="block text-sm font-medium">
          メモ
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => {
            setMemo(e.target.value);
            validateField('memo', e.target.value);
          }}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="実行時の感想や気づきを記録"
        />
        <div className="mt-1 text-right text-sm text-gray-500">
          {memo.length}/500
        </div>
        {errors.memo && (
          <p className="mt-1 text-sm text-red-600">{errors.memo}</p>
        )}
      </div>

      {/* 完了状態 */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium">完了</span>
        </label>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
};