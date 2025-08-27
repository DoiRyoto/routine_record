import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="daily" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="daily">日次</TabsTrigger>
        <TabsTrigger value="weekly">週次</TabsTrigger>
        <TabsTrigger value="monthly">月次</TabsTrigger>
      </TabsList>
      <TabsContent value="daily" className="mt-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">今日のミッション</h3>
          <p>今日完了予定のミッションが表示されます。</p>
        </div>
      </TabsContent>
      <TabsContent value="weekly" className="mt-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">今週のミッション</h3>
          <p>今週完了予定のミッションが表示されます。</p>
        </div>
      </TabsContent>
      <TabsContent value="monthly" className="mt-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">今月のミッション</h3>
          <p>今月完了予定のミッションが表示されます。</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};