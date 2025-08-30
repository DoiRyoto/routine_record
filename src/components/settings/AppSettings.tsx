import React from 'react';

interface AppSettingsProps {
  onThemeChange?: (theme: string) => void;
  onLanguageChange?: (lang: string) => void;
  onSave?: (data: any) => void;
}

export const AppSettings: React.FC<AppSettingsProps> = ({ 
  onThemeChange, 
  onLanguageChange, 
  onSave 
}) => {
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const theme = e.target.checked ? 'dark' : 'light';
    onThemeChange?.(theme);
    // 即座にDOM反映（テスト用）
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange?.(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSave?.({
      timeFormat: formData.get('timeFormat')
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input
              type="checkbox"
              onChange={handleThemeChange}
            />
            ダークモード
          </label>
        </div>
        
        <div>
          <label htmlFor="language">言語</label>
          <select id="language" onChange={handleLanguageChange}>
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
        
        <div>
          <label>
            <input
              type="radio"
              name="timeFormat"
              value="12h"
            />
            12時間形式
          </label>
        </div>
        
        <button type="submit">保存</button>
      </form>
    </div>
  );
};