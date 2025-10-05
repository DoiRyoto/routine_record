import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '../Button/Button';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>A simple card with only content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This card has no footer</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Main content without a footer section.</p>
      </CardContent>
    </Card>
  ),
};

export const WithoutDescription: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title Only</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This card has no description in the header.</p>
      </CardContent>
    </Card>
  ),
};

export const WithMultipleButtons: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Confirm Action</CardTitle>
        <CardDescription>Are you sure you want to proceed?</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This action cannot be undone.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Long Content Example</CardTitle>
        <CardDescription>A card with more detailed content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>
            This is an example of a card with longer content. It can contain multiple paragraphs
            and other elements.
          </p>
          <p>
            The card will automatically adjust its height to fit the content while maintaining
            the design consistency.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Feature one</li>
            <li>Feature two</li>
            <li>Feature three</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="primary" className="w-full">Get Started</Button>
      </CardFooter>
    </Card>
  ),
};

export const FormCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-lg border border-gray/30 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray/30 px-3 py-2"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button variant="primary" className="w-full">Sign In</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardDescription>Total Routines</CardDescription>
        <CardTitle className="text-3xl">24</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray/70">+12% from last month</p>
      </CardContent>
    </Card>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <div className="flex max-w-[800px] flex-wrap gap-4">
      <Card className="min-w-[200px] flex-1">
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">1,234</p>
        </CardContent>
      </Card>
      <Card className="min-w-[200px] flex-1">
        <CardHeader>
          <CardTitle>Active Now</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">89</p>
        </CardContent>
      </Card>
      <Card className="min-w-[200px] flex-1">
        <CardHeader>
          <CardTitle>Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">567</p>
        </CardContent>
      </Card>
    </div>
  ),
};
