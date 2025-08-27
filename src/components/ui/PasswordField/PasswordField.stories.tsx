import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { PasswordField } from './PasswordField';

const meta: Meta<typeof PasswordField> = {
  title: 'UI/PasswordField',
  component: PasswordField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showToggle: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'パスワードを入力してください',
  },
};

export const WithoutToggle: Story = {
  args: {
    placeholder: 'パスワードを入力してください',
    showToggle: false,
  },
};

export const LoginForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    });

    return (
      <div className="w-80 space-y-4 p-6 border rounded-lg">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">ログイン</h2>
          <p className="text-gray-600 text-sm mt-2">
            ミッション管理アプリにログインしてください
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your@example.com"
            className="w-full h-9 px-3 py-1 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            パスワード
          </label>
          <PasswordField
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="パスワードを入力してください"
          />
        </div>
        
        <button className="w-full h-9 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          ログイン
        </button>
      </div>
    );
  },
};

export const PasswordStrength: Story = {
  render: () => {
    const [password, setPassword] = useState('');
    
    const getPasswordStrength = (pwd: string) => {
      if (pwd.length === 0) return { strength: 0, text: '', color: '' };
      if (pwd.length < 6) return { strength: 1, text: '弱い', color: 'text-red-600' };
      if (pwd.length < 8) return { strength: 2, text: '普通', color: 'text-orange-600' };
      if (pwd.length < 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
        return { strength: 3, text: '強い', color: 'text-green-600' };
      }
      if (pwd.length >= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd)) {
        return { strength: 4, text: 'とても強い', color: 'text-green-700' };
      }
      return { strength: 2, text: '普通', color: 'text-orange-600' };
    };

    const strength = getPasswordStrength(password);

    return (
      <div className="w-80 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            新しいパスワード
          </label>
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="安全なパスワードを入力してください"
          />
        </div>
        
        {password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">パスワード強度:</span>
              <span className={`text-sm font-medium ${strength.color}`}>
                {strength.text}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  strength.strength === 1 ? 'bg-red-500 w-1/4' :
                  strength.strength === 2 ? 'bg-orange-500 w-2/4' :
                  strength.strength === 3 ? 'bg-green-500 w-3/4' :
                  strength.strength === 4 ? 'bg-green-600 w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className={password.length >= 8 ? 'text-green-600' : ''}>
                ✓ 8文字以上
              </div>
              <div className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                ✓ 大文字を含む
              </div>
              <div className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                ✓ 数字を含む
              </div>
              <div className={/[!@#$%^&*]/.test(password) ? 'text-green-600' : ''}>
                ✓ 記号を含む
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const PasswordConfirmation: Story = {
  render: () => {
    const [passwords, setPasswords] = useState({
      password: '',
      confirmPassword: ''
    });
    
    const passwordsMatch = passwords.password && passwords.confirmPassword && 
      passwords.password === passwords.confirmPassword;
    const showMismatch = passwords.confirmPassword && !passwordsMatch;

    return (
      <div className="w-80 space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">パスワードを設定</h3>
          <p className="text-sm text-gray-600">
            アカウント作成の最終ステップです
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            パスワード
          </label>
          <PasswordField
            value={passwords.password}
            onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
            placeholder="パスワードを入力してください"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            パスワード確認
          </label>
          <PasswordField
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="もう一度パスワードを入力してください"
            className={showMismatch ? 'border-red-300 focus:ring-red-300' : ''}
          />
          {showMismatch && (
            <p className="mt-1 text-sm text-red-600">
              パスワードが一致しません
            </p>
          )}
          {passwordsMatch && (
            <p className="mt-1 text-sm text-green-600">
              ✓ パスワードが一致しています
            </p>
          )}
        </div>
        
        <button
          disabled={!passwordsMatch}
          className="w-full h-9 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          アカウントを作成
        </button>
      </div>
    );
  },
};