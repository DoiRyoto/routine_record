import React, { useEffect, useState } from 'react';

interface XPNotificationProps {
  xpAmount: number;
  onComplete?: () => void;
}

export const XPNotification: React.FC<XPNotificationProps> = ({
  xpAmount,
  onComplete,
}) => {
  const [displayAmount, setDisplayAmount] = useState(xpAmount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (xpAmount > 0) {
      setDisplayAmount(0);
      setIsAnimating(true);
      
      // カウントアップアニメーション
      const duration = 1500; // 1.5秒
      const steps = 60;
      const stepValue = xpAmount / steps;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayAmount(xpAmount);
          clearInterval(timer);
          setIsAnimating(false);
          onComplete?.();
        } else {
          setDisplayAmount(Math.round(stepValue * currentStep));
        }
      }, stepDuration);

      return () => clearInterval(timer);
    } else {
      setDisplayAmount(xpAmount);
    }
  }, [xpAmount, onComplete]);

  // xpAmountが0なら何もレンダリングしない
  if (xpAmount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="text-lg font-bold">
            {displayAmount} XP
          </div>
          {isAnimating && (
            <div 
              data-testid="xp-particles"
              className="animate-particles absolute inset-0 pointer-events-none"
            >
              {/* パーティクルエフェクト（最小実装） */}
              <div className="absolute -top-2 -right-2 h-2 w-2 rounded-full bg-yellow-300 animate-ping" />
              <div className="absolute -top-1 -left-2 h-1 w-1 rounded-full bg-yellow-200 animate-ping delay-100" />
              <div className="absolute -bottom-2 -right-1 h-1 w-1 rounded-full bg-yellow-400 animate-ping delay-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};