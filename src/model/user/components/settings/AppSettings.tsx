import React from 'react';

interface AppSettingsProps {
  onThemeChange?: (theme: string) => void;
  onLanguageChange?: (lang: string) => void;
  onSave?: (data: any) => void;
  onReset?: () => void;
}

export const AppSettings: React.FC<AppSettingsProps> = ({ 
  onThemeChange, 
  onLanguageChange, 
  onSave,
  onReset
}) => {
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const theme = e.target.checked ? 'dark' : 'light';
    onThemeChange?.(theme);
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
    <div className="bg-bg-primary">
      <form onSubmit={handleSubmit} className="bg-bg-secondary">
        <div className="bg-bg-secondary">
          <label className="text-text-primary">
            <input
              type="checkbox"
              onChange={handleThemeChange}
              className="bg-bg-primary"
            />
            ダークモード
          </label>
        </div>
        
        <div className="bg-bg-secondary">
          <label htmlFor="language" className="text-text-primary">言語</label>
          <select 
            id="language" 
            onChange={handleLanguageChange}
            className="bg-bg-primary text-text-primary"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
        
        <div className="bg-bg-secondary">
          <label className="text-text-primary">
            <input
              type="radio"
              name="timeFormat"
              value="12h"
              className="bg-bg-primary"
            />
            12時間形式
          </label>
        </div>
        
        <button type="submit" className="bg-bg-primary text-text-primary">保存</button>
        <button 
          type="button" 
          onClick={onReset}
          className="bg-bg-secondary text-text-secondary"
        >
          デフォルトに戻す
        </button>
      </form>
    </div>
  );
};