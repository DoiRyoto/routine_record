import { and, desc, eq, isNull } from 'drizzle-orm';
import { injectable } from 'inversify';
import { IRoutineRepository } from '@/domain/repositories/IRoutineRepository';
import { Routine, RoutineId, UserId } from '@/domain';
import { db } from '@/infrastructure/database';
import { routines } from '@/infrastructure/database/schema';

@injectable()
export class DrizzleRoutineRepository implements IRoutineRepository {
  async findById(id: RoutineId): Promise<Routine | null> {
    try {
      const result = await db
        .select()
        .from(routines)
        .where(
          and(
            eq(routines.id, id.getValue()),
            isNull(routines.deletedAt)
          )
        )
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return Routine.fromPersistence(result[0]);
    } catch (error) {
      throw new Error(`Failed to find routine by id: ${error}`);
    }
  }

  async findByUserId(userId: UserId): Promise<Routine[]> {
    try {
      const result = await db
        .select()
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            isNull(routines.deletedAt)
          )
        )
        .orderBy(desc(routines.createdAt));

      return result.map(row => Routine.fromPersistence(row));
    } catch (error) {
      throw new Error(`Failed to find routines by user id: ${error}`);
    }
  }

  async findActiveByUserId(userId: UserId): Promise<Routine[]> {
    try {
      const result = await db
        .select()
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            eq(routines.isActive, true),
            isNull(routines.deletedAt)
          )
        );

      return result.map(row => Routine.fromPersistence(row));
    } catch (error) {
      throw new Error(`Failed to find active routines by user id: ${error}`);
    }
  }

  async save(routine: Routine): Promise<void> {
    try {
      const data = routine.toPersistence();
      
      await db
        .insert(routines)
        .values(data)
        .onConflictDoUpdate({
          target: routines.id,
          set: {
            name: data.name,
            description: data.description,
            category: data.category,
            goalType: data.goalType,
            recurrenceType: data.recurrenceType,
            targetCount: data.targetCount,
            targetPeriod: data.targetPeriod,
            recurrenceInterval: data.recurrenceInterval,
            isActive: data.isActive,
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      throw new Error(`Failed to save routine: ${error}`);
    }
  }

  async delete(id: RoutineId): Promise<void> {
    try {
      await db
        .update(routines)
        .set({
          isActive: false,
          deletedAt: new Date(),
        })
        .where(eq(routines.id, id.getValue()));
    } catch (error) {
      throw new Error(`Failed to delete routine: ${error}`);
    }
  }

  async existsByUserIdAndId(userId: UserId, id: RoutineId): Promise<boolean> {
    try {
      const result = await db
        .select({ id: routines.id })
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            eq(routines.id, id.getValue()),
            isNull(routines.deletedAt)
          )
        )
        .limit(1);

      return result.length > 0;
    } catch (error) {
      throw new Error(`Failed to check routine existence: ${error}`);
    }
  }

  async findByUserIdAndCategory(userId: UserId, category: string): Promise<Routine[]> {
    try {
      const result = await db
        .select()
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            eq(routines.category, category),
            isNull(routines.deletedAt)
          )
        );

      return result.map(row => Routine.fromPersistence(row));
    } catch (error) {
      throw new Error(`Failed to find routines by category: ${error}`);
    }
  }

  async findScheduledForDate(userId: UserId, date: Date): Promise<Routine[]> {
    // Simplified implementation - returns all schedule-based routines
    try {
      const result = await db
        .select()
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            eq(routines.goalType, 'schedule_based'),
            eq(routines.isActive, true),
            isNull(routines.deletedAt)
          )
        );

      return result.map(row => Routine.fromPersistence(row));
    } catch (error) {
      throw new Error(`Failed to find scheduled routines: ${error}`);
    }
  }

  async findFrequencyBasedByUserId(userId: UserId): Promise<Routine[]> {
    try {
      const result = await db
        .select()
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            eq(routines.goalType, 'frequency_based'),
            eq(routines.isActive, true),
            isNull(routines.deletedAt)
          )
        );

      return result.map(row => Routine.fromPersistence(row));
    } catch (error) {
      throw new Error(`Failed to find frequency-based routines: ${error}`);
    }
  }

  async countByUserId(userId: UserId): Promise<number> {
    try {
      const result = await db
        .select({ count: routines.id })
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            isNull(routines.deletedAt)
          )
        );

      return result.length;
    } catch (error) {
      throw new Error(`Failed to count routines: ${error}`);
    }
  }

  async countActiveByUserId(userId: UserId): Promise<number> {
    try {
      const result = await db
        .select({ count: routines.id })
        .from(routines)
        .where(
          and(
            eq(routines.userId, userId.getValue()),
            eq(routines.isActive, true),
            isNull(routines.deletedAt)
          )
        );

      return result.length;
    } catch (error) {
      throw new Error(`Failed to count active routines: ${error}`);
    }
  }
}