import type { Meta, StoryObj } from '@storybook/nextjs';

import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormSubmit,
} from './Form';

const meta: Meta<typeof Form> = {
  title: 'UI/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Form className="w-96 space-y-4">
      <FormField name="missionName">
        <FormLabel htmlFor="missionName">ミッション名</FormLabel>
        <FormControl 
          id="missionName"
          placeholder="例: 朝のジョギング" 
          required
        />
        <FormMessage match="valueMissing">
          ミッション名を入力してください
        </FormMessage>
      </FormField>

      <FormField name="description">
        <FormLabel htmlFor="description">説明（任意）</FormLabel>
        <FormControl 
          id="description"
          placeholder="ミッションの詳細を入力..." 
        />
      </FormField>

      <FormSubmit>ミッションを作成</FormSubmit>
    </Form>
  ),
};

export const LoginForm: Story = {
  render: () => (
    <Form className="w-80 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">ログイン</h2>
        <p className="text-gray-600 text-sm mt-2">
          アカウントにログインしてください
        </p>
      </div>

      <FormField name="email">
        <FormLabel htmlFor="email">メールアドレス</FormLabel>
        <FormControl 
          id="email"
          type="email"
          placeholder="your@example.com" 
          required
        />
        <FormMessage match="valueMissing">
          メールアドレスを入力してください
        </FormMessage>
        <FormMessage match="typeMismatch">
          有効なメールアドレスを入力してください
        </FormMessage>
      </FormField>

      <FormField name="password">
        <FormLabel htmlFor="password">パスワード</FormLabel>
        <FormControl 
          id="password"
          type="password"
          placeholder="パスワードを入力" 
          required
          minLength={8}
        />
        <FormMessage match="valueMissing">
          パスワードを入力してください
        </FormMessage>
        <FormMessage match="tooShort">
          パスワードは8文字以上で入力してください
        </FormMessage>
      </FormField>

      <FormSubmit className="w-full">ログイン</FormSubmit>
    </Form>
  ),
};

export const MissionForm: Story = {
  render: () => (
    <Form className="w-96 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold">新しいミッション</h2>
        <p className="text-gray-600 text-sm mt-1">
          日々の習慣を作りましょう
        </p>
      </div>

      <FormField name="name">
        <FormLabel htmlFor="name">ミッション名</FormLabel>
        <FormControl 
          id="name"
          placeholder="例: 毎朝のジョギング" 
          required
        />
        <FormMessage match="valueMissing">
          ミッション名を入力してください
        </FormMessage>
      </FormField>

      <FormField name="category">
        <FormLabel htmlFor="category">カテゴリ</FormLabel>
        <FormControl asChild>
          <select id="category" required>
          <option value="">カテゴリを選択してください</option>
          <option value="health">健康管理</option>
          <option value="study">学習・成長</option>
          <option value="work">仕事・キャリア</option>
          <option value="hobby">趣味・娯楽</option>
          <option value="life">生活・家事</option>
          </select>
        </FormControl>
        <FormMessage match="valueMissing">
          カテゴリを選択してください
        </FormMessage>
      </FormField>

      <FormField name="frequency">
        <FormLabel htmlFor="frequency">実行頻度</FormLabel>
        <FormControl asChild>
          <select id="frequency" required defaultValue="daily">
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
          <option value="monthly">毎月</option>
          </select>
        </FormControl>
      </FormField>

      <FormField name="description">
        <FormLabel htmlFor="description">説明（任意）</FormLabel>
        <FormControl asChild>
          <textarea
            id="description"
            placeholder="ミッションの詳細や目標を記入..." 
            rows={3}
            className="resize-none"
          />
        </FormControl>
      </FormField>

      <div className="flex gap-3">
        <button 
          type="button"
          className="flex-1 h-9 px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          キャンセル
        </button>
        <FormSubmit className="flex-1">作成する</FormSubmit>
      </div>
    </Form>
  ),
};