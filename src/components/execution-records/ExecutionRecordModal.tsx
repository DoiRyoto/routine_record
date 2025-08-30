import React, { useEffect, useRef } from 'react';

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

interface ExecutionRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: Routine[];
  record?: Record<string, unknown>;
}

export const ExecutionRecordModal: React.FC<ExecutionRecordModalProps> = ({
  isOpen,
  onClose,
  routines,
}) => {
  const firstInputRef = useRef<HTMLSelectElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // モーダル表示時に最初の要素にフォーカス
  useEffect(() => {
    if (isOpen) {
      firstInputRef.current?.focus();
    }
  }, [isOpen]);

  // 最小実装：isOpenがfalseなら何もレンダリングしない
  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    // 簡単なフォーカストラップ実装
    if (e.key === 'Tab') {
      const focusableElements = [firstInputRef.current, closeButtonRef.current];
      const currentIndex = focusableElements.indexOf(document.activeElement as any);
      
      if (e.shiftKey) {
        // Shift+Tab: 前の要素へ
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[prevIndex]?.focus();
      } else {
        // Tab: 次の要素へ
        const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
        focusableElements[nextIndex]?.focus();
      }
      e.preventDefault();
    }
  };

  // 最小実装：基本的なモーダル構造のみ
  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50"
      onKeyDown={handleKeyDown}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        >
          <div className="mb-4">
            <h2 id="modal-title" className="text-lg font-semibold">
              実行記録
            </h2>
          </div>

          {/* 最小限のフォーム */}
          <div className="space-y-4">
            <div>
              <label htmlFor="routine-select" className="block text-sm font-medium">
                ルーチン選択
              </label>
              <select 
                ref={firstInputRef}
                id="routine-select" 
                className="mt-1 block w-full"
              >
                <option value="">選択してください</option>
                {routines.map(routine => (
                  <option key={routine.id} value={routine.id}>
                    {routine.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 閉じるボタン */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};