import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion';

const meta: Meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>基本的な使い方</AccordionTrigger>
        <AccordionContent>
          このアコーディオンは、コンテンツを折りたたんで表示できます。
          スペースを効率的に使いながら、必要な情報を整理して提示できます。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>ミッション管理</AccordionTrigger>
        <AccordionContent>
          日々の習慣をミッションとして管理し、継続的な成長をサポートします。
          小さな積み重ねが大きな変化に繋がります。
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>記録と振り返り</AccordionTrigger>
        <AccordionContent>
          実行記録を残すことで、自分の成長を可視化できます。
          データに基づいた振り返りで、より良い習慣作りを目指しましょう。
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};