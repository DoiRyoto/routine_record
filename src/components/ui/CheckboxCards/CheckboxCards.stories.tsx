import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxCards } from './CheckboxCards';

const meta: Meta<typeof CheckboxCards> = {
  title: 'UI/CheckboxCards',
  component: CheckboxCards,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: { type: 'select' },
      options: [1, 2, 3, 4],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { 
    label: '朝の運動', 
    value: 'morning-exercise',
    description: '毎日の健康維持のための運動習慣'
  },
  { 
    label: '読書', 
    value: 'reading',
    description: '知識向上と集中力向上のための読書時間'
  },
  { 
    label: '瞑想', 
    value: 'meditation',
    description: '心の平穏と集中力向上のための瞑想'
  },
  { 
    label: '英語学習', 
    value: 'english-study',
    description: '語学スキル向上のための継続的な学習'
  },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
  },
};

export const WithDefaultValue: Story = {
  args: {
    options: defaultOptions,
    defaultValue: ['reading', 'meditation'],
  },
};

export const TwoColumns: Story = {
  args: {
    options: defaultOptions,
    columns: 2,
  },
};

export const ThreeColumns: Story = {
  args: {
    options: [
      ...defaultOptions,
      { 
        label: '家計簿記録', 
        value: 'budget-tracking',
        description: '家計管理と節約のための記録習慣'
      },
      { 
        label: 'プログラミング', 
        value: 'programming',
        description: 'スキル向上のためのコーディング練習'
      },
    ],
    columns: 3,
  },
};

export const WithoutDescriptions: Story = {
  args: {
    options: [
      { label: '朝の運動', value: 'morning-exercise' },
      { label: '読書', value: 'reading' },
      { label: '瞑想', value: 'meditation' },
      { label: '英語学習', value: 'english-study' },
    ],
    columns: 2,
  },
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    disabled: true,
    defaultValue: ['reading'],
    columns: 2,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { 
        label: '朝の運動', 
        value: 'morning-exercise',
        description: '毎日の健康維持のための運動習慣'
      },
      { 
        label: '読書', 
        value: 'reading',
        description: '知識向上と集中力向上のための読書時間',
        disabled: true
      },
      { 
        label: '瞑想', 
        value: 'meditation',
        description: '心の平穏と集中力向上のための瞑想'
      },
      { 
        label: '英語学習', 
        value: 'english-study',
        description: '語学スキル向上のための継続的な学習',
        disabled: true
      },
    ],
    columns: 2,
    defaultValue: ['morning-exercise'],
  },
};