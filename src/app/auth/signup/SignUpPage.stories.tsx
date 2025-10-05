import type { Meta, StoryObj } from '@storybook/nextjs';

import { AuthProvider } from '@/context/AuthContext';

import SignUpPage from './SignUpPage';

const meta = {
  title: 'Pages/Auth/SignUpPage',
  component: SignUpPage,
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
} satisfies Meta<typeof SignUpPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
