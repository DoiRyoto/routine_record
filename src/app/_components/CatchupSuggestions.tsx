'use client';

import { useMemo } from 'react';

import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { ExecutionRecord, Routine } from '@/types/routine';
import {
  analyzeAllCatchupNeeds,
  generateDailyMissionSuggestions,
  getCatchupProgressMessage,
} from '@/utils/catchupUtils';

import { Card } from '@/components/ui/Card';

interface Props {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  userSettings: UserSettingWithTimezone;
}

export default function CatchupSuggestions({ routines, executionRecords, userSettings }: Props) {
  const { catchupAnalyses, dailySuggestions } = useMemo(() => {
    const analyses = analyzeAllCatchupNeeds(routines, executionRecords, userSettings?.timezone || undefined);
    const suggestions = generateDailyMissionSuggestions(analyses);

    return {
      catchupAnalyses: analyses,
      dailySuggestions: suggestions,
    };
  }, [routines, executionRecords, userSettings?.timezone]);

  const needsCatchup = catchupAnalyses.filter(analysis => analysis.needsCatchup);
  
  if (needsCatchup.length === 0 && dailySuggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* デイリーミッション提案 */}
      {dailySuggestions.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💡</span>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              今日の挽回ミッション
            </h2>
          </div>
          
          <div className="space-y-3">
            {dailySuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg"
              >
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 挽回が必要なミッション一覧 */}
      {needsCatchup.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚨</span>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              挽回が必要なミッション
            </h2>
          </div>
          
          <div className="space-y-4">
            {needsCatchup.map((analysis) => (
              <div
                key={analysis.routine.id}
                className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {analysis.routine.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                      {analysis.routine.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {analysis.currentProgress}/{analysis.targetCount}回
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      残り{analysis.remainingDays}日
                    </div>
                  </div>
                </div>

                {/* 進捗バー */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        analysis.currentProgress / analysis.targetCount >= 0.8
                          ? 'bg-green-500'
                          : analysis.currentProgress / analysis.targetCount >= 0.5
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((analysis.currentProgress / analysis.targetCount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    進捗: {Math.round((analysis.currentProgress / analysis.targetCount) * 100)}%
                  </div>
                </div>

                {/* ステータスメッセージ */}
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {getCatchupProgressMessage(analysis)}
                </div>

                {/* 推奨アクション */}
                {analysis.remainingTarget > 0 && (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      推奨アクション:
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      残り{analysis.remainingDays}日で{analysis.remainingTarget}回実行
                      （1日あたり約{analysis.suggestedDailyTarget}回）
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}