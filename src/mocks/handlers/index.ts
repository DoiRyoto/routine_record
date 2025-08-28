import { badgesHandlers } from './badges';
import { categoriesHandlers } from './categories';
import { catchupPlansHandlers } from './catchup-plans';
import { challengesHandlers } from './challenges';
import { executionRecordsHandlers } from './execution-records';
import { gameNotificationsHandlers } from './game-notifications';
import { missionsHandlers } from './missions';
import { routinesHandlers } from './routines';
import { userBadgesHandlers } from './user-badges';
import { userChallengesHandlers } from './user-challenges';
import { userMissionsHandlers } from './user-missions';
import { userProfilesHandlers } from './user-profiles';
import { userSettingsHandlers } from './user-settings';
import { xpTransactionsHandlers } from './xp-transactions';

// 全てのハンドラーを統合
export const allHandlers = [
  ...badgesHandlers,
  ...categoriesHandlers,
  ...catchupPlansHandlers,
  ...challengesHandlers,
  ...executionRecordsHandlers,
  ...gameNotificationsHandlers,
  ...missionsHandlers,
  ...routinesHandlers,
  ...userBadgesHandlers,
  ...userChallengesHandlers,
  ...userMissionsHandlers,
  ...userProfilesHandlers,
  ...userSettingsHandlers,
  ...xpTransactionsHandlers,
];

// 個別export（必要に応じて）
export {
  badgesHandlers,
  categoriesHandlers,
  catchupPlansHandlers,
  challengesHandlers,
  executionRecordsHandlers,
  gameNotificationsHandlers,
  missionsHandlers,
  routinesHandlers,
  userBadgesHandlers,
  userChallengesHandlers,
  userMissionsHandlers,
  userProfilesHandlers,
  userSettingsHandlers,
  xpTransactionsHandlers,
};
