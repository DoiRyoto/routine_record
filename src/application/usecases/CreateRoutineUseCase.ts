import { injectable, inject } from 'inversify';

import { Routine, RoutineId, UserId, GoalType, RecurrenceType } from '@/domain';
import type { IRoutineRepository } from '@/domain/repositories/IRoutineRepository';
import { TYPES } from '@/shared/config/container';
import { Result, success, failure } from '@/shared/types';
import { UuidUtils } from '@/shared/utils/UuidUtils';
import { validateDto } from '@/shared/utils/ValidationUtils';

import { CreateRoutineDto } from '../dtos/CreateRoutineDto';
import type { RoutineValidationService } from '../services/RoutineValidationService';


@injectable()
export class CreateRoutineUseCase {
  constructor(
    @inject(TYPES.IRoutineRepository) private routineRepository: IRoutineRepository,
    @inject(TYPES.RoutineValidationService) private validationService: RoutineValidationService
  ) {}

  async execute(dto: CreateRoutineDto): Promise<Result<Routine>> {
    try {
      // 1. DTOのバリデーション
      await validateDto(dto);

      // 2. ドメインエンティティの作成
      const routine = this.createRoutineFromDto(dto);

      // 3. ビジネスルール検証
      await this.validationService.validateBusinessRules(routine);

      // 4. 重複チェック
      const existingRoutines = await this.routineRepository.findByUserId(routine.getUserId());
      await this.validationService.validateRoutineUniqueness(routine, existingRoutines);

      // 5. ルーティン保存
      await this.routineRepository.save(routine);

      return success(routine);
    } catch (error) {
      return failure(error as Error);
    }
  }

  private createRoutineFromDto(dto: CreateRoutineDto): Routine {
    const routineId = new RoutineId(UuidUtils.generateUuid());
    const userId = new UserId(dto.userId);
    const goalType = new GoalType(dto.goalType);
    const recurrenceType = new RecurrenceType(dto.recurrenceType);

    return new Routine(
      routineId,
      userId,
      dto.name,
      dto.description || null,
      dto.category,
      goalType,
      recurrenceType,
      dto.targetCount || null,
      dto.targetPeriod || null,
      dto.recurrenceInterval || 1
    );
  }
}