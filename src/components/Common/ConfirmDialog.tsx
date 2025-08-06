'use client';

import { useEffect } from 'react';

import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '確認',
  cancelText = 'キャンセル',
  variant = 'primary',
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="ダイアログを閉じる"
      />

      {/* ダイアログコンテンツ */}
      <div
        className="
          relative w-full max-w-md mx-auto rounded-xl shadow-2xl overflow-hidden
          bg-white text-gray-900 dark:bg-slate-800 dark:text-white
        "
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* ヘッダー */}
        <div
          className="
          px-6 py-4 border-b flex items-center justify-between
          border-gray-200 dark:border-slate-600
        "
        >
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="
              p-1 rounded-lg transition-colors
              hover:bg-gray-100 text-gray-500 hover:text-gray-700
              dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white
            "
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* メッセージ */}
        <div className="px-6 py-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* アクションボタン */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
