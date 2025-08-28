import { NextRequest, NextResponse } from 'next/server';
import { injectable, inject } from 'inversify';
import { CreateRoutineUseCase } from '@/application/usecases/CreateRoutineUseCase';
import { GetRoutinesUseCase } from '@/application/usecases/GetRoutinesUseCase';
import { CreateRoutineDto } from '@/application/dtos/CreateRoutineDto';
import { Routine } from '@/domain';
import { createApiResponse } from '@/shared/types';
import { isDomainError } from '@/shared/types/DomainError';
import { TYPES } from '@/shared/config/container';

@injectable()
export class RoutineController {
  constructor(
    @inject(TYPES.CreateRoutineUseCase) private createRoutineUseCase: CreateRoutineUseCase,
    @inject(TYPES.GetRoutinesUseCase) private getRoutinesUseCase: GetRoutinesUseCase
  ) {}

  public async create(request: NextRequest): Promise<NextResponse> {
    try {
      // 1. ユーザーID取得
      const userId = this.extractUserIdFromRequest(request);
      if (!userId) {
        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
      }

      // 2. リクエストボディ取得
      const body = await request.json();
      const dto = new CreateRoutineDto({
        ...body,
        userId,
      });

      // 3. ユースケース実行
      const result = await this.createRoutineUseCase.execute(dto);

      // 4. レスポンス生成
      if (result.isSuccess) {
        const responseData = this.routineToDto(result.value);
        return NextResponse.json(
          createApiResponse(responseData, true),
          { status: 201 }
        );
      } else {
        return this.handleError(result.error);
      }
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  public async getAll(request: NextRequest): Promise<NextResponse> {
    try {
      // 1. ユーザーID取得
      const userId = this.extractUserIdFromRequest(request);
      if (!userId) {
        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
      }

      // 2. ユースケース実行
      const result = await this.getRoutinesUseCase.execute(userId);

      // 3. レスポンス生成
      if (result.isSuccess) {
        const responseData = result.value.map(routine => this.routineToDto(routine));
        return NextResponse.json(
          createApiResponse(responseData, true)
        );
      } else {
        return this.handleError(result.error);
      }
    } catch (error) {
      return this.handleError(error as Error);
    }
  }

  private extractUserIdFromRequest(request: NextRequest): string | null {
    // AuthMiddlewareによって設定されるx-user-idヘッダーを取得
    return request.headers.get('x-user-id') || null;
  }

  private routineToDto(routine: Routine): any {
    const persistence = routine.toPersistence();
    return {
      id: persistence.id,
      userId: persistence.userId,
      name: persistence.name,
      description: persistence.description,
      category: persistence.category,
      goalType: persistence.goalType,
      recurrenceType: persistence.recurrenceType,
      targetCount: persistence.targetCount,
      targetPeriod: persistence.targetPeriod,
      recurrenceInterval: persistence.recurrenceInterval,
      isActive: persistence.isActive,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
    };
  }

  private handleError(error: Error): NextResponse {
    if (isDomainError(error)) {
      // ドメインエラーの場合、適切なHTTPステータスを返す
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          createApiResponse(null, false, {
            code: error.code,
            message: error.message,
          }),
          { status: 400 }
        );
      }

      if (error.name === 'BusinessRuleViolationError') {
        return NextResponse.json(
          createApiResponse(null, false, {
            code: error.code,
            message: error.message,
          }),
          { status: 400 }
        );
      }

      if (error.name === 'NotFoundError') {
        return NextResponse.json(
          createApiResponse(null, false, {
            code: error.code,
            message: error.message,
          }),
          { status: 404 }
        );
      }

      if (error.name === 'UnauthorizedError') {
        return NextResponse.json(
          createApiResponse(null, false, {
            code: error.code,
            message: error.message,
          }),
          { status: 401 }
        );
      }
    }

    // その他のエラーの場合
    const isJsonError = error.message.includes('JSON');
    if (isJsonError) {
      return NextResponse.json(
        createApiResponse(null, false, {
          code: 'INVALID_REQUEST',
          message: 'リクエストが無効です',
        }),
        { status: 400 }
      );
    }

    // 内部エラー
    return NextResponse.json(
      createApiResponse(null, false, {
        code: 'INTERNAL_ERROR',
        message: '内部エラーが発生しました',
      }),
      { status: 500 }
    );
  }
}