import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import SignInPageImproved from './SignInPageImproved';

// Mock useAuth
const mockSignIn = jest.fn();
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('SignInPage', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  describe('Rendering', () => {
    it('renders all form elements correctly', () => {
      render(<SignInPageImproved />);
      
      expect(screen.getByRole('heading', { name: 'サインイン' })).toBeInTheDocument();
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'サインイン' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'こちらから登録' })).toHaveAttribute('href', '/auth/signup');
    });

    it('has proper semantic structure', () => {
      render(<SignInPageImproved />);
      
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveAttribute('novalidate');
    });

    it('has proper heading hierarchy', () => {
      render(<SignInPageImproved />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('サインイン');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(<SignInPageImproved />);
      
      const submitButton = screen.getByRole('button', { name: 'サインイン' });
      expect(submitButton).toBeDisabled(); // Disabled due to validation initially
      
      // Try to type and delete to trigger validation
      const emailInput = screen.getByLabelText('メールアドレス');
      await user.type(emailInput, 'a');
      await user.clear(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      await user.type(emailInput, 'invalid-email');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
      });
    });

    it('shows validation error for short password', async () => {
      const user = userEvent.setup();
      render(<SignInPageImproved />);
      
      const passwordInput = screen.getByLabelText('パスワード');
      await user.type(passwordInput, '12345');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
      });
    });

    it('enables submit button when form is valid', async () => {
      const user = userEvent.setup();
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const submitButton = screen.getByRole('button', { name: 'サインイン' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('calls signIn with correct data on form submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });
      
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const submitButton = screen.getByRole('button', { name: 'サインイン' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('displays error message when sign in fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      mockSignIn.mockResolvedValue({ error: { message: errorMessage } });
      
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const submitButton = screen.getByRole('button', { name: 'サインイン' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toHaveTextContent(errorMessage);
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
      
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const submitButton = screen.getByRole('button', { name: 'サインイン' });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);
      
      // Check loading state
      expect(screen.getByText('サインイン中...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('サインイン中...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<SignInPageImproved />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('updates aria-invalid when validation fails', async () => {
      const user = userEvent.setup();
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      await user.type(emailInput, 'invalid');
      await user.tab();
      
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });

    it('supports keyboard navigation when form is valid', async () => {
      const user = userEvent.setup();
      render(<SignInPageImproved />);
      
      // Fill form with valid data first
      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Now test keyboard navigation
      await user.click(emailInput);
      expect(emailInput).toHaveFocus();
      
      // Tab to password
      await user.tab();
      expect(passwordInput).toHaveFocus();
      
      // Tab to submit button (should be enabled now)
      await user.tab();
      const submitButton = screen.getByRole('button', { name: 'サインイン' });
      expect(submitButton).toHaveFocus();
      expect(submitButton).not.toBeDisabled();
    });

    it('announces errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<SignInPageImproved />);
      
      const emailInput = screen.getByLabelText('メールアドレス');
      await user.type(emailInput, 'invalid');
      await user.tab();
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveTextContent('有効なメールアドレスを入力してください');
      });
    });
  });

  describe('Responsive Design', () => {
    it('has responsive container classes', () => {
      const { container } = render(<SignInPageImproved />);
      
      const mainContainer = container.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });
});