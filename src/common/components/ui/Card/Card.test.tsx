import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <div data-testid="card-content">Card Content</div>
        </Card>
      );
      
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('accepts custom className', () => {
      render(
        <Card className="custom-card-class">
          <div>Content</div>
        </Card>
      );
      
      const cardElement = screen.getByText('Content').parentElement;
      expect(cardElement).toHaveClass('custom-card-class');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null };
      render(
        <Card ref={ref}>
          <div>Content</div>
        </Card>
      );
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardHeader', () => {
    it('renders with proper styling', () => {
      render(
        <CardHeader data-testid="card-header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      );
      
      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('renders as heading with proper hierarchy', () => {
      render(
        <CardTitle>Card Title</CardTitle>
      );
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Card Title');
    });

    it('accepts custom className and props', () => {
      render(
        <CardTitle className="custom-title-class" data-testid="custom-title">
          Custom Title
        </CardTitle>
      );
      
      const title = screen.getByTestId('custom-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Custom Title');
      expect(title).toHaveClass('custom-title-class');
    });
  });

  describe('CardDescription', () => {
    it('renders description text', () => {
      render(
        <CardDescription>This is a card description</CardDescription>
      );
      
      expect(screen.getByText('This is a card description')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('renders content with proper styling', () => {
      render(
        <CardContent data-testid="card-content">
          <p>Main card content</p>
        </CardContent>
      );
      
      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Main card content');
    });
  });

  describe('CardFooter', () => {
    it('renders footer content', () => {
      render(
        <CardFooter data-testid="card-footer">
          <button>Action Button</button>
        </CardFooter>
      );
      
      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });
  });

  describe('Complete Card Structure', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This card has all components</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByRole('heading', { name: 'Complete Card' })).toBeInTheDocument();
      expect(screen.getByText('This card has all components')).toBeInTheDocument();
      expect(screen.getByText('Main content area')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Footer Button' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
            <CardDescription>Card with proper accessibility</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is accessible content</p>
          </CardContent>
          <CardFooter>
            <button type="button">Accessible Button</button>
          </CardFooter>
        </Card>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains proper heading hierarchy', () => {
      render(
        <div>
          <h1>Main Page Title</h1>
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
            </CardHeader>
          </Card>
        </div>
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Page Title');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Card Title');
    });
  });
});