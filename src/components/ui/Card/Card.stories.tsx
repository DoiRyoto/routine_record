import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '../Button';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>毎日の読書</CardTitle>
        <CardDescription>30分間の読書習慣を続けましょう</CardDescription>
      </CardHeader>
      <CardContent>
        <p>今週の進捗: 5/7日完了</p>
        <div className="mt-2 h-2 bg-gray-200 rounded">
          <div className="h-2 bg-green-600 rounded" style={{ width: '71%' }} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">詳細</Button>
        <Button>記録する</Button>
      </CardFooter>
    </Card>
  ),
};