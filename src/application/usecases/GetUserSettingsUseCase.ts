import { UserSettings } from '../../domain/entities/UserSettings';
import { IUserSettingsRepository } from '../../domain/repositories/IUserSettingsRepository';
import { UserId } from '../../domain/valueObjects';
import { GetUserSettingsDto } from '../dtos/GetUserSettingsDto';

export class GetUserSettingsUseCase {
  constructor(
    private readonly userSettingsRepository: IUserSettingsRepository
  ) {}

  async execute(dto: GetUserSettingsDto): Promise<UserSettings> {
    const userId = new UserId(dto.userId);

    // 設定を検索
    let userSettings = await this.userSettingsRepository.findByUserId(userId);

    // 設定が存在しない場合、デフォルト値で自動作成
    if (!userSettings) {
      const defaultSettings = UserSettings.createDefault(userId);
      userSettings = await this.userSettingsRepository.create(defaultSettings);
    }

    return userSettings;
  }
}