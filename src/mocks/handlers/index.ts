import { categoriesHandlers } from './categories';
import { challengesHandlers } from './challenges';
import { executionRecordsHandlers } from './execution-records';
import { routinesHandlers } from './routines';
import { userProfilesHandlers } from './user-profiles';
import { userSettingsHandlers } from './user-settings';

// 全てのハンドラーを統合
export const allHandlers = [
  ...challengesHandlers,
  ...userProfilesHandlers,
  ...routinesHandlers,
  ...categoriesHandlers,
  ...executionRecordsHandlers,
  ...userSettingsHandlers,
];

// 個別export（必要に応じて）
export {
  categoriesHandlers,
  challengesHandlers,
  executionRecordsHandlers,
  routinesHandlers,
  userProfilesHandlers,
  userSettingsHandlers,
};
