import { injectable, inject } from 'inversify';

import { Routine, UserId } from '@/domain';
import type { IRoutineRepository } from '@/domain/repositories/IRoutineRepository';
import { TYPES } from '@/lib/config/container';
import { Result, success, failure } from '@/lib/types';

@injectable()
export class GetRoutinesUseCase {
  constructor(
    @inject(TYPES.IRoutineRepository) private routineRepository: IRoutineRepository
  ) {}

  async execute(userId: string): Promise<Result<Routine[]>> {
    try {
      const userIdObject = new UserId(userId);
      const routines = await this.routineRepository.findByUserId(userIdObject);
      
      return success(routines);
    } catch (error) {
      return failure(error as Error);
    }
  }
}