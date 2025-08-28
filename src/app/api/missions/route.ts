import { NextRequest, NextResponse } from 'next/server';

import { 
  getActiveMissions,
  createMission
} from '@/lib/db/queries/missions';

export async function GET() {
  try {
    const missions = await getActiveMissions();
    return NextResponse.json(missions);
  } catch (error) {
    console.error('GET /api/missions error:', error);
    return NextResponse.json(
      { error: 'ミッションの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...missionData } = body;

    switch (action) {
      case 'create':
        const newMission = await createMission(missionData);
        return NextResponse.json(newMission);

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/missions error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ミッションの処理に失敗しました' },
      { status: 500 }
    );
  }
}