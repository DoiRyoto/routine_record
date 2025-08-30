import { UserSettings } from '../../domain/entities/UserSettings';
import { IUserSettingsRepository } from '../../domain/repositories/IUserSettingsRepository';
import { UserId } from '../../domain/valueObjects';
import { UserSettingsEmptyUpdateError } from '../../shared/types/UserSettingsErrors';
import { UpdateUserSettingsDto } from '../dtos/UpdateUserSettingsDto';

export class UpdateUserSettingsUseCase {
  constructor(
    private readonly userSettingsRepository: IUserSettingsRepository
  ) {}

  private validateUpdateRequest(dto: UpdateUserSettingsDto): void {
    // 更新項目が指定されているかチェック
    if (!dto.theme && !dto.language && !dto.timeFormat) {
      throw new UserSettingsEmptyUpdateError();
    }

    // 各フィールドのバリデーション
    UserSettings.validateSettingsData(dto.theme, dto.language, dto.timeFormat);
  }

  private applySettingsUpdate(dto: UpdateUserSettingsDto, userSettings: UserSettings): void {
    // 指定されたフィールドを更新
    if (dto.theme) {
      userSettings.updateTheme(dto.theme);
    }
    if (dto.language) {
      userSettings.updateLanguage(dto.language);
    }
    if (dto.timeFormat) {
      userSettings.updateTimeFormat(dto.timeFormat);
    }
  }

  async execute(dto: UpdateUserSettingsDto): Promise<UserSettings> {
    // バリデーション実行
    this.validateUpdateRequest(dto);
    
    const userId = new UserId(dto.userId);

    // 設定を取得（存在しない場合は自動作成）
    let userSettings = await this.userSettingsRepository.findByUserId(userId);
    if (!userSettings) {
      userSettings = await this.userSettingsRepository.create(
        UserSettings.createDefault(userId)
      );
    }

    // プロパティを更新
    this.applySettingsUpdate(dto, userSettings);

    // 保存
    await this.userSettingsRepository.save(userSettings);

    return userSettings;
  }
}