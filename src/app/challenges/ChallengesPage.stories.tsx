import type { Meta, StoryObj } from '@storybook/nextjs';

import type { UserChallenge } from '@/lib/db/schema';
import { getMockActiveChallenges } from '@/mocks/data/challenges';

import { ChallengesPage } from './ChallengesPage';

const meta: Meta<typeof ChallengesPage> = {
  title: 'Pages/ChallengesPage',
  component: ChallengesPage,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// モックデータを取得
const mockChallenges = getMockActiveChallenges();

const mockUserChallenges: UserChallenge[] = [
  {
    id: '1',
    userId: 'user1',
    challengeId: '1',
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    progress: 65,
    isCompleted: false,
    completedAt: null,
    rank: 23,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    userId: 'user1',
    challengeId: '2',
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    progress: 100,
    isCompleted: true,
    completedAt: new Date(),
    rank: 12,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const Default: Story = {
  args: {
    challenges: mockChallenges,
    userChallenges: mockUserChallenges,
  },
};

export const Empty: Story = {
  args: {
    challenges: [],
    userChallenges: [],
  },
};

export const AllJoined: Story = {
  args: {
    challenges: mockChallenges.filter(c => c.isActive),
    userChallenges: mockChallenges
      .filter(c => c.isActive)
      .map((challenge, index) => ({
        id: `user-${index + 1}`,
        userId: 'user1',
        challengeId: challenge.id,
        joinedAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
        progress: Math.floor(Math.random() * 100),
        isCompleted: Math.random() > 0.5,
        completedAt: Math.random() > 0.5 ? new Date() : null,
        rank: Math.floor(Math.random() * 100) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
  },
};

export const NoActiveChallenges: Story = {
  args: {
    challenges: mockChallenges.map(c => ({ ...c, isActive: false })),
    userChallenges: [],
  },
};

export const WeeklyOnly: Story = {
  args: {
    challenges: mockChallenges.filter(c => c.type === 'weekly'),
    userChallenges: mockUserChallenges.filter(uc => uc.challengeId === '2'),
  },
};

export const SpecialOnly: Story = {
  args: {
    challenges: mockChallenges.filter(c => c.type === 'special'),
    userChallenges: [],
  },
};