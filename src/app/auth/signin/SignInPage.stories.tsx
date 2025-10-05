import type { Meta, StoryObj } from '@storybook/nextjs';

import { AuthProvider } from '@/context/AuthContext';

import SignInPage from './SignInPage';

const meta = {
  title: 'Pages/Auth/SignInPage',
  component: SignInPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof SignInPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
