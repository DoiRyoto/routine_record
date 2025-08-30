import { type NextRequest } from 'next/server';

import { 
  getAllMissions,
  getMissionsByDifficulty,
  getMissionsByType
} from '@/lib/db/queries/missions';
import {
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';
import { requireAuth } from '@/lib/auth/middleware';
import { validateMissionQuery } from '@/lib/validation/common';
import { sortMissions } from '@/lib/utils/sorting';
import { paginateArray } from '@/lib/utils/pagination';

// Filter missions based on query parameters
function filterMissions(missions: any[], filters: { 
  difficulty?: string; 
  type?: string; 
  isActive?: boolean; 
}) {
  return missions.filter(mission => {
    if (filters.difficulty && mission.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.type && mission.type !== filters.type) {
      return false;
    }
    if (filters.isActive !== undefined && mission.isActive !== filters.isActive) {
      return false;
    }
    return true;
  });
}

// GET: ミッション一覧取得
export async function GET(request: NextRequest) {
  return requireAuth(request, async (authData) => {
    try {
      // URLパラメータの解析
      const { searchParams } = new URL(request.url);
      
      // Validate query parameters using consolidated utility
      const { params, errors } = validateMissionQuery(searchParams);
      
      if (errors.length > 0) {
        return createErrorResponse(errors[0].message, 400);
      }

      const { difficulty, type, isActive, sortBy, sortOrder, pagination } = params;

      let missions;

      // Query data based on filters - optimize for single filter cases
      if (difficulty && type) {
        // Multiple filters: get all and filter in memory
        missions = await getAllMissions();
        missions = filterMissions(missions, { difficulty, type, isActive });
      } else if (difficulty) {
        missions = await getMissionsByDifficulty(difficulty);
        if (isActive !== undefined) {
          missions = filterMissions(missions, { isActive });
        }
      } else if (type) {
        missions = await getMissionsByType(type);
        if (isActive !== undefined) {
          missions = filterMissions(missions, { isActive });
        }
      } else {
        missions = await getAllMissions();
        if (isActive !== undefined) {
          missions = filterMissions(missions, { isActive });
        }
      }

      // Apply sorting using consolidated utility
      if (sortBy) {
        missions = sortMissions(missions, sortBy, sortOrder);
      }

      // Apply pagination using consolidated utility
      const result = paginateArray(missions, pagination.page, pagination.limit);

      return createSuccessResponse({
        missions: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('GET /api/missions error:', error);
      return createServerErrorResponse();
    }
  });
}