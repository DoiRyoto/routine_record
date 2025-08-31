import React, { useEffect } from 'react';

interface LevelUpData {
  newLevel: number;
  previousLevel: number;
  xpGained: number;
  nextLevelXp: number;
  currentXp: number;
  rewards: string[];
}

interface LevelUpModalProps {
  levelUpData: LevelUpData | null;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  levelUpData,
  onClose,
}) => {
  // キーボードでの操作対応
  useEffect(() => {
    if (!levelUpData) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [levelUpData, onClose]);

  // レベルアップデータがない場合は何もレンダリングしない
  if (!levelUpData) {
    return null;
  }

  const progressPercentage = Math.round((levelUpData.currentXp / levelUpData.nextLevelXp) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="levelup-title"
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl relative overflow-hidden"
        >
          {/* Celebration Animation Background */}
          <div 
            data-testid="celebration-animation"
            className="animate-celebration absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 opacity-30"
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mb-4">
                <div className="text-4xl mb-2">🎉</div>
                <h2 id="levelup-title" className="text-2xl font-bold text-purple-600">
                  レベルアップ！
                </h2>
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  レベル {levelUpData.newLevel} に到達しました
                </p>
                <p className="text-sm text-gray-600">
                  {levelUpData.xpGained} XP 獲得
                </p>
              </div>
            </div>

            {/* Progress to Next Level */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>次のレベルまで</span>
                <span>{levelUpData.currentXp} / {levelUpData.nextLevelXp} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Rewards Section */}
            {levelUpData.rewards.length > 0 && (
              <div data-testid="rewards-section" className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-center">
                  🎁 新しい特典を獲得しました！
                </h3>
                <div className="space-y-2">
                  {levelUpData.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3"
                    >
                      <p className="text-sm font-medium text-yellow-800">
                        {reward}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="text-center">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                続ける ✨
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};