'use client';

import React, { useCallback, useEffect, useState } from 'react';

// import Button from './Button'; // 現在未使用

export interface SnackbarMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface SnackbarProps {
  message: SnackbarMessage;
  onClose: (id: string) => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [, setTimeLeft] = useState(message.duration || 4000);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(message.id);
    }, 300); // アニメーション時間
  }, [onClose, message.id]);

  useEffect(() => {
    // フェードイン
    setIsVisible(true);

    const duration = message.duration || 4000;
    const totalDuration = duration;
    const interval = 100; // 100msごとに更新

    // プログレスバーとカウントダウンの更新
    const progressTimer = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = prevTimeLeft - interval;
        const newProgress = (newTimeLeft / totalDuration) * 100;
        setProgress(Math.max(0, newProgress));

        if (newTimeLeft <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return newTimeLeft;
      });
    }, interval);

    // 自動クローズのタイマー
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(closeTimer);
      clearInterval(progressTimer);
    };
  }, [message.duration, handleClose]);

  const getTypeStyles = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-600 text-white';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const handleActionClick = () => {
    if (message.action) {
      // アクション実行後、即座にSnackbarを閉じる
      message.action.onClick();
      handleClose();
    }
  };

  return (
    <div
      className={`
        min-w-80 max-w-md rounded-lg shadow-lg overflow-hidden
        flex flex-col
        transition-all duration-300 ease-in-out
        ${getTypeStyles()}
        ${isVisible && !isExiting ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
      `}
    >
      {/* メインコンテンツ */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg font-bold">{getIcon()}</span>
          <span className="text-sm font-medium">{message.message}</span>
        </div>

        <div className="flex items-center gap-2">
          {message.action && (
            <button
              onClick={handleActionClick}
              className="
                px-3 py-1.5 text-sm font-medium text-white
                bg-white/25 hover:bg-white/35 
                border border-white/40 hover:border-white/60
                rounded-md transition-all duration-200
                active:scale-95 active:bg-white/40
                shadow-sm hover:shadow-md
                backdrop-blur-sm
              "
            >
              {message.action.label}
            </button>
          )}

          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-white/20 h-1">
        <div
          className="bg-white/60 h-1 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Snackbar;
