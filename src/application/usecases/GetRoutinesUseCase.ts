import { injectable, inject } from 'inversify';
import type { IRoutineRepository } from '@/domain/repositories/IRoutineRepository';
import { Routine, UserId } from '@/domain';
import { Result, success, failure } from '@/shared/types';
import { TYPES } from '@/shared/config/container';

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