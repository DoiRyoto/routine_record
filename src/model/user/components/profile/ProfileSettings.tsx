import React from 'react';

import Image from 'next/image';

interface User {
  displayName: string;
  email: string;
  avatarUrl: string;
}

interface ProfileSettingsProps {
  user?: User;
  onSave?: (data: any) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onSave }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSave?.({
      displayName: formData.get('displayName')
    });
  };

  return (
    <div className="bg-bg-primary">
      <form onSubmit={handleSubmit} className="bg-bg-secondary">
        <div className="bg-bg-secondary">
          <label htmlFor="displayName" className="text-text-primary">表示名</label>
          <input
            id="displayName"
            name="displayName"
            defaultValue={user?.displayName || ''}
            required
            className="bg-bg-primary text-text-primary"
          />
        </div>
        
        <div className="bg-bg-secondary">
          <label htmlFor="email" className="text-text-primary">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email || ''}
            className="bg-bg-primary text-text-primary"
          />
        </div>
        
        <div className="bg-bg-secondary" data-testid="profile-avatar">
          <Image src={user?.avatarUrl || '/default-avatar.png'} alt="アバター" width={64} height={64} />
          <label htmlFor="avatar" className="text-text-primary">アバター画像</label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            className="bg-bg-primary text-text-primary"
          />
        </div>
        
        <button type="submit" className="bg-bg-primary text-text-primary">保存</button>
      </form>
      
      <div className="bg-bg-secondary">
        <p className="text-text-muted">表示名は必須です</p>
      </div>
    </div>
  );
};