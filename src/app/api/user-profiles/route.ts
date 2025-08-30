import { type NextRequest } from 'next/server';

import { 
  getUserProfile, 
  getUserProfileWithStats 
} from '@/lib/db/queries/user-profiles';
import {
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';
import { requireAuth, validateUserAccess } from '@/lib/auth/middleware';
import { validateBoolean } from '@/lib/validation/common';

// GET: ユーザープロフィール取得
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authData) => {
    try {
      const { user } = authData;

      // URLパラメータの解析
      const { searchParams } = new URL(request.url);
      const requestedUserId = searchParams.get('userId');
      const includeDetails = searchParams.get('includeDetails');

      // userIdのバリデーション
      const userAccessError = validateUserAccess(requestedUserId, user.id);
      if (userAccessError) {
        return createErrorResponse(userAccessError, 
          userAccessError.includes('他のユーザー') ? 403 : 400);
      }

      // includeDetailsのバリデーション
      const includeDetailsError = validateBoolean(includeDetails, 'includeDetails');
      if (includeDetailsError) {
        return createErrorResponse(includeDetailsError.message, 400);
      }

      // 詳細データ取得
      if (includeDetails === 'true') {
        const profileWithStats = await getUserProfileWithStats(user.id);
        
        if (!profileWithStats) {
          return createErrorResponse('ユーザープロフィールが見つかりません', 404);
        }

        return createSuccessResponse({
          userProfile: profileWithStats.userProfile,
          badges: profileWithStats.badges,
          recentXPHistory: profileWithStats.recentXPHistory
        });
      }

      // 基本プロフィール取得
      const userProfile = await getUserProfile(user.id);
      
      if (!userProfile) {
        return createErrorResponse('ユーザープロフィールが見つかりません', 404);
      }

      return createSuccessResponse({
        userProfile
      });
    } catch (error) {
      console.error('GET /api/user-profiles error:', error);
      return createServerErrorResponse();
    }
  });
}