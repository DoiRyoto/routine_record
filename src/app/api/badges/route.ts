import { NextRequest, NextResponse } from 'next/server';

import { 
  getAllBadges, 
  getBadgesByCategory,
  getBadgesByRarity,
  createBadge,
  updateBadge,
  deleteBadge 
} from '@/lib/db/queries/badges';
import {
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';
import { paginateArray } from '@/lib/utils/pagination';
import { sortBadges } from '@/lib/utils/sorting';
import { validateBadgeQuery } from '@/lib/validation/common';

// GET: Public badges API - no authentication required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters using consolidated utility
    const { params, errors } = validateBadgeQuery(searchParams);
    
    if (errors.length > 0) {
      return createErrorResponse(errors[0].message, 400);
    }

    const { category, rarity, sortBy, sortOrder, pagination } = params;

    let badges;
    
    // Query data based on filters
    if (category) {
      badges = await getBadgesByCategory(category);
    } else if (rarity) {
      badges = await getBadgesByRarity(rarity);
    } else {
      badges = await getAllBadges();
    }

    // Apply sorting using consolidated utility
    if (sortBy) {
      badges = sortBadges(badges, sortBy, sortOrder as 'asc' | 'desc' | undefined);
    }

    // Apply pagination using consolidated utility
    const result = paginateArray(badges, pagination.page, pagination.limit);

    return createSuccessResponse({
      badges: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('GET /api/badges error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return createServerErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, badgeId, ...badgeData } = body;

    switch (action) {
      case 'create':
        const newBadge = await createBadge(badgeData);
        return NextResponse.json(newBadge);

      case 'update':
        if (!badgeId) {
          return NextResponse.json(
            { error: 'badgeIdが必要です' },
            { status: 400 }
          );
        }
        const updatedBadge = await updateBadge(badgeId, badgeData);
        return NextResponse.json(updatedBadge);

      case 'delete':
        if (!badgeId) {
          return NextResponse.json(
            { error: 'badgeIdが必要です' },
            { status: 400 }
          );
        }
        await deleteBadge(badgeId);
        return NextResponse.json({ message: 'バッジが削除されました' });

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/badges error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'バッジの処理に失敗しました' },
      { status: 500 }
    );
  }
}