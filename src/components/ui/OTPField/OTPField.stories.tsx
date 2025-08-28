import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { OTPField } from './OTPField';

const meta: Meta<typeof OTPField> = {
  title: 'UI/OTPField',
  component: OTPField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    length: {
      control: { type: 'number', min: 1, max: 10 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    length: 6,
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            認証コードを入力してください
          </label>
          <OTPField
            {...args}
            value={value}
            onChange={setValue}
          />
        </div>
        <div className="text-sm text-gray">
          入力値: {value || '（なし）'}
        </div>
      </div>
    );
  },
};

export const FourDigits: Story = {
  args: {
    length: 4,
  },
  render: (args) => {
    const [value, setValue] = useState('');
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            PINコードを入力してください
          </label>
          <OTPField
            {...args}
            value={value}
            onChange={setValue}
          />
        </div>
        <div className="text-sm text-gray">
          入力値: {value || '（なし）'}
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    length: 6,
    disabled: true,
    value: '123456',
  },
};

export const AuthenticationFlow: Story = {
  render: () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
      if (!email) return;
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      setStep(2);
    };

    const handleVerifyCode = async () => {
      if (otp.length !== 6) return;
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      setStep(3);
    };

    return (
      <div className="w-96 mx-auto">
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">認証コード送信</h2>
              <p className="text-gray text-sm mt-2">
                メールアドレスに認証コードを送信します
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@example.com"
                className="w-full h-9 px-3 py-1 rounded-md border border-gray focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={!email || isLoading}
              className="w-full h-9 px-4 py-2 bg-blue text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '送信中...' : '認証コードを送信'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">認証コード入力</h2>
              <p className="text-gray text-sm mt-2">
                {email} に送信されたコードを入力してください
              </p>
            </div>
            <div className="flex justify-center">
              <OTPField
                length={6}
                value={otp}
                onChange={setOtp}
              />
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={otp.length !== 6 || isLoading}
              className="w-full h-9 px-4 py-2 bg-blue text-white rounded-md hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '認証中...' : '認証する'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray hover:text-gray"
            >
              メールアドレスを変更する
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green">認証完了！</h2>
            <p className="text-gray">
              ミッション管理アプリへようこそ
            </p>
            <button
              onClick={() => {
                setStep(1);
                setEmail('');
                setOtp('');
              }}
              className="text-sm text-blue hover:text-blue"
            >
              最初からやり直す
            </button>
          </div>
        )}
      </div>
    );
  },
};