import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import Layout from './Layout';

jest.mock('./Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Mock Header</header>;
  };
});

describe('Layout', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Layout>
          <div data-testid="child-content">Test Content</div>
        </Layout>
      );
      
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders Header component', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      render(
        <Layout>
          <div>Main Content</div>
        </Layout>
      );
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveTextContent('Main Content');
    });
  });

  describe('Styling', () => {
    it('applies correct layout classes', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      const layoutDiv = container.firstChild as Element;
      expect(layoutDiv).toHaveClass('min-h-screen', 'bg-gray', 'dark:bg-dark-gray');
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-6');
    });

    it('supports dark mode classes', () => {
      const { container } = render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      const layoutDiv = container.firstChild as Element;
      expect(layoutDiv).toHaveClass('dark:bg-dark-gray');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <Layout>
          <h1>Page Title</h1>
          <p>Page content</p>
        </Layout>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper landmark structure', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('has responsive container classes', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('container', 'mx-auto', 'px-4');
    });
  });
});