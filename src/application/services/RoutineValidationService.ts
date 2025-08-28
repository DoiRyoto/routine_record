import { injectable } from 'inversify';
import { Routine } from '@/domain';
import { ValidationError, BusinessRuleViolationError } from '@/shared/types/DomainError';

@injectable()
export class RoutineValidationService {
  /**
   * ルーティンのビジネスルールを検証
   */
  async validateBusinessRules(routine: Routine): Promise<void> {
    // Name length validation
    if (routine.getName().length > 100) {
      throw new ValidationError('ルーティン名は100文字以内である必要があります');
    }

    // Category length validation
    if (routine.getCategory().length > 50) {
      throw new ValidationError('カテゴリは50文字以内である必要があります');
    }

    // Description length validation
    if (routine.getDescription() && routine.getDescription()!.length > 500) {
      throw new ValidationError('説明は500文字以内である必要があります');
    }

    // Additional business rules can be added here
  }

  /**
   * ルーティン名の重複をチェック
   */
  async validateRoutineUniqueness(routine: Routine, existingRoutines: Routine[]): Promise<void> {
    const duplicateRoutine = existingRoutines.find(
      existing => 
        existing.getName() === routine.getName() && 
        existing.getUserId().equals(routine.getUserId()) &&
        !existing.getId().equals(routine.getId()) // Exclude self when updating
    );

    if (duplicateRoutine) {
      throw new BusinessRuleViolationError(
        'ルーティン名の重複',
        `同じ名前のルーティン「${routine.getName()}」が既に存在します`
      );
    }
  }

  /**
   * ターゲット設定の妥当性をチェック
   */
  async validateTargetSettings(routine: Routine): Promise<void> {
    if (routine.isFrequencyBased()) {
      // Frequency-based routines should have valid target settings
      // This validation is already done in the Routine entity constructor
      // Additional business rules can be added here
    }

    // Schedule-based routines don't require target settings
    // Additional validations can be added here
  }
}