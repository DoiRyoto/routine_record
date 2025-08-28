import { Container } from 'inversify';
import 'reflect-metadata';

// Types (Symbols for dependency injection)
export const TYPES = {
  // Repositories
  IRoutineRepository: Symbol.for('IRoutineRepository'),
  IExecutionRecordRepository: Symbol.for('IExecutionRecordRepository'),
  
  // Use Cases
  CreateRoutineUseCase: Symbol.for('CreateRoutineUseCase'),
  GetRoutinesUseCase: Symbol.for('GetRoutinesUseCase'),
  GetRoutineByIdUseCase: Symbol.for('GetRoutineByIdUseCase'),
  UpdateRoutineUseCase: Symbol.for('UpdateRoutineUseCase'),
  DeleteRoutineUseCase: Symbol.for('DeleteRoutineUseCase'),
  CompleteRoutineUseCase: Symbol.for('CompleteRoutineUseCase'),
  
  // Services
  RoutineProgressService: Symbol.for('RoutineProgressService'),
  RoutineValidationService: Symbol.for('RoutineValidationService'),
  
  // Controllers
  RoutineController: Symbol.for('RoutineController'),
  
  // Infrastructure
  DatabaseConnection: Symbol.for('DatabaseConnection'),
  
  // External Services
  AuthenticationService: Symbol.for('AuthenticationService'),
  NotificationService: Symbol.for('NotificationService'),
} as const;

// Create container instance
const container = new Container({
  defaultScope: 'Singleton',
});

// Export container and types
export { container };

// Helper function to get dependencies
export function getDependency<T>(serviceIdentifier: symbol): T {
  return container.get<T>(serviceIdentifier);
}

// Helper function to check if dependency is bound
export function isBound(serviceIdentifier: symbol): boolean {
  return container.isBound(serviceIdentifier);
}

// Initialize container (will be called from a setup file)
export function initializeContainer(): void {
  // Import implementations
  const { DrizzleRoutineRepository } = require('@/infrastructure/repositories/DrizzleRoutineRepository');
  const { RoutineValidationService } = require('@/application/services/RoutineValidationService');
  const { CreateRoutineUseCase } = require('@/application/usecases/CreateRoutineUseCase');
  const { GetRoutinesUseCase } = require('@/application/usecases/GetRoutinesUseCase');
  const { RoutineController } = require('@/presentation/controllers/RoutineController');

  // Bind repositories
  container.bind(TYPES.IRoutineRepository).to(DrizzleRoutineRepository);

  // Bind services
  container.bind(TYPES.RoutineValidationService).to(RoutineValidationService);

  // Bind use cases
  container.bind(TYPES.CreateRoutineUseCase).to(CreateRoutineUseCase);
  container.bind(TYPES.GetRoutinesUseCase).to(GetRoutinesUseCase);

  // Bind controllers
  container.bind(TYPES.RoutineController).to(RoutineController);
}