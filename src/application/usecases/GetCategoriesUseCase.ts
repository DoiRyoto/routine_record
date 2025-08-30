import { Category } from '../../domain/entities/Category';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { UserId } from '../../domain/valueObjects';
import { GetCategoriesDto } from '../dtos/GetCategoriesDto';

export interface GetCategoriesResult {
  categories: Category[];
}

export class GetCategoriesUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(dto: GetCategoriesDto): Promise<GetCategoriesResult> {
    const userId = new UserId(dto.userId);

    // ユーザーのカテゴリを取得
    const categories = await this.categoryRepository.findByUserId(
      userId, 
      dto.includeInactive || false
    );

    return {
      categories
    };
  }
}