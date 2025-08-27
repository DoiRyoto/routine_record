import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxGroup } from './CheckboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'UI/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { label: '朝の運動', value: 'morning-exercise' },
  { label: '読書', value: 'reading' },
  { label: '瞑想', value: 'meditation' },
  { label: '英語学習', value: 'english-study' },
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

export const Horizontal: Story = {
  args: {
    options: defaultOptions,
    orientation: 'horizontal',
  },
};

export const Disabled: Story = {
  args: {
    options: defaultOptions,
    disabled: true,
    defaultValue: ['reading'],
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: [
      { label: '朝の運動', value: 'morning-exercise' },
      { label: '読書', value: 'reading', disabled: true },
      { label: '瞑想', value: 'meditation' },
      { label: '英語学習', value: 'english-study', disabled: true },
    ],
    defaultValue: ['morning-exercise'],
  },
};

export const ManyOptions: Story = {
  args: {
    options: [
      { label: '朝の運動', value: 'morning-exercise' },
      { label: '読書', value: 'reading' },
      { label: '瞑想', value: 'meditation' },
      { label: '英語学習', value: 'english-study' },
      { label: '家計簿記録', value: 'budget-tracking' },
      { label: 'プログラミング', value: 'programming' },
      { label: '料理', value: 'cooking' },
      { label: '掃除', value: 'cleaning' },
    ],
    orientation: 'horizontal',
  },
};